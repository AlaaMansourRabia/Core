// Scenario Forge — backend.
// Serves the dashboard AND drives the real generation pipeline + wireframe-review gate, writing
// plan.json so the polling dashboard reflects live state. No dependencies (Node http only).
//
//   node server.mjs            # http://localhost:5273
//
// Pipeline per scenario:  pending → running (map → ladder → wireframe) → review → (approve) → done
// With "skip reviews" on, the review gate is auto-approved:  pending → running → done.
import http from "http";
import fs from "fs";
import path from "path";
import {spawn, execFileSync} from "child_process";
import {fileURLToPath} from "url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const PLAN_PATH = path.join(DIR, "plan.json");
const WF_DIR = path.join(DIR, "wireframes");
const REVIEW_DIR = path.join(DIR, "reviews"); // per-scenario chat + wireframe version history
const BUILD_DIR = path.join(DIR, "built"); // generated scenario pages (the "product" build artifacts)
const PORT = Number(process.env.PORT) || 5273;
fs.mkdirSync(WF_DIR, {recursive: true});
fs.mkdirSync(REVIEW_DIR, {recursive: true});
fs.mkdirSync(BUILD_DIR, {recursive: true});

let PLAN = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));
if (!PLAN.settings) PLAN.settings = {reviewMode: "review"}; // review | skip
// Pipeline: pending → running → review → approved → building → built. "approved" = wireframe signed
// off; "built" = a real page exists. (Migrate the older "done" = approved-wireframe state.)
PLAN.scenarios.forEach((s) => { if (s.status === "done") s.status = "approved"; });

// Target app the builds connect INTO. Configurable in plan.json → `target`. Default: the Capture
// prototype that scenario-forge lives inside (its parent). When connected, built pages are copied to
// the app's public dir and a tiny dev-only overlay renders them at {mountUrl}?scenario={id}.
if (!PLAN.target) PLAN.target = {root: "..", mountUrl: "http://localhost:5180", publicSubdir: "__scenarios__", connected: false};
const TARGET_ROOT = path.resolve(DIR, PLAN.target.root || "..");
const TARGET_MAIN = path.join(TARGET_ROOT, "src", "main.tsx");
const TARGET_MOUNT = path.join(TARGET_ROOT, "src", "__scenario_mount__.tsx");
const TARGET_PUBLIC = path.join(TARGET_ROOT, "public", PLAN.target.publicSubdir || "__scenarios__");
const MOUNT_SRC = `// SCENARIO-FORGE — dev-only overlay. When the URL has ?scenario=<id>, it renders the generated
// scenario page (served from /${PLAN.target.publicSubdir || "__scenarios__"}/<id>.html) over the app.
// To uninstall: delete this file, remove its import line in main.tsx, and delete the public/${PLAN.target.publicSubdir || "__scenarios__"} folder.
const __sfId = new URLSearchParams(location.search).get("scenario");
if (__sfId && import.meta.env.DEV) {
	const mount = () => {
		if (document.getElementById("sf-overlay")) return;
		const o = document.createElement("div");
		o.id = "sf-overlay";
		o.style.cssText = "position:fixed;inset:0;z-index:2147483000;background:#fff;display:flex;flex-direction:column";
		o.innerHTML =
			'<div style="display:flex;align-items:center;gap:10px;padding:6px 12px;background:#0b0e14;color:#e6ebf5;font:12px system-ui,sans-serif">' +
			'<b>Scenario Forge</b><span style="opacity:.65">' + __sfId + '</span>' +
			'<a href="' + location.pathname + '" style="margin-left:auto;color:#e6ebf5;text-decoration:none;border:1px solid #2a3346;border-radius:6px;padding:3px 9px">Exit \\u2715</a></div>' +
			'<iframe src="/${PLAN.target.publicSubdir || "__scenarios__"}/' + __sfId + '.html" style="flex:1;border:0;width:100%"></iframe>';
		document.body.appendChild(o);
	};
	if (document.body) mount(); else addEventListener("DOMContentLoaded", mount);
}
export {};
`;
const copyBuiltToTargetForce = (id) => {
	const src = path.join(BUILD_DIR, id + ".html");
	if (fs.existsSync(src)) {
		try { fs.mkdirSync(TARGET_PUBLIC, {recursive: true}); fs.copyFileSync(src, path.join(TARGET_PUBLIC, id + ".html")); } catch {}
	}
};
const copyBuiltToTarget = (id) => { if (PLAN.target.connected) copyBuiltToTargetForce(id); };
const persist = () => fs.writeFileSync(PLAN_PATH, JSON.stringify(PLAN, null, 2));
const byId = (id) => PLAN.scenarios.find((s) => s.id === id);
const screenLabel = (id) => (PLAN.screens.find((s) => s.id === id) || {}).label || id;
persist();

let runningNow = false;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── wireframe generation (deterministic, from scenario metadata) ─────────────────────────────────
function layoutFor(s) {
	const t = (s.title || "").toLowerCase();
	if (s.caseType === "wall") return s.role === "noaccess" || t.includes("no access") ? "locked" : "readonly";
	if (s.caseType === "blocked") return "empty";
	if (s.screen === "site") {
		if (t.includes("schematic")) return "schematic";
		if (t.includes("blueprint")) return "blueprint";
		if (t.includes("timeline") || t.includes("colouring") || t.includes("flat")) return "model-note";
		return "model";
	}
	if (s.screen === "boq") return s.caseType === "degraded" ? "table-unpriced" : "table";
	if (s.screen === "progress-details") return s.caseType === "degraded" ? "tree" : "tree";
	if (s.screen === "earned-value") return "chart";
	if (s.screen === "reports") return "matrix";
	return "generic";
}
const box = (h, label) => `<div class="wf-box" style="height:${h}px">${label ? `<span>${label}</span>` : ""}</div>`;
const row = (n, h = 26) => `<div class="wf-rows">${Array.from({length: n}, () => `<div class="wf-row" style="height:${h}px"></div>`).join("")}</div>`;
const squares = (rows, cols) =>
	`<div class="wf-grid">${Array.from({length: rows * cols}, (_, i) => `<span class="wf-sq ${i % 3 ? "on" : ""}"></span>`).join("")}</div>`;

function bodyFor(s) {
	switch (layoutFor(s)) {
		case "model": return `${box(360, "3D MODEL — Cesium canvas")}<p class="wf-hint">Click a part → drills into house-level BIM (schedule · inspector · 4D timeline).</p>`;
		case "model-note": return `${box(320, "3D MODEL")}<div class="wf-note">Facet caption: ${s.asset} unavailable — model still renders, one facet thinned.</div>`;
		case "blueprint": return `<div class="wf-split"><div class="wf-side">${box(300, "SHEET NAV")}</div><div class="wf-main">${box(300, "2D BLUEPRINT — plan sheets, EV metrics")}</div></div><div class="wf-note">Fallback rung: 3D model unavailable → 2D blueprint of the same plans.</div>`;
		case "schematic": return `<div class="wf-split3"><div class="wf-side">${box(280, "FLOOR / SCHEDULE / LBS")}</div><div class="wf-main">${squares(6, 8)}</div><div class="wf-side">${box(280, "FLOOR INSPECTOR")}</div></div><div class="wf-note">Fallback rung: no model/blueprints → schematic squares. Clicking a floor opens the SAME schedule + inspector, no 3D.</div>`;
		case "table": return `<div class="wf-kpis">${Array.from({length: 6}, () => box(52)).join("")}</div>${row(6, 24)}`;
		case "table-unpriced": return `<div class="wf-kpis">${Array.from({length: 6}, () => box(52)).join("")}</div>${row(6, 24)}<div class="wf-note">Degraded rung: ${s.asset} unavailable → amounts/allocation columns greyed, quantities still shown.</div>`;
		case "tree": return `<div class="wf-split"><div class="wf-side">${box(320, "WBS TREE")}</div><div class="wf-main">${row(5, 40)}</div></div>${s.caseType === "degraded" ? `<div class="wf-note">Degraded: ${s.asset} unavailable — tree renders, one facet thinned.</div>` : ""}`;
		case "chart": return `${box(300, "S-CURVE — PV / EV / AC")}<div class="wf-kpis">${Array.from({length: 4}, () => box(52)).join("")}</div>`;
		case "matrix": return `<div class="wf-grid big">${Array.from({length: 30}, (_, i) => `<span class="wf-sq ${i % 4 ? "" : "on"}"></span>`).join("")}</div>`;
		case "readonly": return `<div class="wf-banner">READ-ONLY — actions disabled</div>${row(5)}`;
		case "locked": return `<div class="wf-empty">🔒 No access — surface not reachable for this role</div>`;
		case "empty": return `<div class="wf-empty">Terminal empty — ${s.asset || "prerequisite"} required<br><small>${s.provider || ""}</small></div>`;
		default: return row(5);
	}
}

function wireframeHTML(s) {
	return `<!doctype html><meta charset=utf8><title>WF · ${s.id}</title><style>
  body{margin:0;font:13px/1.4 ui-sans-serif,system-ui,sans-serif;background:#f6f7f9;color:#1f2733}
  .wf-top{display:flex;align-items:center;gap:10px;padding:10px 16px;background:#fff;border-bottom:1px solid #dfe3ea}
  .wf-crumb{font-weight:600}.wf-chip{font-size:10px;text-transform:uppercase;letter-spacing:.4px;border:1px solid #cdd3dd;border-radius:5px;padding:2px 7px;color:#5b6472}
  .wf-chip.happy{color:#178a4c;border-color:#9fe0bb}.wf-chip.degraded{color:#a86a00;border-color:#f0cf90}.wf-chip.blocked{color:#b3261e;border-color:#f0a9a4}.wf-chip.wall{color:#1c62c4;border-color:#a8c6f0}
  .wf-wrap{padding:16px;max-width:1000px;margin:0 auto}.wf-title{font-size:16px;font-weight:600;margin:2px 0 12px}
  .wf-box{border:1.5px dashed #b7bfcb;border-radius:8px;background:repeating-linear-gradient(45deg,#eef1f5,#eef1f5 10px,#e7ebf1 10px,#e7ebf1 20px);display:flex;align-items:center;justify-content:center;color:#7a8493;font-size:11px;letter-spacing:.5px;margin-bottom:10px}
  .wf-rows{display:flex;flex-direction:column;gap:6px}.wf-row{background:#e7ebf1;border-radius:5px}
  .wf-kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:10px}
  .wf-grid{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.wf-grid.big{max-width:520px}.wf-sq{width:22px;height:22px;border-radius:4px;border:1px solid #cdd3dd;background:#e7ebf1}.wf-sq.on{background:#9fe0bb;border-color:#5cc088}
  .wf-split{display:grid;grid-template-columns:230px 1fr;gap:12px}.wf-split3{display:grid;grid-template-columns:220px 1fr 240px;gap:12px}
  .wf-note{margin-top:12px;padding:10px 12px;border-left:3px solid #f0b400;background:#fff8e6;border-radius:6px;color:#7a5c00;font-size:12px}
  .wf-banner{padding:8px 12px;background:#eaf1fb;border:1px solid #a8c6f0;border-radius:6px;color:#1c62c4;margin-bottom:10px;font-weight:600}
  .wf-empty{border:1.5px dashed #b7bfcb;border-radius:10px;padding:48px;text-align:center;color:#7a8493;background:#fff}
  .wf-hint{color:#7a8493;font-size:12px;margin-top:4px}.wf-watermark{position:fixed;bottom:8px;right:12px;color:#b7bfcb;font-size:10px;letter-spacing:1px}
</style>
<div class="wf-top"><span class="wf-crumb">Capture / ${screenLabel(s.screen)}</span><span class="wf-chip">${s.role}</span><span class="wf-chip ${s.caseType}">${s.caseType}</span></div>
<div class="wf-wrap"><div class="wf-title">${s.title}</div>${bodyFor(s)}${s.asset && s.caseType !== "happy" && layoutFor(s) !== "empty" ? "" : ""}</div>
<div class="wf-watermark">WIREFRAME — for review</div>`;
}

function writeWireframe(s) {
	fs.writeFileSync(path.join(WF_DIR, s.id + ".html"), wireframeHTML(s));
	s.wireframe = `wireframes/${s.id}.html`;
}

// ── review sidecar: chat history + wireframe versions ────────────────────────────────────────────
const reviewPath = (id) => path.join(REVIEW_DIR, id + ".json");
function loadReview(id) {
	const f = reviewPath(id);
	if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
	const wf = path.join(WF_DIR, id + ".html");
	const html = fs.existsSync(wf) ? fs.readFileSync(wf, "utf8") : "";
	const r = {chat: [], versions: [{note: "Initial wireframe", html}], current: 0};
	fs.writeFileSync(f, JSON.stringify(r));
	return r;
}
const saveReview = (id, r) => fs.writeFileSync(reviewPath(id), JSON.stringify(r));
const setCurrentWireframe = (id, r) => fs.writeFileSync(path.join(WF_DIR, id + ".html"), r.versions[r.current].html);
const versionList = (r) => r.versions.map((v) => ({note: v.note}));

// ── Claude (uses the user's authenticated CLI / subscription) ────────────────────────────────────
let claudeBusy = false;
function askClaude(prompt, opts = {}) {
	return new Promise((resolve, reject) => {
		const cp = spawn("claude", ["-p", prompt, "--output-format", "json"], {cwd: opts.cwd || DIR});
		let out = "", err = "";
		const to = setTimeout(() => { cp.kill("SIGKILL"); reject(new Error("claude timed out")); }, opts.timeout || 180000);
		cp.stdout.on("data", (d) => (out += d));
		cp.stderr.on("data", (d) => (err += d));
		cp.on("error", (e) => { clearTimeout(to); reject(e); });
		cp.on("close", (code) => {
			clearTimeout(to);
			if (code !== 0) return reject(new Error(err || "claude exit " + code));
			try { resolve(JSON.parse(out).result || out); } catch { resolve(out); }
		});
	});
}
// Wireframes for OTHER scenarios the user may reference ("match the admin one", "like the reviewer
// wireframe"). Same-screen siblings are included in full; the rest as a name index Claude can search.
function referenceContext(s) {
	const wfExists = (id) => fs.existsSync(path.join(WF_DIR, id + ".html"));
	const sibs = PLAN.scenarios.filter((x) => x.screen === s.screen && x.id !== s.id && wfExists(x.id));
	const full = sibs.map((x) => {
		let html = "";
		try { html = loadReview(x.id).versions[loadReview(x.id).current].html; } catch { html = ""; }
		return `----- REFERENCE WIREFRAME  id=${x.id} · role=${x.role} · case=${x.caseType} · status=${x.status} · "${x.title}" -----\n${html}`;
	}).join("\n\n");
	const others = PLAN.scenarios
		.filter((x) => x.screen !== s.screen && wfExists(x.id))
		.map((x) => `${x.id} (${screenLabel(x.screen)} · ${x.role} · ${x.caseType} · "${x.title}")`)
		.join("\n");
	return {full, others};
}
function buildPrompt(s, currentHtml, chat, message) {
	const hist = chat.slice(-8).map((m) => `${m.role === "user" ? "USER" : "YOU"}: ${m.text}`).join("\n") || "(none)";
	const ref = referenceContext(s);
	const refBlock =
		(ref.full ? `\nOTHER WIREFRAMES ON THIS SCREEN (you may reference or copy from these when the user asks — e.g. "match the admin one"):\n${ref.full}\n` : "") +
		(ref.others ? `\nWIREFRAMES ON OTHER SCREENS (names only — if the user references one, say you'd need it opened, or work from the name):\n${ref.others}\n` : "");
	return `You are a UI design collaborator working on ONE low-fidelity HTML WIREFRAME for an internal construction tool called "Capture". A wireframe is a self-contained standalone HTML document with INLINE CSS only, in a greyscale "wireframe" aesthetic (dashed/hatched boxes, muted labels), used to agree layout & direction BEFORE the real page is built.

SCENARIO
- Screen: ${screenLabel(s.screen)}
- Role: ${s.role}
- Case type: ${s.caseType}  (happy = full page; degraded = a lower-fidelity fallback that STILL shows the same real information; blocked = terminal empty state; wall = permission wall)
- Missing input: ${s.asset || "none"}${s.provider ? ` — supplied by ${s.provider}` : ""}
- Intent: ${s.title}

CURRENT WIREFRAME (the full HTML file):
\`\`\`html
${currentHtml}
\`\`\`

${refBlock}
CONVERSATION SO FAR:
${hist}

USER MESSAGE:
${message}

HOW TO RESPOND
- If the user is ASKING A QUESTION or discussing direction: answer concisely and helpfully in a few sentences. Do NOT output any HTML.
- If the user is asking to CHANGE the wireframe: first give a one-line summary of what you changed, then output the COMPLETE updated wireframe as a SINGLE \`\`\`html fenced code block containing the whole standalone HTML file (inline CSS, same low-fi wireframe style, keep the top breadcrumb/role/case chips and the "WIREFRAME — for review" watermark). Output exactly one \`\`\`html block and nothing after it. Never put prose inside the HTML.`;
}
function parseReply(text) {
	let m = text.match(/```html\s*([\s\S]*?)```/i);
	if (!m) m = text.match(/```\s*(<!doctype[\s\S]*?)```/i);
	if (m) { const html = m[1].trim(); const reply = text.replace(m[0], "").trim() || "Updated the wireframe."; return {reply, html}; }
	return {reply: text.trim(), html: null};
}

// ── generation runner ────────────────────────────────────────────────────────────────────────────
async function setStep(s, step) { s.step = step; persist(); await wait(450 + Math.random() * 350); }
async function runGeneration() {
	if (runningNow) return;
	runningNow = true;
	const skip = () => (PLAN.settings.reviewMode || "review") === "skip";
	const queue = PLAN.scenarios.filter((s) => s.status === "pending");
	let idx = 0;
	const worker = async () => {
		while (idx < queue.length) {
			const s = queue[idx++];
			s.status = "running";
			await setStep(s, "Mapping happy flow…");
			await setStep(s, "Designing fallback ladder…");
			await setStep(s, "Recreating the flow…");
			await setStep(s, "Drafting wireframe…");
			writeWireframe(s);
			if (skip()) {
				s.status = "approved"; s.step = null; persist();
			} else {
				s.status = "review"; s.step = "Wireframe ready — awaiting approval"; persist();
			}
			await wait(150);
		}
	};
	await Promise.all([worker(), worker(), worker()]);
	runningNow = false;
}

// ── product build: approved wireframe → a higher-fidelity standalone scenario page (built/{id}.html) ──
let buildBusy = false;
function buildPagePrompt(s, wireframeHtml) {
	return `Turn this APPROVED low-fidelity wireframe into a HIGHER-FIDELITY, realistic standalone HTML page for the "${screenLabel(s.screen)}" screen of a construction tool called Capture (role: ${s.role}, case: ${s.caseType}${s.asset ? `, missing input: ${s.asset} — ${s.provider || ""}` : ""}).

Make it look like a real product screen — NOT wireframe boxes: a clean light UI, believable sample data, real tables / cards / badges / KPI tiles / empty-states as the layout implies, and keep any fallback or permission messaging the wireframe shows. Preserve the SAME layout and intent as the wireframe. It must be a single SELF-CONTAINED standalone HTML document with INLINE CSS only (no external assets/scripts). Output ONLY the complete HTML inside one \`\`\`html fenced block.

APPROVED WIREFRAME:
\`\`\`html
${wireframeHtml}
\`\`\``;
}
// The flow safe-point lets restore-flows.sh revert the app; create it before the first flow build.
function ensureFlowSafepoint() {
	const sp = path.join(DIR, ".flow-safepoint.tgz");
	if (!fs.existsSync(sp)) { try { execFileSync("tar", ["czf", sp, "src"], {cwd: TARGET_ROOT}); } catch {} }
}
const typechecksOk = () => { try { execFileSync("pnpm", ["-s", "typecheck"], {cwd: TARGET_ROOT, stdio: "ignore"}); return true; } catch { return false; } };
function nativeBuildPrompt(s, wireframeHtml) {
	return `Use the "scenario-forge" skill (read ~/.claude/skills/scenario-forge/SKILL.md + its reference/ docs). Build scenario "${s.id}" (${screenLabel(s.screen)} · ${s.role} · ${s.caseType}${s.asset ? `, missing: ${s.asset} — ${s.provider}` : ""}) as a REAL, NATIVE, REMOVABLE flow inside THIS app so that http://localhost:5180/?scenario=${s.id} renders it natively (real app shell + the scenario state).

Honor the skill's methodology (Representation Fallback Ladder; recreate the full flow; protect the happy flow) and its removability contract: ALL new code under src/scenario/, minimal // scenario-forge:flow-marked edits to existing files, and the app byte-identical when there is no ?scenario= param. A flow safe-point already exists. If src/scenario/ already exists, just extend its registry + the target screen's branch (do NOT rebuild the harness). Match this APPROVED WIREFRAME:

\`\`\`html
${wireframeHtml}
\`\`\`

Run \`pnpm typecheck\` and fix until it passes. Only edit inside this app folder.`;
}
// Skill-driven build: runs the scenario-forge skill (via the user's Claude) to add a removable native
// flow to the target app, then verifies with typecheck (one fix-retry). ?scenario={id} then renders natively.
async function buildOne(id) {
	const s = byId(id);
	if (!s) return;
	s.status = "building"; s.step = "Running scenario-forge skill…"; persist();
	try {
		ensureFlowSafepoint();
		const r = loadReview(id);
		s.step = "Building flow into the app…"; persist();
		await askClaude(nativeBuildPrompt(s, r.versions[r.current].html), {cwd: TARGET_ROOT, timeout: 900000});
		s.step = "Verifying (typecheck)…"; persist();
		if (!typechecksOk()) {
			s.step = "Fixing typecheck…"; persist();
			await askClaude("The scenario-forge flow just added to src/scenario has TypeScript errors. Run `pnpm typecheck`, fix ALL errors within the src/scenario flow (never change the happy flow), and confirm it passes.", {cwd: TARGET_ROOT, timeout: 600000});
			if (!typechecksOk()) throw new Error("typecheck failed after build");
		}
		s.builtNative = true; delete s.builtUrl; s.status = "built"; s.step = null; persist();
	} catch (e) {
		s.status = "error"; s.step = String(e.message || e); persist();
	}
}
async function buildProduct(ids) {
	if (buildBusy) return;
	buildBusy = true;
	try { for (const id of ids) await buildOne(id); } finally { buildBusy = false; }
}

// ── http ─────────────────────────────────────────────────────────────────────────────────────────
const CT = {".html": "text/html", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".css": "text/css", ".js": "text/javascript"};
const readBody = (req) => new Promise((res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { try { res(b ? JSON.parse(b) : {}); } catch { res({}); } }); });

const server = http.createServer(async (req, res) => {
	const url = new URL(req.url, "http://x");
	const p = url.pathname;

	// API
	if (p.startsWith("/api/")) {
		const action = p.slice(5);
		const body = req.method === "POST" ? await readBody(req) : {};
		const json = (o) => { res.writeHead(200, {"content-type": "application/json"}); res.end(JSON.stringify(o)); };
		if (action === "state") return json({ok: true, running: runningNow, settings: PLAN.settings});
		if (action === "run") { runGeneration(); return json({ok: true}); }
		if (action === "settings") {
			if (body.reviewMode) PLAN.settings.reviewMode = body.reviewMode;
			// turning skip on clears the pending review gate
			if (PLAN.settings.reviewMode === "skip") PLAN.scenarios.forEach((s) => { if (s.status === "review") { s.status = "approved"; s.step = null; } });
			persist(); return json({ok: true, settings: PLAN.settings});
		}
		if (action === "approve") { const s = byId(body.id); if (s && s.status === "review") { s.status = "approved"; s.step = null; persist(); } return json({ok: !!s}); }
		if (action === "approve-all") { PLAN.scenarios.forEach((s) => { if (s.status === "review") { s.status = "approved"; s.step = null; } }); persist(); return json({ok: true}); }
		if (action === "build") {
			if (buildBusy) return json({ok: false, error: "a build is already running"});
			const ids = body.id ? [body.id] : PLAN.scenarios.filter((s) => s.status === "approved").map((s) => s.id);
			if (!ids.length) return json({ok: false, error: "nothing approved to build"});
			buildProduct(ids); // async; writes plan as it goes
			return json({ok: true, building: ids.length});
		}
		// ── connect the builds INTO the target app (reversible) ──
		if (action === "target") return json({ok: true, target: PLAN.target, targetRoot: TARGET_ROOT});
		if (action === "connect") {
			try {
				if (!fs.existsSync(TARGET_MAIN)) return json({ok: false, error: `no ${path.relative(DIR, TARGET_MAIN)} — set target.root in plan.json`});
				let main = fs.readFileSync(TARGET_MAIN, "utf8");
				if (!main.includes("__scenario_mount__")) {
					if (!fs.existsSync(TARGET_MAIN + ".sf-bak")) fs.writeFileSync(TARGET_MAIN + ".sf-bak", main); // safe-point
					const lines = main.split("\n");
					let last = 0; lines.forEach((l, i) => { if (/^\s*import\s/.test(l)) last = i; });
					lines.splice(last + 1, 0, 'import "./__scenario_mount__"; // scenario-forge:mount');
					fs.writeFileSync(TARGET_MAIN, lines.join("\n"));
				}
				fs.writeFileSync(TARGET_MOUNT, MOUNT_SRC);
				fs.mkdirSync(TARGET_PUBLIC, {recursive: true});
				PLAN.scenarios.forEach((s) => copyBuiltToTargetForce(s.id));
				PLAN.target.connected = true; persist();
				return json({ok: true, target: PLAN.target});
			} catch (e) { return json({ok: false, error: String(e.message || e)}); }
		}
		if (action === "disconnect") {
			try {
				if (fs.existsSync(TARGET_MAIN + ".sf-bak")) { fs.copyFileSync(TARGET_MAIN + ".sf-bak", TARGET_MAIN); fs.rmSync(TARGET_MAIN + ".sf-bak"); }
				else if (fs.existsSync(TARGET_MAIN)) fs.writeFileSync(TARGET_MAIN, fs.readFileSync(TARGET_MAIN, "utf8").split("\n").filter((l) => !l.includes("scenario-forge:mount")).join("\n"));
				if (fs.existsSync(TARGET_MOUNT)) fs.rmSync(TARGET_MOUNT);
				if (fs.existsSync(TARGET_PUBLIC)) fs.rmSync(TARGET_PUBLIC, {recursive: true, force: true});
				PLAN.target.connected = false; persist();
				return json({ok: true, target: PLAN.target});
			} catch (e) { return json({ok: false, error: String(e.message || e)}); }
		}
		if (action === "reject") { const s = byId(body.id); if (s) { s.status = "pending"; s.step = null; s.reviewNote = body.note || ""; persist(); } return json({ok: !!s}); }
		if (action === "reset") {
			PLAN.scenarios.forEach((s) => { if (s.status !== "existing") { s.status = "pending"; s.step = null; delete s.wireframe; } });
			persist(); return json({ok: true});
		}
		if (action === "remove-flows") {
			if (buildBusy) return json({ok: false, error: "a build is running — wait for it to finish"});
			try { execFileSync("bash", [path.join(DIR, "restore-flows.sh")], {cwd: TARGET_ROOT, stdio: "ignore"}); }
			catch (e) { return json({ok: false, error: String(e.message || e)}); }
			PLAN.scenarios.forEach((s) => { if (["built", "building", "error"].includes(s.status)) { s.status = "approved"; s.step = null; delete s.builtUrl; delete s.builtNative; } });
			if (PLAN.target) PLAN.target.connected = false;
			persist(); return json({ok: true});
		}
		// ── wireframe chat + version history ──
		if (action === "review") { const r = loadReview(url.searchParams.get("id")); return json({ok: true, chat: r.chat, versions: versionList(r), current: r.current}); }
		if (action === "version") {
			const r = loadReview(url.searchParams.get("id"));
			const v = Number(url.searchParams.get("v"));
			const html = (r.versions[v] || r.versions[r.current] || {}).html || "";
			res.writeHead(200, {"content-type": "text/html", "cache-control": "no-store"}); return res.end(html);
		}
		if (action === "revert") {
			const r = loadReview(body.id);
			if (r.versions[body.v]) { r.current = body.v; setCurrentWireframe(body.id, r); saveReview(body.id, r); }
			return json({ok: true, current: r.current, versions: versionList(r)});
		}
		if (action === "chat") {
			const s = byId(body.id);
			if (!s) return json({ok: false, error: "unknown scenario"});
			if (claudeBusy) return json({ok: false, error: "busy — one request at a time"});
			claudeBusy = true;
			const r = loadReview(body.id);
			try {
				const out = await askClaude(buildPrompt(s, r.versions[r.current].html, r.chat, body.message || ""));
				const {reply, html} = parseReply(out);
				r.chat.push({role: "user", text: body.message || ""});
				r.chat.push({role: "assistant", text: reply});
				let updated = false;
				if (html) { r.versions.push({note: reply.slice(0, 90) || "Edit", html}); r.current = r.versions.length - 1; setCurrentWireframe(body.id, r); updated = true; }
				saveReview(body.id, r);
				return json({ok: true, reply, updated, current: r.current, versions: versionList(r)});
			} catch (e) {
				return json({ok: false, error: String(e.message || e)});
			} finally { claudeBusy = false; }
		}
		res.writeHead(404); return res.end("no api");
	}

	// serve plan.json live from memory (always fresh)
	if (p === "/plan.json") { res.writeHead(200, {"content-type": "application/json", "cache-control": "no-store"}); return res.end(JSON.stringify(PLAN)); }

	// static
	let file = path.join(DIR, decodeURIComponent(p === "/" ? "/dashboard.html" : p));
	if (!file.startsWith(DIR)) { res.writeHead(403); return res.end(); }
	fs.readFile(file, (err, data) => {
		if (err) { res.writeHead(404); return res.end("not found"); }
		res.writeHead(200, {"content-type": CT[path.extname(file)] || "application/octet-stream", "cache-control": "no-store"});
		res.end(data);
	});
});
server.listen(PORT, () => console.log(`Scenario Forge → http://localhost:${PORT}  (reviewMode: ${PLAN.settings.reviewMode})`));
