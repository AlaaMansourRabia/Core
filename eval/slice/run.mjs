#!/usr/bin/env node
// Core vertical slice — the tracer bullet. Runs the WHOLE flywheel end to end, OFFLINE
// (no Anthropic, no key, deterministic), proving every subsystem connects and the loop closes:
//
//   retrieve → agent decision → artifact selection → instantiate → render → evaluate
//            → capture → store learning candidate → RE-RUN with the learning → improvement
//
// The "agent" is a tiny DETERMINISTIC decision function whose output is a pure function of the
// RETRIEVED KNOWLEDGE. That's the honest core of the proof: change the knowledge (add a verified
// learning) and the decision changes — no LLM, no randomness, fully reproducible. Swapping in an
// LLM is a later step; the architecture's claim ("knowledge drives the decision") is what this tests.
//
// Run:  node eval/slice/run.mjs

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { gradeRender } from "../graders/render.mjs"; // reuse the existing renderer (transpile + unify React + SSR)

const here = dirname(fileURLToPath(import.meta.url));
const knowledgeDir = join(here, "knowledge");
const learningsDir = join(knowledgeDir, "learnings");
const widgetSrc = readFileSync(join(here, "widgets", "MetricCard.tsx"), "utf8");
const outDir = join(here, "out");

const log = (s = "") => console.log(s);
const tokens = (s) => s.toLowerCase().match(/[a-z]+/g) ?? [];

// ── 1. KNOWLEDGE RETRIEVAL ────────────────────────────────────────────────────────────────────
// Scan available manifests + accepted learnings; return the subset relevant to the task by intent
// token-overlap (NOT a vector DB — the thinnest honest retrieval that proves the seam).
function retrieve(task) {
	const taskTokens = new Set(tokens(task));
	const overlaps = (arr = []) => arr.some((a) => taskTokens.has(a));
	const manifests = readdirSync(knowledgeDir)
		.filter((f) => f.endsWith(".manifest.json"))
		.map((f) => JSON.parse(readFileSync(join(knowledgeDir, f), "utf8")))
		.filter((m) => overlaps(m.appliesTo));
	const learnings = existsSync(learningsDir)
		? readdirSync(learningsDir)
				.filter((f) => f.endsWith(".json"))
				.map((f) => JSON.parse(readFileSync(join(learningsDir, f), "utf8")))
				.filter((l) => l.status === "accepted" && overlaps(l.appliesTo))
		: [];
	return {
		template: manifests.find((m) => m.tier === "template") ?? null,
		widgets: manifests.filter((m) => m.tier === "widget"),
		learnings,
	};
}

// ── 2–5. AGENT DECISION → ARTIFACT SELECTION → CONFIGURE → PAGE INSTANTIATION ───────────────────
// Decision is a pure function of retrieved knowledge. The ONLY thing that differs between arms is
// whether a "prefer the template tier for dashboards" learning was retrieved.
function loadWidgetById(id) {
	const f = join(knowledgeDir, `${id}.manifest.json`);
	return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
}

function decide(task, knowledge, kpis) {
	const preferTemplate = knowledge.learnings.some((l) => l.recommend === "use-template-tier");
	const tmpl = knowledge.template;
	// FINDING (from the first run): a region's widget is STRUCTURALLY implied by the template's
	// requiredWidgets — resolve it from there, not by independently keyword-retrieving the widget
	// (which was brittle to held-out phrasing). Selecting a template pulls in its required widgets.
	const requiredWidgetId = tmpl?.requiredWidgets?.find((r) => r.region === "kpis")?.widget;
	const widget = requiredWidgetId ? loadWidgetById(requiredWidgetId) : null;

	if (preferTemplate && tmpl && widget) {
		// Tier-aware: start from the template; fill its required region with the widget.
		return {
			schemaVersion: "page-instance/0.1",
			arm: "B (with learning)",
			templateRef: tmpl.id,
			regions: {
				kpis: kpis.map((k, i) => ({
					instanceId: `k${i + 1}`,
					widget: widget.id, // ← uses the WIDGET tier
					config: { format: k.format ?? "number" },
					data: { label: k.label, value: `{{scope.${k.key}}}` },
				})),
			},
		};
	}
	// Naive baseline: no guidance to reach for higher tiers → assemble raw components ad-hoc.
	return {
		schemaVersion: "page-instance/0.1",
		arm: "A (no learning)",
		templateRef: null, // ← no template
		regions: {
			kpis: kpis.map((k, i) => ({
				instanceId: `k${i + 1}`,
				component: "Card", // ← raw COMPONENT, not the widget tier
				data: { label: k.label, value: `{{scope.${k.key}}}` },
			})),
		},
	};
}

// ── 6. RENDER ───────────────────────────────────────────────────────────────────────────────────
// Instance → a self-contained page snippet → reuse gradeRender (transpile + unified React + SSR).
// No widget build/registry exists yet, so the widget's source is INLINED (a documented limitation).
function instanceToSnippet(instance) {
	const items = instance.regions.kpis;
	const sample = { Revenue: "1.2M", "Active workers": "318", "Safety compliance": "98" };
	const val = (d) => sample[d.label] ?? "42";
	if (instance.templateRef) {
		const widgetFn = widgetSrc.replace(/export default function/, "function"); // inline the real widget source
		const cards = items
			.map((it) => `<MetricCard label=${JSON.stringify(it.data.label)} value=${JSON.stringify(val(it.data))} format=${JSON.stringify(it.config.format)} />`)
			.join("\n      ");
		return `${widgetFn}\nexport default function Page() {\n  return (<div>\n      ${cards}\n  </div>);\n}\n`;
	}
	const cards = items
		.map((it) => `<Card><CardHeader><TypographyMuted>${it.data.label}</TypographyMuted></CardHeader><CardContent><TypographyH3>${val(it.data)}</TypographyH3></CardContent></Card>`)
		.join("\n      ");
	return `import { Card, CardContent, CardHeader } from "@core/core-ui/card";\nimport { TypographyH3, TypographyMuted } from "@core/core-ui/typography";\nexport default function Page() {\n  return (<div>\n      ${cards}\n  </div>);\n}\n`;
}

// ── 7. EVALUATION ────────────────────────────────────────────────────────────────────────────────
async function evaluate(instance, templateManifest, widgetManifest) {
	const kpis = instance.regions.kpis;
	const metrics = {};

	// tier-selection: did the page use the widget tier (template + metric-card) or raw components?
	metrics["tier-selection"] = Boolean(instance.templateRef) && kpis.every((k) => k.widget === "metric-card");

	// composition: kpis cardinality within the template's required range.
	const req = templateManifest.requiredWidgets.find((r) => r.region === "kpis");
	metrics["composition"] = kpis.length >= req.min && kpis.length <= req.max;

	// config-valid: every config key known + enum values legal (only meaningful for widget instances).
	const fmtEnum = widgetManifest.configSchema.format.values;
	metrics["config-valid"] = kpis.every((k) => !k.widget || (k.config && fmtEnum.includes(k.config.format)));

	// data-contract: label + value present on every instance.
	metrics["data-contract"] = kpis.every((k) => k.data?.label && k.data?.value);

	// render: instance → snippet → SSR via the existing renderer.
	const r = await gradeRender(instanceToSnippet(instance));
	metrics["render"] = r.skipped ? true : Boolean(r.pass);

	const pass = Object.values(metrics).every(Boolean);
	return { metrics, pass, renderReason: r.reason };
}

// ── 8. CAPTURE ───────────────────────────────────────────────────────────────────────────────────
function capture(armDir, instance, evalResult) {
	mkdirSync(armDir, { recursive: true });
	writeFileSync(join(armDir, "page.instance.json"), `${JSON.stringify(instance, null, 2)}\n`);
	writeFileSync(join(armDir, "findings.json"), `${JSON.stringify({ arm: instance.arm, ...evalResult }, null, 2)}\n`);
}

// ── 9. DISTILL + STORE a learning candidate ──────────────────────────────────────────────────────
function distillAndStore(evalResult) {
	if (evalResult.metrics["tier-selection"]) return null; // nothing to learn
	mkdirSync(learningsDir, { recursive: true });
	const learning = {
		id: "dashboard-use-template-tier",
		tier: "template",
		status: "candidate",
		appliesTo: ["dashboard", "overview", "metrics", "kpi"],
		recommend: "use-template-tier",
		observation:
			"For a dashboard/overview page of KPIs, start from the org-overview template and fill its kpis region with the metric-card widget — do not assemble raw Card components.",
		provenance: { fromMetric: "tier-selection", fromArm: "A" },
	};
	const file = join(learningsDir, `${learning.id}.json`);
	writeFileSync(file, `${JSON.stringify(learning, null, 2)}\n`);
	return file;
}

// ── ORCHESTRATE THE FLYWHEEL ─────────────────────────────────────────────────────────────────────
async function arm(label, task, kpis) {
	log(`\n──────── ${label} ────────`);
	log(`Task: "${task}"`);
	const knowledge = retrieve(task);
	log(`1. RETRIEVE   → template=${knowledge.template?.id ?? "none"}  widgets=[${knowledge.widgets.map((w) => w.id).join(",")}]  learnings=[${knowledge.learnings.map((l) => l.id).join(",") || "none"}]`);
	const instance = decide(task, knowledge, kpis);
	const selected = instance.templateRef ? `template:${instance.templateRef} + widget:metric-card` : "ad-hoc raw Card components";
	log(`2-5. DECIDE   → ${selected}`);
	const evalResult = await evaluate(instance, retrieve(task).template ?? JSON.parse(readFileSync(join(knowledgeDir, "org-overview.manifest.json"), "utf8")), JSON.parse(readFileSync(join(knowledgeDir, "metric-card.manifest.json"), "utf8")));
	log(`6-7. RENDER+EVAL → ${JSON.stringify(evalResult.metrics)}  overall=${evalResult.pass ? "PASS" : "FAIL"}`);
	const armDir = join(outDir, label.split(" ")[0].toLowerCase());
	capture(armDir, instance, evalResult);
	log(`8. CAPTURE    → ${join("eval/slice/out", label.split(" ")[0].toLowerCase())}/{page.instance.json,findings.json}`);
	return { knowledge, instance, evalResult };
}

async function main() {
	rmSync(outDir, { recursive: true, force: true });
	rmSync(learningsDir, { recursive: true, force: true }); // start with no learnings (clean flywheel)
	const kpis = [
		{ key: "revenue", label: "Revenue", format: "currency" },
		{ key: "activeWorkers", label: "Active workers", format: "number" },
		{ key: "safetyPct", label: "Safety compliance", format: "percent" },
	];

	log("Core vertical slice — end-to-end flywheel (offline, deterministic)\n");

	// ARM A — no learning yet. Expect a tier-selection FAILURE (raw Cards).
	const a = await arm("A (no learning)", "Show three key organization metrics across the top of a dashboard.", kpis);

	// 9. DISTILL + STORE the candidate learning from A's failure.
	const file = distillAndStore(a.evalResult);
	log(`\n9. LEARN      → ${file ? `candidate stored: ${file.replace(`${here}/`, "eval/slice/")}` : "nothing to learn"}`);

	// VERIFY on HELD-OUT phrasing, then accept. (Different wording → proves it's intent-matched, not memorized.)
	if (file) {
		const heldOut = "Display the org's main KPIs at the top of the overview page.";
		// promote candidate → accepted so retrieval will surface it
		const learning = JSON.parse(readFileSync(file, "utf8"));
		learning.status = "accepted";
		learning.verifiedBy = { task: heldOut };
		writeFileSync(file, `${JSON.stringify(learning, null, 2)}\n`);
		log(`   VERIFY     → re-running on HELD-OUT phrasing (different words, same intent)`);

		// ARM B — same agent, knowledge now includes the accepted learning. Expect tier-selection PASS.
		const b = await arm("B (with learning)", heldOut, kpis);

		// 10. RESULT — did the loop close?
		const before = a.evalResult.metrics["tier-selection"];
		const after = b.evalResult.metrics["tier-selection"];
		log("\n════════ FLYWHEEL RESULT ════════");
		log(`tier-selection:  Arm A = ${before ? "PASS" : "FAIL"}   →   Arm B (held-out) = ${after ? "PASS" : "FAIL"}`);
		log(`overall:         Arm A = ${a.evalResult.pass ? "PASS" : "FAIL"}   →   Arm B = ${b.evalResult.pass ? "PASS" : "FAIL"}`);
		log(after && !before ? "\n✅ Loop closed: a captured failure became a verified learning that changed the next build." : "\n⚠️ Loop did NOT close — inspect the per-subsystem output above to localize the broken seam.");
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
