#!/usr/bin/env node
// Run the behavioral compile grader over a directory of raw generations and print a
// resolves/compiles scorecard. Reproduces the V3 behavioral read without any API calls.
//
//   node eval/graders/run-compile.mjs eval/results/runs/<stamp>
//
// Files are named <task>.<with|without>.tsx (the live-run raw generations).

import {readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";

import {gradeCompile} from "./compile.mjs";

const dir = process.argv[2];
if (!dir) {
	console.error("usage: node eval/graders/run-compile.mjs <runDir>");
	process.exit(1);
}

const extractCode = (t) => {
	const m = t.match(/```(?:tsx?|jsx?)?\s*\n([\s\S]*?)```/);
	return (m ? m[1] : t).trim();
};

const files = readdirSync(dir)
	.filter((f) => f.endsWith(".tsx"))
	.sort();
const tally = {with: {n: 0, resolves: 0, compiles: 0}, without: {n: 0, resolves: 0, compiles: 0}};

console.log("file".padEnd(34), "resolves", "compiles", " top error");
for (const f of files) {
	const g = gradeCompile(extractCode(readFileSync(join(dir, f), "utf8")));
	const arm = f.includes(".with.") ? "with" : "without";
	const top = g.diagnostics?.[0];
	console.log(
		f.padEnd(34),
		String(g.pass).padEnd(8),
		String(g.compiles).padEnd(8),
		top ? ` ${top.code}: ${top.message.slice(0, 64)}` : "",
	);
	tally[arm].n += 1;
	if (g.pass) tally[arm].resolves += 1;
	if (g.compiles) tally[arm].compiles += 1;
}

const pct = (x, n) => (n ? Math.round((x / n) * 100) : 0);
console.log("\nresolves (imports + named exports valid):");
console.log(`  without ${pct(tally.without.resolves, tally.without.n)}%  →  with ${pct(tally.with.resolves, tally.with.n)}%`);
console.log("compiles (full type-check clean):");
console.log(`  without ${pct(tally.without.compiles, tally.without.n)}%  →  with ${pct(tally.with.compiles, tally.with.n)}%`);
