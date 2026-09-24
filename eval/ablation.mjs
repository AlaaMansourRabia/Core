#!/usr/bin/env node
// V2 ablation runner — attribute the lift to a specific knowledge layer.
//
// Runs each task through a LADDER of arms (A0..A4), k times per arm, and grades every
// generation with the deterministic validators. The incremental lift between adjacent arms
// is attributable to the one layer that arm adds:
//   A0→A1  structural package facts (the FAIR baseline starts at A1)
//   A1→A2  semantic catalog            → component-SELECTION judgment
//   A2→A3  composition skill+patterns  → screen-COMPOSITION ability
//   A3→A4  failure modes+domain skill  → implementation knowledge
//
// Usage:
//   ANTHROPIC_API_KEY=sk-... node eval/ablation.mjs            # full: arms A0..A4, k=5
//   node eval/ablation.mjs --arms=A1,A2,A4 --k=10              # subset of arms / more reps
//   node eval/ablation.mjs --tasks=side-panel,data-grid       # subset of tasks
//   node eval/ablation.mjs --dry                              # NO api: verify arm layering only
//
// Output: eval/results/ablation.json + ablation.md (committed).

import Anthropic from "@anthropic-ai/sdk";
import {existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from "node:fs";
import {basename, dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {gradeSnippet, loadCatalog} from "../scripts/validators/index.mjs";
import {gradeCompile} from "./graders/compile.mjs";
import {gradeRender} from "./graders/render.mjs";
import {ARMS, systemForArm, userPrompt} from "./lib/prompts.mjs";

const evalDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(evalDir, "..");
const tasksDir = join(evalDir, "tasks");
const resultsDir = join(evalDir, "results");
const MODEL = "claude-opus-4-8";
// First-class metrics: structure (the deterministic validators, rolled up), compile (tsc against
// the real built types), render (render-smoke mount). overall = all three pass.
const METRICS = ["structure", "compile", "render"];

const argVal = (name, fallback) => {
	const a = process.argv.find((x) => x.startsWith(`--${name}=`));
	return a ? a.slice(name.length + 3) : fallback;
};
const DRY = process.argv.includes("--dry");
const ARM_SET = argVal("arms", ARMS.join(",")).split(",");
const K = Number(argVal("k", "5"));
const TASK_FILTER = argVal("tasks", "");
// --taskdir accepts one OR MORE comma-separated dirs, so a pilot can reuse tasks across suites
// (e.g. eval/tasks,eval/tasks-v3) without copying any task files. --out overrides the output
// basename. Results write to ablation-<...>.{json,md}; the default suite stays ablation.*.
const TASK_DIR_ARG = argVal("taskdir", "");
const resolveDir = (d) => (d.startsWith("/") ? d : join(repoRoot, d));
const taskDirs = TASK_DIR_ARG ? TASK_DIR_ARG.split(",").map(resolveDir) : [tasksDir];
const outBase = argVal("out", "") || (TASK_DIR_ARG ? `ablation-${basename(taskDirs[0])}` : "ablation");
// The A2–A4 arms carry the full catalog/skills (~70–90k input tokens each). Org rate limits
// are per-minute on INPUT tokens, so keep concurrency low; the SDK backs off on 429/529.
const CONCURRENCY = Number(argVal("concurrency", "2"));

let _client;
// maxRetries lets the SDK ride out 429 (rate limit) and 529 (overloaded) with exponential
// backoff that honors the `retry-after` header — so a transient burst doesn't fail the run.
const client = () => (_client ??= new Anthropic({maxRetries: 8}));

function loadTasks() {
	const ids = TASK_FILTER ? new Set(TASK_FILTER.split(",")) : null;
	const out = [];
	for (const dir of taskDirs) {
		for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
			const t = JSON.parse(readFileSync(join(dir, f), "utf8"));
			if (!ids || ids.has(t.id)) out.push(t);
		}
	}
	return out;
}

// Grade one generation across all first-class metrics. structure rolls up the deterministic
// validators; compile/render are behavioral. A skipped behavioral grader does not penalize.
async function gradeAll(code, task, catalog) {
	const s = gradeSnippet(code, task, catalog);
	const c = gradeCompile(code);
	const r = await gradeRender(code);
	const metrics = {
		structure: s.pass,
		compile: c.skipped ? true : Boolean(c.compiles),
		render: r.skipped ? true : Boolean(r.pass),
	};
	return {
		metrics,
		pass: metrics.structure && metrics.compile && metrics.render,
		detail: {
			structure: {pass: s.pass, findings: s.findings},
			compile: {pass: metrics.compile, compiles: c.compiles, resolves: c.resolves, reason: c.reason, diagnostics: c.diagnostics ?? []},
			render: {pass: metrics.render, reason: r.reason, skipped: Boolean(r.skipped)},
		},
	};
}

// Persist one generation so a run is fully auditable: raw model output, the extracted code,
// and every grader finding (tsc diagnostics + render-smoke error). Lands under the gitignored
// eval/results/runs/<run>/ so we never again infer failure causes from older runs.
function persistGeneration(dir, job, rawText, code, g) {
	const base = `${job.task.id}.${job.arm}.r${job.rep}`;
	writeFileSync(join(dir, `${base}.raw.md`), rawText);
	writeFileSync(join(dir, `${base}.tsx`), code);
	writeFileSync(
		join(dir, `${base}.findings.json`),
		`${JSON.stringify({task: job.task.id, arm: job.arm, rep: job.rep, pass: g.pass, metrics: g.metrics, ...g.detail}, null, 2)}\n`,
	);
}

function extractCode(text) {
	const fenced = text.match(/```(?:tsx?|jsx?)?\s*\n([\s\S]*?)```/);
	return (fenced ? fenced[1] : text).trim();
}

async function generate(system, prompt) {
	const stream = client().messages.stream({
		model: MODEL,
		max_tokens: 16000,
		thinking: {type: "adaptive"},
		output_config: {effort: "high"},
		// Cost optimization only: the system prompt is large (~60k-token catalog/skills) and
		// byte-identical across calls of the same arm+domain. Marking it ephemeral caches the
		// prefix — the model sees the SAME bytes and cache hits return identical output, so this
		// changes price, not what is measured.
		system: [{type: "text", text: system, cache_control: {type: "ephemeral"}}],
		messages: [{role: "user", content: prompt}],
	});
	const message = await stream.finalMessage();
	const text = message.content
		.filter((b) => b.type === "text")
		.map((b) => b.text)
		.join("");
	return {text, usage: message.usage};
}

async function pool(items, size, worker) {
	const results = new Array(items.length);
	let next = 0;
	async function lane() {
		while (next < items.length) {
			const i = next++;
			results[i] = await worker(items[i], i);
		}
	}
	await Promise.all(Array.from({length: Math.min(size, items.length)}, lane));
	return results;
}

// Wilson score interval for a binomial proportion — correct near 0 and 1 (unlike normal approx).
function wilson(x, n, z = 1.96) {
	if (n === 0) return {rate: 0, lo: 0, hi: 0};
	const p = x / n;
	const d = 1 + (z * z) / n;
	const center = p + (z * z) / (2 * n);
	const half = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
	return {rate: p, lo: Math.max(0, (center - half) / d), hi: Math.min(1, (center + half) / d)};
}

const pctText = (w) => `${Math.round(w.rate * 100)}% [${Math.round(w.lo * 100)}–${Math.round(w.hi * 100)}]`;

// ---------------------------------------------------------------------------
// DRY mode: verify the pipeline wiring WITHOUT spending tokens — (1) arm layering,
// (2) the structure/compile/render graders run end-to-end and discriminate good from bad code.
async function runDry(catalog, tasks) {
	const task = tasks[0];
	console.log(`Dry-run wiring on task "${task.id}" (${task.domain})\n`);
	const arms = [...ARMS, "A5"];
	const sys = {};
	for (const arm of arms) sys[arm] = systemForArm(arm, task, catalog);

	console.log("Arm layering:");
	for (const arm of arms) console.log(`  ${arm}: ${sys[arm].length.toLocaleString()} chars`);

	const checks = [
		["A1 exposes deep-path imports (fair baseline)", sys.A1.includes("@corensystem/coren-ui/button")],
		["A1 withholds selection judgment (no chooseOver)", !sys.A1.includes("chooseOver")],
		["A1 does not editorialize the barrel rule", !/never.*barrel|barrel.*undefined/i.test(sys.A1)],
		["A2 adds semantic judgment (chooseOver)", sys.A2.includes("chooseOver")],
		["A3 adds composition patterns", sys.A3.includes("Composition patterns")],
		["A4 adds failure modes", sys.A4.includes("Known failure modes")],
		["A4 unchanged: no contract layer", !sys.A4.includes("Component API contracts")],
		["A5 adds prop/type contracts", sys.A5.includes("Component API contracts") && sys.A5.includes("activeStep")],
		["monotonic A0<A1<A2<A3<A4<A5", sys.A0.length < sys.A1.length && sys.A1.length < sys.A2.length && sys.A2.length < sys.A3.length && sys.A3.length < sys.A4.length && sys.A4.length < sys.A5.length],
	];
	let ok = true;
	for (const [label, pass] of checks) {
		console.log(`  ${pass ? "✓" : "✗"} ${label}`);
		ok = ok && pass;
	}

	// Grader wiring: a known-good and known-bad snippet through structure/compile/render. The
	// good one should pass all three; the bad one (barrel import → undefined component) should
	// fail all three. Proves the metrics run and discriminate, offline.
	console.log("\nGrader wiring (offline — structure / compile / render):");
	const probes = [
		{label: "good (deep import, renders)", task: {expected: ["Button"]}, code: 'import { Button } from "@corensystem/coren-ui/button";\nexport default function Demo() {\n  return <Button>Save</Button>;\n}\n'},
		{label: "bad (barrel import)", task: {expected: ["Button"]}, code: 'import { Button } from "@corensystem/coren-ui";\nexport default function Demo() {\n  return <Button>Save</Button>;\n}\n'},
	];
	const seen = {};
	for (const p of probes) {
		try {
			const g = await gradeAll(p.code, p.task, catalog);
			seen[p.label] = g.metrics;
			console.log(`  ${p.label.padEnd(28)} structure=${g.metrics.structure} compile=${g.metrics.compile} render=${g.metrics.render} → overall=${g.pass}`);
			if (g.detail.render?.reason) console.log(`      render: ${g.detail.render.reason}`);
		} catch (err) {
			ok = false;
			console.log(`  ✗ ${p.label} — grader threw: ${err.message}`);
		}
	}
	// Discrimination sanity: good must out-pass bad on the behavioral metrics.
	const good = seen["good (deep import, renders)"];
	const bad = seen["bad (barrel import)"];
	const discriminates = good && bad && good.compile && good.render && !bad.compile && !bad.render;
	console.log(`  ${discriminates ? "✓" : "✗"} graders discriminate good vs bad (compile + render)`);
	ok = ok && Boolean(discriminates);

	// Capture wiring: persist a sample generation offline and confirm the audit files are written.
	console.log("\nCapture wiring (offline):");
	const capDir = join(resultsDir, "runs", "_dry-capture-check");
	try {
		mkdirSync(capDir, {recursive: true});
		const g = await gradeAll(probes[0].code, probes[0].task, catalog);
		persistGeneration(capDir, {task: {id: "probe"}, arm: "A5", rep: 0}, "raw output", probes[0].code, g);
		const fj = JSON.parse(readFileSync(join(capDir, "probe.A5.r0.findings.json"), "utf8"));
		const capOk =
			existsSync(join(capDir, "probe.A5.r0.tsx")) &&
			existsSync(join(capDir, "probe.A5.r0.raw.md")) &&
			Array.isArray(fj.compile?.diagnostics) &&
			"metrics" in fj;
		console.log(`  ${capOk ? "✓" : "✗"} per-generation artifacts written (code + raw + findings incl. tsc diagnostics)`);
		ok = ok && capOk;
	} catch (err) {
		ok = false;
		console.log(`  ✗ capture threw: ${err.message}`);
	} finally {
		rmSync(capDir, {recursive: true, force: true});
	}

	console.log(`\n${ok ? "PASS — arm layering (A1–A4 unchanged, A5 adds contracts) + grader + capture wiring verified." : "FAIL — see above."}`);
	process.exit(ok ? 0 : 1);
}

async function main() {
	const catalog = loadCatalog();
	const tasks = loadTasks();
	if (DRY) return await runDry(catalog, tasks);

	// Build the full job list: every (task, arm, rep).
	const jobs = [];
	for (const task of tasks) for (const arm of ARM_SET) for (let rep = 0; rep < K; rep++) jobs.push({task, arm, rep});
	console.log(`Ablation: ${tasks.length} tasks × ${ARM_SET.length} arms × k=${K} = ${jobs.length} calls (${MODEL})...`);

	// Auditable run dir (gitignored under results/runs/): one raw output + code + findings per call.
	const stamp = new Date().toISOString().replace(/[:.]/g, "-");
	const runDir = join(resultsDir, "runs", `${outBase}-${stamp}`);
	mkdirSync(runDir, {recursive: true});

	let done = 0;
	let failed = 0;
	const cache = {read: 0, write: 0, uncached: 0}; // verify prompt caching is working
	const graded = await pool(jobs, CONCURRENCY, async (job) => {
		try {
			const {text, usage} = await generate(systemForArm(job.arm, job.task, catalog), userPrompt(job.task));
			cache.read += usage?.cache_read_input_tokens ?? 0;
			cache.write += usage?.cache_creation_input_tokens ?? 0;
			cache.uncached += usage?.input_tokens ?? 0;
			const code = extractCode(text);
			const g = await gradeAll(code, job.task, catalog);
			persistGeneration(runDir, job, text, code, g);
			if (++done % 25 === 0) console.log(`  ${done}/${jobs.length} done (${failed} failed)`);
			return {arm: job.arm, taskId: job.task.id, metrics: g.metrics, pass: g.pass};
		} catch (err) {
			// One bad call (rate limit after retries, overloaded, etc.) skips its cell — it
			// must NOT abort the whole run. The arm's n shrinks; Wilson CIs widen honestly.
			failed += 1;
			console.warn(`  ! ${job.arm}/${job.task.id} rep${job.rep} failed: ${err.status ?? err.name} ${err.message?.slice(0, 80) ?? ""}`);
			return null;
		}
	});

	const ok = graded.filter(Boolean);
	if (failed) console.warn(`\n${failed}/${jobs.length} calls failed and were skipped (results are partial).`);
	if (ok.length === 0) throw new Error("All calls failed — check rate limits / API key; nothing to aggregate.");

	// Aggregate per (arm, metric): passes over the SUCCESSFUL (tasks × k) for that arm.
	const agg = {};
	for (const arm of ARM_SET) {
		agg[arm] = {n: 0, overall: 0};
		for (const m of METRICS) agg[arm][m] = 0;
	}
	for (const r of ok) {
		agg[r.arm].n += 1;
		if (r.pass) agg[r.arm].overall += 1;
		for (const m of METRICS) if (r.metrics[m]) agg[r.arm][m] += 1;
	}

	const cells = {};
	for (const arm of ARM_SET) {
		cells[arm] = {overall: wilson(agg[arm].overall, agg[arm].n)};
		for (const m of METRICS) cells[arm][m] = wilson(agg[arm][m], agg[arm].n);
	}

	writeFileSync(
		join(resultsDir, `${outBase}.json`),
		`${JSON.stringify({model: MODEL, k: K, arms: ARM_SET, tasks: tasks.map((t) => t.id), agg, cells}, null, 2)}\n`,
	);
	writeFileSync(join(resultsDir, `${outBase}.md`), buildMd(cells));

	console.log(`\nWrote eval/results/${outBase}.json + ${outBase}.md`);
	console.log(`Auditable per-generation artifacts (raw + code + findings): ${join("eval/results/runs", `${outBase}-${stamp}`)}/`);
	for (const arm of ARM_SET) console.log(`  ${arm} overall: ${pctText(cells[arm].overall)}`);
	const cachedPct = cache.read + cache.write > 0 ? Math.round((cache.read / (cache.read + cache.write + cache.uncached)) * 100) : 0;
	console.log(
		`\nCache: ${cache.read.toLocaleString()} read · ${cache.write.toLocaleString()} written · ${cache.uncached.toLocaleString()} uncached input tokens (${cachedPct}% served from cache)`,
	);
}

function buildMd(cells) {
	const arms = ARM_SET;
	const cols = [...METRICS, "overall"]; // structure · compile · render · overall
	const head = `| Arm | ${cols.join(" | ")} |`;
	const sep = `| --- | ${cols.map(() => "---").join(" | ")} |`;
	const rows = arms.map((a) => `| ${a} | ${cols.map((m) => pctText(cells[a][m])).join(" | ")} |`);

	const ATTR = {"A1>A0": "structural facts", "A2>A1": "**selection** (semantic catalog)", "A3>A2": "**composition** (skill+patterns)", "A4>A3": "**impl knowledge** (failure modes)"};
	const liftRows = [];
	for (let i = 1; i < arms.length; i++) {
		const lo = arms[i - 1];
		const hi = arms[i];
		const key = `${hi}>${lo}`;
		const diffs = cols.map((m) => {
			const d = Math.round((cells[hi][m].rate - cells[lo][m].rate) * 100);
			return `${d >= 0 ? "+" : ""}${d}`;
		});
		liftRows.push(`| ${lo}→${hi} (${ATTR[key] ?? ""}) | ${diffs.join(" | ")} |`);
	}

	return [
		"# Core ablation — which knowledge layer earns the lift",
		"",
		"Pass-rate per arm (Wilson 95% CI). The **fair control is A1** (structural package facts a real developer has); A0 is the legacy information-starved reference only.",
		"",
		head,
		sep,
		...rows,
		"",
		"## Incremental lift (percentage points, with the layer each step adds)",
		"",
		`| Step | ${cols.join(" | ")} |`,
		`| --- | ${cols.map(() => "---").join(" | ")} |`,
		...liftRows,
		"",
		"> Metrics: **structure** = the deterministic validators (component-choice / imports / provider-wiring / failure-mode, rolled up); **compile** = `tsc` against the real built `@corensystem/coren-ui` types; **render** = render-smoke mount. **overall** = all three pass.",
		"> render-smoke is a *server-render floor* (mounts + non-empty markup); it does not run effects or browser-only APIs — full browser fidelity is a V3 follow-up.",
		"> A claim is only supported when the lift's CI lower bound clears 0 (see `eval/V2-PLAN.md` §6).",
		"",
	].join("\n");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
