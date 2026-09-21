#!/usr/bin/env node
// A/B eval runner — the "proof agents are learning" harness.
//
// For each task fixture it runs two arms (without-skills baseline vs with-skills) through
// the SAME deterministic graders from scripts/validators/, then reports the pass-rate
// lift the knowledge layer produces. The graders were proven correct in P1a, so the
// numbers here measure the catalog, not the grader.
//
// Two modes:
//   pnpm eval              live — calls Claude (needs ANTHROPIC_API_KEY). Writes raw
//                          generations to results/runs/<timestamp>/ (gitignored).
//   pnpm eval --fixture    offline — grades stored snippets in eval/fixtures/. No API
//                          key, no cost. Exercises the validators + scorecard pipeline
//                          end-to-end so the harness can be debugged before spending money.
//
// Output (both modes): eval/results/latest.json + summary.md (committed).

import Anthropic from "@anthropic-ai/sdk";
import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {gradeSnippet, loadCatalog} from "../scripts/validators/index.mjs";
import {baselineSystem, skilledSystem, userPrompt} from "./lib/prompts.mjs";

const evalDir = dirname(fileURLToPath(import.meta.url));
const tasksDir = join(evalDir, "tasks");
const fixturesDir = join(evalDir, "fixtures");
const resultsDir = join(evalDir, "results");

// Three modes:
//   live                    calls Claude (needs ANTHROPIC_API_KEY) → results/latest.*
//   --fixture               grades stored eval/fixtures/ snippets   → results/fixture-selftest.*
//   --regrade=<runDir>      re-grades raw generations from a prior live run → results/latest.*
//                           (no API calls — recomputes the scorecard after grader changes).
const REGRADE_ARG = process.argv.find((a) => a.startsWith("--regrade="));
const REGRADE_DIR = REGRADE_ARG ? REGRADE_ARG.slice("--regrade=".length) : null;
const MODE = process.argv.includes("--fixture") ? "fixture" : REGRADE_DIR ? "regrade" : "live";
const MODEL = "claude-opus-4-8";
const CONCURRENCY = 4;
const METRICS = ["component-choice", "imports", "provider-wiring", "failure-mode"];

// Lazy so --fixture mode never constructs a client or needs a key.
let _client;
const client = () => (_client ??= new Anthropic()); // resolves ANTHROPIC_API_KEY from env

function loadTasks() {
	return readdirSync(tasksDir)
		.filter((f) => f.endsWith(".json"))
		.sort()
		.map((f) => JSON.parse(readFileSync(join(tasksDir, f), "utf8")));
}

/** Pull the first fenced code block; fall back to the whole text. */
function extractCode(text) {
	const fenced = text.match(/```(?:tsx?|jsx?)?\s*\n([\s\S]*?)```/);
	return (fenced ? fenced[1] : text).trim();
}

/** Live: one model call. Streams (avoids HTTP timeouts on longer generations). */
async function generate(system, prompt) {
	const stream = client().messages.stream({
		model: MODEL,
		max_tokens: 16000,
		thinking: {type: "adaptive"},
		output_config: {effort: "high"},
		system,
		messages: [{role: "user", content: prompt}],
	});
	const message = await stream.finalMessage();
	const text = message.content
		.filter((b) => b.type === "text")
		.map((b) => b.text)
		.join("");
	return {text, usage: message.usage};
}

/** Offline: read a stored generation for this task/arm (fixture self-test, or regrade dir). */
function loadStored(dir, task, arm) {
	return {text: readFileSync(join(dir, `${task.id}.${arm}.tsx`), "utf8"), usage: null};
}

/** Run one arm of one task: get a generation → extract code → grade. */
async function runArm(task, arm, catalog) {
	const system = arm === "with" ? skilledSystem(task, catalog) : baselineSystem();
	const {text, usage} =
		MODE === "fixture"
			? loadStored(fixturesDir, task, arm)
			: MODE === "regrade"
				? loadStored(REGRADE_DIR, task, arm)
				: await generate(system, userPrompt(task));
	const code = extractCode(text);
	const graded = gradeSnippet(code, task, catalog);
	return {arm, code, rawText: text, usage, metrics: graded.metrics, pass: graded.pass, findings: graded.findings};
}

/** Minimal concurrency pool so 20 calls don't run all at once. */
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

function emptyTally() {
	const t = {total: 0, overall: 0};
	for (const m of METRICS) t[m] = 0;
	return t;
}

function tallyArm(results, arm) {
	const t = emptyTally();
	for (const r of results) {
		const a = r[arm];
		t.total += 1;
		if (a.pass) t.overall += 1;
		for (const m of METRICS) if (a.metrics[m]) t[m] += 1;
	}
	return t;
}

const pct = (n, d) => (d === 0 ? 0 : Math.round((n / d) * 100));

function buildSummaryMd(tally, stamp) {
	const {without, with: withS} = tally;
	// Per-metric rows are the headline. Each metric is single-owned (imports owns barrel
	// defects, provider-wiring owns missing providers), so no defect is counted twice.
	const metricRows = METRICS.map((m) => {
		const wa = pct(without[m], without.total);
		const wb = pct(withS[m], withS.total);
		const lift = wb - wa;
		return `| ${m} | ${wa}% | ${wb}% | ${lift >= 0 ? "+" : ""}${lift} pts |`;
	});
	const oa = pct(without.overall, without.total);
	const ob = pct(withS.overall, withS.total);
	const banner =
		MODE === "fixture"
			? "> ⚠️ **Fixture self-test** — graded against stored snippets in `eval/fixtures/`, NOT a live agent. Numbers here exercise the pipeline only; they are NOT evidence about agent behavior. Run `pnpm eval` with an API key for real numbers.\n"
			: MODE === "regrade"
				? `> ℹ️ **Regrade** — recomputed from the raw generations in \`${REGRADE_DIR}\` with the current graders (no new model calls). Provenance: a live ${MODEL} run.\n`
				: "";
	return [
		"# Core agent eval — with vs without the knowledge layer",
		"",
		banner,
		`Run: ${stamp} · mode: ${MODE} · model: ${MODEL} · tasks: ${without.total}`,
		"",
		"Pass-rate per metric. **With-skills** = catalog + composition/domain skills + failure-mode knowledge in the system prompt; **without** = package name + basic usage only.",
		"",
		"| Metric | Without skills | With skills | Lift |",
		"| --- | --- | --- | --- |",
		...metricRows,
		"",
		`**Caveat metrics (not headline):** \`overall\` (every metric must pass) — ${oa}% → ${ob}%. ` +
			"`overall` is all-or-nothing, so it is dominated by whichever single check the baseline universally fails; read the per-metric rows instead.",
		"",
		"> Graders are the deterministic validators from `scripts/validators/` (proven in P1a). " +
			"Each defect is owned by exactly one metric (no double-counting). " +
			"These checks are structural (import paths, provider presence, documented component choice) — " +
			"they do **not** yet verify the output compiles or renders. See `eval/V2-PLAN.md`.",
	].join("\n");
}

/** In fixture mode there is nothing to grade for a task whose committed snippets don't exist yet
 *  (e.g. tasks added ahead of their fixtures). Skip them so the offline self-test stays green and
 *  reports exactly what it covered — live mode still runs every task. */
function hasFixtures(task) {
	return (
		existsSync(join(fixturesDir, `${task.id}.without.tsx`)) && existsSync(join(fixturesDir, `${task.id}.with.tsx`))
	);
}

async function main() {
	const catalog = loadCatalog();
	let tasks = loadTasks();
	if (MODE === "fixture") {
		const skipped = tasks.filter((t) => !hasFixtures(t)).map((t) => t.id);
		tasks = tasks.filter(hasFixtures);
		if (skipped.length)
			console.log(
				`(fixture mode) skipping ${skipped.length} task(s) without committed fixtures: ${skipped.join(", ")}`,
			);
	}
	// Static stamp in offline modes keeps the committed scorecard churn-free across re-runs.
	const stamp =
		MODE === "fixture"
			? "fixture"
			: MODE === "regrade"
				? `regrade-of-${REGRADE_DIR.split("/").filter(Boolean).pop()}`
				: new Date().toISOString().replace(/[:.]/g, "-");
	const runDir = join(resultsDir, "runs", stamp);
	if (MODE === "live") mkdirSync(runDir, {recursive: true});

	console.log(`Running ${tasks.length} tasks × 2 arms (mode=${MODE}, ${MODEL})...`);

	const results = await pool(tasks, CONCURRENCY, async (task) => {
		const [withoutArm, withArm] = await Promise.all([runArm(task, "without", catalog), runArm(task, "with", catalog)]);
		console.log(`  ✓ ${task.id}  without=${withoutArm.pass ? "PASS" : "fail"}  with=${withArm.pass ? "PASS" : "fail"}`);
		// Live raw generations → gitignored run dir (debuggability without repo noise).
		if (MODE === "live") {
			writeFileSync(join(runDir, `${task.id}.without.tsx`), withoutArm.rawText);
			writeFileSync(join(runDir, `${task.id}.with.tsx`), withArm.rawText);
		}
		return {task: {id: task.id, title: task.title, domain: task.domain}, without: withoutArm, with: withArm};
	});

	const tally = {without: tallyArm(results, "without"), with: tallyArm(results, "with")};

	// Strip rawText from the committed JSON (it lives in the gitignored run dir).
	const slim = results.map((r) => ({
		task: r.task,
		without: {pass: r.without.pass, metrics: r.without.metrics, findings: r.without.findings},
		with: {pass: r.with.pass, metrics: r.with.metrics, findings: r.with.findings},
	}));

	// Fixture self-test writes to its OWN files so it can never masquerade as the live
	// scorecard; live and regrade write the committed latest.* / summary.md.
	const jsonName = MODE === "fixture" ? "fixture-selftest.json" : "latest.json";
	const mdName = MODE === "fixture" ? "fixture-selftest.md" : "summary.md";
	writeFileSync(
		join(resultsDir, jsonName),
		`${JSON.stringify({generatedAt: stamp, mode: MODE, model: MODEL, tally, tasks: slim}, null, 2)}\n`,
	);
	writeFileSync(join(resultsDir, mdName), `${buildSummaryMd(tally, stamp)}\n`);

	console.log("\nPer-metric (without → with):");
	for (const m of METRICS) {
		console.log(
			`  ${m.padEnd(16)} ${pct(tally.without[m], tally.without.total)}% → ${pct(tally.with[m], tally.with.total)}%`,
		);
	}
	console.log(
		`Wrote eval/results/${jsonName} + ${mdName}${MODE === "live" ? ` and raw generations to runs/${stamp}/` : ""}`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
