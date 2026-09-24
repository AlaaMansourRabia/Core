#!/usr/bin/env node
// Merge the generated structural catalog (scripts/catalog-structural.json) into
// library-index.json — updating ONLY structural fields (path, import, variants,
// sizes) and stamping a default `knowledgeLevel: "generated"` on entries that
// have no hand-authored semantics yet.
//
// It NEVER overwrites semantic fields (intent / when / chooseOver / insteadUse /
// requires / pairsWith / variantIntent / avoid) or an already-set knowledgeLevel
// of full | concise | needs-review. Safe to re-run.
//
// Usage:  node scripts/extract-component-catalog.mjs && node scripts/sync-library-index.mjs

import {readFileSync, writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = join(repoRoot, "library-index.json");
const index = JSON.parse(readFileSync(indexPath, "utf8"));
const struct = JSON.parse(readFileSync(join(repoRoot, "scripts", "catalog-structural.json"), "utf8"));

const norm = (s) =>
	String(s)
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "");
const byName = new Map();
for (const c of Object.values(struct)) byName.set(norm(c.name), c);

const SEMANTIC_KEYS = ["intent", "when", "chooseOver", "insteadUse", "requires", "pairsWith", "variantIntent", "avoid"];
const AUTHORED = new Set(["full", "concise", "needs-review"]);
// Exported product routes that remain available to applications but are intentionally not selectable
// catalog artifacts. Keep this explicit so regenerating the structural catalog cannot silently promote
// them back into a component/widget/template tier.
const NON_CATALOG_EXPORTS = new Set([
	"CoreOrgAiReport",
	"CoreOrgOverview",
	"CoreOrgRealityCapture",
	// Legacy package alias retained for compatibility; Timesheet is the canonical catalog template.
	"CoreVerifytimeCommandCenter",
]);

// header hygiene
index.version = "2.0.0";
index.description = "Core (@corensystem/coren-ui) component & composition index — semantic catalog for agents";
index.lastUpdated = new Date().toISOString().slice(0, 10);

for (const [category, list] of Object.entries(index.components)) {
	index.components[category] = list.filter((entry) => !NON_CATALOG_EXPORTS.has(entry.name));
}

let matched = 0;
const unmatched = [];
const present = new Set();
for (const list of Object.values(index.components)) {
	for (const entry of list) {
		const s = byName.get(norm(entry.name));
		if (!s) {
			unmatched.push(entry.name);
			continue;
		}
		present.add(norm(entry.name));
		matched++;
		entry.path = s.path;
		entry.import = s.import;
		if (s.variants) entry.variants = s.variants;
		if (s.sizes) entry.sizes = s.sizes;
		const hasSemantics = SEMANTIC_KEYS.some((k) => entry[k] !== undefined);
		if (!AUTHORED.has(entry.knowledgeLevel)) entry.knowledgeLevel = hasSemantics ? "needs-review" : "generated";
	}
}

// Append components that exist in the exports/struct but have no catalog entry yet.
// This is what keeps the catalog from drifting behind new components. New entries land
// as `generated` (structural only) in a category inferred from the import scope; a human
// refines the category and adds semantics later (quality-first phasing).
const categoryFor = (imp) => {
	const sub = imp.replace("@corensystem/coren-ui/", "");
	if (sub.startsWith("chat/")) return "chat";
	if (sub.startsWith("navigation/")) return "navigation";
	if (sub.startsWith("pages/")) return "pages";
	return "display"; // default bucket for flat primitives — recategorize when authoring semantics
};

let added = 0;
const addedNames = [];
for (const s of Object.values(struct)) {
	if (NON_CATALOG_EXPORTS.has(s.name)) continue;
	if (present.has(norm(s.name))) continue;
	const cat = categoryFor(s.import);
	(index.components[cat] ??= []).push({
		name: s.name,
		path: s.path,
		import: s.import,
		...(s.variants ? {variants: s.variants} : {}),
		...(s.sizes ? {sizes: s.sizes} : {}),
		knowledgeLevel: "generated",
	});
	present.add(norm(s.name));
	added++;
	addedNames.push(s.key ?? s.name);
}

writeFileSync(indexPath, JSON.stringify(index, null, "\t") + "\n");
console.log(`Synced structural fields: ${matched} matched, ${added} added.`);
if (added) console.log(`Added (${added}, new in exports): ${addedNames.sort().join(", ")}`);
if (unmatched.length) console.log(`Unmatched (${unmatched.length}, name not in exports): ${unmatched.join(", ")}`);
