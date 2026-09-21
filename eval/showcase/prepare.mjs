#!/usr/bin/env node
// Showcase prepare step — LOCAL ONLY, no Anthropic calls.
//
// For each core-5 task and each arm (A1 / A4), resolve a .tsx snippet from disk and copy it into
// the gitignored .generated/ dir, then write .generated/manifest.json for the viewer. Resolution
// order per (task, arm), first hit wins:
//   1. manual drop-in:        snippets/<task>.<arm>.tsx
//   2. captured A4 (pilot):   ../results/runs/ablation-contracts-pilot-*/<task>.A4.r0.tsx   (arm A4 only)
//   3. captured "with" (V2):  ../results/runs/2026-*/<task>.with.tsx                         (arm A4 only)
// A1 has no captures anywhere yet, so it resolves ONLY from manual drop-in — by design.

import {existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync} from "node:fs";
import {basename, dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const runsDir = join(here, "..", "results", "runs");
const snippetsDir = join(here, "snippets");
const outDir = join(here, ".generated");

const ARMS = ["A1", "A4"];
const tasks = JSON.parse(readFileSync(join(here, "tasks.json"), "utf8"));

// Some captured snippets (older V2 runs) were saved as RAW model output, still wrapped in a
// ```tsx … ``` markdown fence — which is not valid TSX and won't compile in the viewer. Strip a
// surrounding fence if present; otherwise return the source untouched. (Newer runs persist the
// already-extracted code, so this is a no-op for them.)
function materialize(srcPath, destPath) {
	const raw = readFileSync(srcPath, "utf8");
	const fenced = raw.match(/```(?:tsx?|jsx?)?\s*\n([\s\S]*?)```/);
	writeFileSync(destPath, (fenced ? fenced[1] : raw).trim() + "\n");
}

// Newest matching run dir whose file exists, or null.
function latestCaptured(globPrefix, file) {
	if (!existsSync(runsDir)) return null;
	const dirs = readdirSync(runsDir)
		.filter((d) => d.startsWith(globPrefix))
		.map((d) => join(runsDir, d))
		.filter((d) => statSync(d).isDirectory())
		.sort()
		.reverse();
	for (const d of dirs) {
		const p = join(d, file);
		if (existsSync(p)) return p;
	}
	return null;
}

function resolveSnippet(taskId, arm) {
	const manual = join(snippetsDir, `${taskId}.${arm}.tsx`);
	if (existsSync(manual)) return {path: manual, source: "manual drop-in"};
	if (arm === "A4") {
		const pilot = latestCaptured("ablation-contracts-pilot-", `${taskId}.A4.r0.tsx`);
		if (pilot) return {path: pilot, source: "captured (contracts pilot, A4)"};
		const v2 = latestCaptured("2026-", `${taskId}.with.tsx`);
		if (v2) return {path: v2, source: "captured (V2 run, with-skills ≈ A4)"};
	}
	return null;
}

// Pull the matching run's findings metadata if present (for the viewer's "run metadata" line).
function runMeta(snippetPath) {
	const findings = snippetPath.replace(/\.tsx$/, ".findings.json");
	if (!existsSync(findings)) return null;
	try {
		const f = JSON.parse(readFileSync(findings, "utf8"));
		return {pass: f.pass, metrics: f.metrics, compile: f.compile?.reason ?? null};
	} catch {
		return null;
	}
}

rmSync(outDir, {recursive: true, force: true});
mkdirSync(outDir, {recursive: true});

const manifest = {generatedAt: "local", note: "Visual examples, not statistical proof — see eval/EVIDENCE.md.", tasks: []};
let resolved = 0;
let missing = 0;

for (const task of tasks) {
	const entry = {id: task.id, title: task.title, prompt: task.prompt, differences: task.differences, decision: task.decision, arms: {}};
	for (const arm of ARMS) {
		const hit = resolveSnippet(task.id, arm);
		if (hit) {
			const outName = `${task.id}.${arm}.tsx`;
			materialize(hit.path, join(outDir, outName));
			entry.arms[arm] = {file: outName, sourcePath: hit.path.replace(`${here}/`, "eval/showcase/").replace(/.*\/core\//, ""), source: hit.source, meta: runMeta(hit.path)};
			resolved++;
		} else {
			entry.arms[arm] = {file: null, source: arm === "A1" ? "no A1 captured — drop a file in eval/showcase/snippets/" : "not found", meta: null};
			missing++;
		}
	}
	manifest.tasks.push(entry);
}

writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Showcase prepared: ${resolved} snippet(s) resolved, ${missing} missing.\n`);
for (const t of manifest.tasks) {
	const a1 = t.arms.A1.file ? "✓" : "·";
	const a4 = t.arms.A4.file ? "✓" : "·";
	console.log(`  ${a1} A1  ${a4} A4   ${t.id}`);
}
console.log(`\nManifest: eval/showcase/.generated/manifest.json`);
if (!manifest.tasks.some((t) => t.arms.A1.file)) {
	console.log(`\nNote: no A1 snippets found. Drop fair-baseline snippets in eval/showcase/snippets/<task>.A1.tsx`);
	console.log(`      (e.g. side-panel.A1.tsx) to populate the left column.`);
}
