// A2 offline measurement — proves the token-reduction acceptance criterion and a retrieval-quality
// proxy WITHOUT any paid model calls.
//
//   node eval/measure-resolution.mjs
//
// For each eval task it compares the WHOLESALE knowledge digest (all components + patterns + failure
// modes — what arms A2+ inject today) against the RESOLVED slice, and checks whether the task's
// expected/acceptable components were actually retrieved (a necessary condition for the model to
// choose them). Deterministic.

import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

import {repoRoot} from "../scripts/validators/load.mjs";
import {loadCatalog} from "../scripts/validators/load.mjs";
import {resolve, resolvedDigest} from "./lib/resolution.mjs";

const estTokens = (s) => Math.ceil(s.length / 4); // consistent proxy — the ratio is what matters
const median = (xs) => {
	const s = [...xs].sort((a, b) => a - b);
	const m = Math.floor(s.length / 2);
	return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// The wholesale digest = the same shape resolvedDigest emits, but for the ENTIRE catalog.
function wholesaleDigest(catalog) {
	return resolvedDigest({
		components: catalog.components,
		patterns: catalog.patterns,
		failureModes: catalog.failureModes,
	});
}

const catalog = loadCatalog();
const whole = wholesaleDigest(catalog);
const wholeTok = estTokens(whole);

const tasks = readdirSync(join(repoRoot, "eval", "tasks"))
	.filter((f) => f.endsWith(".json"))
	.map((f) => JSON.parse(readFileSync(join(repoRoot, "eval", "tasks", f), "utf8")));

const rows = [];
for (const task of tasks) {
	const slice = resolve(task, catalog);
	const digest = resolvedDigest(slice);
	const rTok = estTokens(digest);
	const names = new Set(slice.components.map((c) => c.name));
	const expected = task.expected ?? [];
	const acceptable = task.acceptable ?? [];
	const expHit = expected.filter((n) => names.has(n));
	const accHit = acceptable.filter((n) => names.has(n));
	rows.push({
		id: task.id,
		comps: slice.components.length,
		fms: slice.failureModes.length,
		rTok,
		reduction: +(wholeTok / rTok).toFixed(1),
		expected: `${expHit.length}/${expected.length}`,
		expectedOk: expHit.length === expected.length,
		acceptable: `${accHit.length}/${acceptable.length}`,
	});
}

console.log(
	`Wholesale knowledge digest: ~${wholeTok.toLocaleString()} tokens (all ${catalog.components.length} components + ${catalog.patterns.length} patterns + ${catalog.failureModes.length} failure modes)\n`,
);
console.log("task                comps  fm   ~tok   reduction   expected  acceptable");
console.log("-".repeat(78));
for (const r of rows) {
	console.log(
		`${r.id.padEnd(20)}${String(r.comps).padStart(3)}  ${String(r.fms).padStart(3)}  ${String(r.rTok).padStart(5)}   ${(r.reduction + "x").padStart(6)}     ${r.expected.padStart(6)}${r.expectedOk ? " ✓" : " ✗"}   ${r.acceptable.padStart(6)}`,
	);
}
console.log("-".repeat(78));
const meanRed = median(rows.map((r) => r.reduction));
const meanTok = median(rows.map((r) => r.rTok));
const expOkPct = Math.round((100 * rows.filter((r) => r.expectedOk).length) / rows.length);
console.log(
	`\nMedian resolved size: ~${meanTok} tokens  |  Median reduction: ${meanRed}x  |  Expected retrieved: ${expOkPct}% of tasks`,
);
console.log(`Acceptance (A2): token reduction >= 5x -> ${meanRed >= 5 ? "PASS" : "FAIL"} (${meanRed}x median)`);
