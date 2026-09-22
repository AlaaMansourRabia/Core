#!/usr/bin/env node
// Read-only structural extractor for the @core/core-ui component catalog.
//
// Walks the package's `exports` map (the authoritative list of importable
// components), and for each source file extracts:
//   - the real source path           (packages/components/src/...)
//   - the deep-path import specifier  (@core/core-ui/<key>)
//   - cva() variant axes + values     (variant / size / ... )
//   - defaultVariants
//   - the leading JSDoc one-liner
//
// It emits the STRUCTURAL half of the catalog only. Semantic fields
// (intent / when / chooseOver / requires / variantIntent / avoid) are
// hand-authored in library-index.json. Output → scripts/catalog-structural.json
//
// Usage:  node scripts/extract-component-catalog.mjs

import {readFileSync, writeFileSync, existsSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgRoot = join(repoRoot, "packages", "components");
const pkg = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8"));

// ── Brace matcher (cva configs never contain braces inside string literals) ──
function matchBrace(s, openIdx) {
	let depth = 0;
	for (let i = openIdx; i < s.length; i++) {
		if (s[i] === "{") depth++;
		else if (s[i] === "}") {
			depth--;
			if (depth === 0) return i;
		}
	}
	return -1;
}

// Extract top-level `key: {` axis blocks → { axis: [values...] }
function parseAxisObject(body) {
	const axes = {};
	const axisRe = /([A-Za-z0-9_]+)\s*:\s*\{/g;
	let m;
	while ((m = axisRe.exec(body))) {
		const axis = m[1];
		const open = body.indexOf("{", m.index + m[0].length - 1);
		const close = matchBrace(body, open);
		if (close === -1) continue;
		const inner = body.slice(open + 1, close);
		// values are top-level `key:` (identifier, string, or boolean key) at depth 0
		const values = [];
		const valRe = /(?:^|,)\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_]+))\s*:/g;
		let depth = 0;
		// strip nested braces so we only match this axis's direct keys
		let flat = "";
		for (let i = 0; i < inner.length; i++) {
			const c = inner[i];
			if (c === "{") {
				depth++;
				flat += " ";
			} else if (c === "}") {
				depth--;
				flat += " ";
			} else flat += depth === 0 ? c : " ";
		}
		let vm;
		while ((vm = valRe.exec(flat))) values.push(vm[1] || vm[2] || vm[3]);
		axes[axis] = values;
		axisRe.lastIndex = close;
	}
	return axes;
}

function extractCva(code) {
	const out = {axes: {}, defaultVariants: {}};
	let idx = code.indexOf("cva(");
	while (idx !== -1) {
		// find the config object: first top-level "{" after cva(
		const open = code.indexOf("{", idx);
		if (open !== -1) {
			const close = matchBrace(code, open);
			const config = code.slice(open, close + 1);
			const vIdx = config.indexOf("variants:");
			if (vIdx !== -1) {
				const vOpen = config.indexOf("{", vIdx);
				const vClose = matchBrace(config, vOpen);
				Object.assign(out.axes, parseAxisObject(config.slice(vOpen + 1, vClose)));
			}
			const dIdx = config.indexOf("defaultVariants:");
			if (dIdx !== -1) {
				const dOpen = config.indexOf("{", dIdx);
				const dClose = matchBrace(config, dOpen);
				const dBody = config.slice(dOpen + 1, dClose);
				const dRe = /([A-Za-z0-9_]+)\s*:\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_]+))/g;
				let dm;
				while ((dm = dRe.exec(dBody))) out.defaultVariants[dm[1]] = dm[2] || dm[3] || dm[4];
			}
		}
		idx = code.indexOf("cva(", idx + 4);
	}
	return out;
}

function firstJsdoc(code) {
	const m = code.match(/\/\*\*\s*([^*][\s\S]*?)\*\//);
	if (!m) return undefined;
	return m[1]
		.replace(/\n\s*\*/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function pascalFromKey(key) {
	return key
		.split("/")
		.pop()
		.split("-")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join("");
}

// ── Walk exports ──
const catalog = {};
for (const [expKey, val] of Object.entries(pkg.exports)) {
	if (expKey === "." || !expKey.startsWith("./")) continue;
	const sub = expKey.slice(2);
	if (sub.startsWith("styles") || sub === "package.json") continue;
	const source = typeof val === "object" ? val.source : undefined;
	if (!source || !source.endsWith(".tsx")) continue;
	const rel = source.replace(/^\.\//, "");
	const abs = join(pkgRoot, rel);
	if (!existsSync(abs)) continue;
	const code = readFileSync(abs, "utf8");
	const {axes, defaultVariants} = extractCva(code);
	const entry = {
		name: pascalFromKey(sub),
		key: sub,
		path: `packages/components/${rel}`,
		import: `@core/core-ui/${sub}`,
		description: firstJsdoc(code),
	};
	if (axes.variant) entry.variants = axes.variant;
	if (axes.size) entry.sizes = axes.size;
	const otherAxes = Object.fromEntries(Object.entries(axes).filter(([a]) => a !== "variant" && a !== "size"));
	if (Object.keys(otherAxes).length) entry.otherAxes = otherAxes;
	if (Object.keys(defaultVariants).length) entry.defaultVariants = defaultVariants;
	catalog[sub] = entry;
}

const sorted = Object.fromEntries(Object.entries(catalog).sort(([a], [b]) => a.localeCompare(b)));
const outPath = join(repoRoot, "scripts", "catalog-structural.json");
writeFileSync(outPath, JSON.stringify(sorted, null, "\t") + "\n");

const withVariants = Object.values(sorted).filter((c) => c.variants || c.sizes || c.otherAxes).length;
console.log(`Extracted ${Object.keys(sorted).length} components → ${outPath}`);
console.log(`  ${withVariants} have cva variant axes`);
