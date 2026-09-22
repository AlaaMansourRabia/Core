#!/usr/bin/env node
// A1 (Unified Knowledge Model) — project artifact manifests INTO library-index.json.
//
// The manifest is the source of truth for an artifact's SEMANTIC knowledge; library-index.json
// is a generated projection. This script rewrites the catalog entry for every "catalog-complete"
// manifest (one that carries both `intent` and `tags`), pulling the semantic fields from the
// manifest and leaving STRUCTURAL fields (path / import / variants / sizes — owned by the code and
// produced by scripts/extract-component-catalog.mjs) untouched.
//
// Scope guard: manifests without both `intent` and `tags` are skipped, so entries not yet migrated
// keep their hand-authored semantics. This is what makes the A1 pilot incremental and safe.
//
// Usage:  node scripts/project-catalog-manifests.mjs         (writes)
//         node scripts/project-catalog-manifests.mjs --check  (no write; exit 1 if it WOULD change)

import {readdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = join(repoRoot, "library-index.json");
const manifestsDir = join(repoRoot, "manifests");

// The semantic fields a manifest owns and projects into a catalog entry.
export const SEMANTIC_FIELDS = [
	"subcomponents",
	"product",
	"tags",
	"knowledgeLevel",
	"intent",
	"when",
	"chooseOver",
	"insteadUse",
	"requires",
	"pairsWith",
	"variantIntent",
	"avoid",
	"ownership",
];

// Canonical catalog-entry key order (structural first, then pointers, then semantics).
const KEY_ORDER = [
	"name",
	"path",
	"import",
	"tier",
	"manifest",
	"manifestStatus",
	"variants",
	"sizes",
	"subcomponents",
	"product",
	"tags",
	"knowledgeLevel",
	"intent",
	"when",
	"chooseOver",
	"insteadUse",
	"requires",
	"pairsWith",
	"variantIntent",
	"avoid",
	"ownership",
];

const TIER_SUFFIX = {widget: "widget", template: "template", utility: "utility", pattern: "pattern"};
const manifestFileFor = (m) => `manifests/${m.id}.${TIER_SUFFIX[m.tier] ?? "component"}.json`;

// chooseOver is {component, because} across all tiers (the {over,because} form was retired at the A1
// flip — every manifest now uses `component`).
const normChooseOver = (list) =>
	Array.isArray(list) ? list.map((c) => ({component: c.component, because: c.because})) : list;

// Fields copied verbatim from manifest -> catalog entry.
// `product` groups artifacts into a named product release (for example Core Connect V1: an admin
// portal plus an end-user portal), so the catalog and MCP can answer "what ships in this version".
const DIRECT_FIELDS = ["subcomponents", "product", "tags", "intent", "when", "insteadUse", "variantIntent", "ownership"];

// 0.2 generation rules ---------------------------------------------------------------------------

/** Catalog `avoid` (terse heuristics) is GENERATED from commonMistakes entries that opt in via
 *  `avoidOverride` (or `surfaceToAvoid`). Entries without it stay rich-only (commonMistakes is not
 *  projected to the catalog). */
function genAvoid(m) {
	const cm = Array.isArray(m.commonMistakes) ? m.commonMistakes : [];
	return cm.filter((c) => c.avoidOverride || c.surfaceToAvoid).map((c) => c.avoidOverride ?? `${c.mistake} — ${c.fix}`);
}

/** Catalog `knowledgeLevel` is GENERATED from completeness (manifestStatus + field richness) — a
 *  separate axis from lineage trust (see A1-DECISION-RECORD §5.9). */
function genKnowledgeLevel(m) {
	// Completeness of the SEMANTIC knowledge — a separate axis from manifestStatus (which tracks the
	// widget CONTRACT: dataContract/states). A stub widget can still have full selection semantics.
	const has = (k) => Array.isArray(m[k]) && m[k].length > 0;
	if (has("when") && has("chooseOver")) return "full";
	if (m.intent) return "concise";
	return "generated";
}

/** Compute the projected SEMANTIC half of a catalog entry from a manifest (0.2). Structural fields
 *  (path/import/variants/sizes) stay owned by the extractor; commonMistakes stays manifest-only. */
export function projectSemantics(m) {
	const out = {};
	for (const k of DIRECT_FIELDS) if (m[k] !== undefined) out[k] = m[k];
	if (m.chooseOver !== undefined) out.chooseOver = normChooseOver(m.chooseOver);
	out.pairsWith = m.pairsWith ?? [];
	out.requires = m.requiredProviders ?? []; // providers -> catalog `requires` (manifest source: requiredProviders)
	out.knowledgeLevel = genKnowledgeLevel(m); // generated from completeness
	const avoid = genAvoid(m); // generated from commonMistakes
	if (avoid.length) out.avoid = avoid;
	return out;
}

/** True if a manifest is a catalog-projection source (carries intent AND tags). */
export const isCatalogComplete = (m) => m && m.intent !== undefined && Array.isArray(m.tags);

/** Load all catalog-complete manifests keyed by artifact name (components/widgets/templates). */
export function loadProjectionSources() {
	const sources = new Map();
	for (const f of readdirSync(manifestsDir)) {
		if (!f.endsWith(".json")) continue;
		if (f.endsWith(".pattern.json")) continue; // patterns project into patterns[], not components[]
		const m = JSON.parse(readFileSync(join(manifestsDir, f), "utf8"));
		if (isCatalogComplete(m)) sources.set(m.name, m);
	}
	return sources;
}

// --- patterns[] projection (tier: pattern) ---
const PATTERN_ORDER = ["name", "intent", "when", "components", "order", "requires", "notes", "tags"];

/** Project a pattern manifest back into a library-index patterns[] entry (requiredProviders -> requires). */
export function projectPattern(m) {
	const src = {
		name: m.name,
		intent: m.intent,
		when: m.when,
		components: m.components,
		order: m.order,
		requires: m.requiredProviders ?? [],
		notes: m.notes,
		tags: m.tags,
	};
	const out = {};
	for (const k of PATTERN_ORDER) if (k in src) out[k] = src[k];
	return out;
}

/** Load pattern manifests keyed by name. */
export function loadPatternSources() {
	const sources = new Map();
	for (const f of readdirSync(manifestsDir)) {
		if (!f.endsWith(".pattern.json")) continue;
		const m = JSON.parse(readFileSync(join(manifestsDir, f), "utf8"));
		sources.set(m.name, m);
	}
	return sources;
}

/** Build the full projected entry = structural (from existing entry) + semantic (from manifest). */
export function projectEntry(existing, m) {
	const merged = {
		...existing,
		tier: m.tier,
		manifest: manifestFileFor(m),
		manifestStatus: m.manifestStatus ?? "complete",
		...projectSemantics(m),
	};
	// Drop any semantic key the manifest does NOT define (prevents stale duplication).
	const projected = projectSemantics(m);
	for (const k of SEMANTIC_FIELDS) if (!(k in projected) && k in merged) delete merged[k];
	// Re-emit in canonical order.
	const ordered = {};
	for (const k of KEY_ORDER) if (k in merged) ordered[k] = merged[k];
	for (const k of Object.keys(merged)) if (!(k in ordered)) ordered[k] = merged[k]; // any extras, stable
	return ordered;
}

function main() {
	const check = process.argv.includes("--check");
	const index = JSON.parse(readFileSync(indexPath, "utf8"));
	const sources = loadProjectionSources();

	let projected = 0;
	const touched = [];
	const missing = [];
	for (const [name, m] of sources) {
		let found = false;
		for (const list of Object.values(index.components)) {
			const i = list.findIndex((e) => e.name === name);
			if (i === -1) continue;
			list[i] = projectEntry(list[i], m);
			found = true;
			projected++;
			touched.push(name);
			break;
		}
		if (!found) missing.push(name);
	}

	// project patterns[] in place (preserve array order)
	const patternSources = loadPatternSources();
	let patternsProjected = 0;
	if (Array.isArray(index.patterns)) {
		for (let i = 0; i < index.patterns.length; i++) {
			const m = patternSources.get(index.patterns[i].name);
			if (m) {
				index.patterns[i] = projectPattern(m);
				patternsProjected++;
			}
		}
	}

	// Generated-file banner (A1 flip): mark library-index.json as a projection, not a hand-authored source.
	delete index._generated;
	const banner =
		"GENERATED from manifests/ — do NOT edit by hand. Edit the manifest, run `pnpm generate:catalog`; CI enforces sync via `pnpm validate:manifests`.";
	const next = JSON.stringify({_generated: banner, ...index}, null, "\t") + "\n";
	const prev = readFileSync(indexPath, "utf8");
	const changed = next !== prev;

	if (check) {
		if (changed) {
			console.error(
				`[project-catalog] ✖ library-index.json is OUT OF SYNC with manifests (would change on regenerate).`,
			);
			console.error(`  Run: node scripts/project-catalog-manifests.mjs`);
			process.exit(1);
		}
		console.log(`[project-catalog] ✓ in sync — ${projected} manifest-backed entries match their manifests.`);
		return;
	}

	if (changed) writeFileSync(indexPath, next);
	console.log(`[project-catalog] projected ${projected} manifest-backed entries + ${patternsProjected} pattern(s).`);
	if (missing.length) console.log(`[project-catalog] WARNING — manifest has no catalog entry: ${missing.join(", ")}`);
	console.log(changed ? "[project-catalog] library-index.json updated." : "[project-catalog] no change.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
