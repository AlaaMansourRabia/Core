#!/usr/bin/env node
// A1 (Unified Knowledge Model) — manifest-integrity validator.
//
// Enforces that library-index.json is a faithful PROJECTION of the artifact manifests, i.e. that the
// manifest is the single source of truth for semantic knowledge. Two checks:
//
//   1. Schema — every component manifest (manifests/*.component.json) has the required catalog fields,
//      correct tier, well-formed chooseOver, and a lineage block.
//   2. Projection equality — for every catalog-complete manifest (component/widget/template that
//      carries intent + tags), the semantic fields in library-index.json exactly equal the projection
//      of the manifest. Any drift = a duplicated/divergent source of truth → error.
//
// Exit 0 on pass, 1 on any error. Pure-ish: reads repo files, no network.

import {readdirSync, readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {
	SEMANTIC_FIELDS,
	loadPatternSources,
	loadProjectionSources,
	projectPattern,
	projectSemantics,
} from "../project-catalog-manifests.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifestsDir = join(repoRoot, "manifests");
const index = JSON.parse(readFileSync(join(repoRoot, "library-index.json"), "utf8"));
const componentApi = JSON.parse(readFileSync(join(repoRoot, "eval", "contracts", "component-api.json"), "utf8"));

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
let checks = 0;
const ok = () => checks++;

// name -> catalog entry
const entries = new Map();
for (const list of Object.values(index.components)) for (const e of list) entries.set(e.name, e);

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- 1. component-manifest schema (artifact-manifest/0.2) ----
const COMPONENT_REQUIRED = [
	"schemaVersion",
	"id",
	"tier",
	"name",
	"category",
	"version",
	"manifestStatus",
	"source",
	"tags",
	"intent",
	"when",
	"chooseOver",
	"lineage",
];
// commonMistakes is optional (not every artifact has a notable pitfall) but must be well-formed if present.
const COMPONENT_ALLOWED = new Set([
	...COMPONENT_REQUIRED,
	"commonMistakes", // optional (not every artifact has a notable pitfall)
	"subcomponents",
	"whenNot",
	"insteadUse",
	"pairsWith",
	"requiredProviders",
	"composedOf",
	"minimalExample",
	"variantIntent",
	"allowedPlacement",
	"forbiddenPlacement",
	"evaluationCriteria",
	"dataContract",
	"configSchema",
	"states",
	"ownership",
	"docs", // documentation metadata for @corensystem/coren-docs
]);
const LINEAGE_ALLOWED = new Set([
	"origin",
	"authoredBy",
	"derivedFrom",
	"status",
	"verifiedBy",
	"confidence",
	"supersedes",
	"lastValidated",
	"notes",
]);
// These are GENERATED into the catalog projection — authoring them in a manifest is a duplicated source.
const GENERATED_FORBIDDEN = ["avoid", "requires", "knowledgeLevel"];
const OWNERSHIP_FIELDS = ["surface", "background", "border", "padding", "scrolling", "responsiveBehavior", "expectedWrapper"];

for (const f of readdirSync(manifestsDir)) {
	if (!f.endsWith(".component.json")) continue;
	const m = JSON.parse(readFileSync(join(manifestsDir, f), "utf8"));
	const label = `manifests/${f}`;
	for (const k of COMPONENT_REQUIRED) {
		if (m[k] === undefined) err(`${label}: missing required field "${k}"`);
		else ok();
	}
	if (m.tier !== "component") err(`${label}: tier must be "component" (got "${m.tier}")`);
	if (m.schemaVersion !== "artifact-manifest/0.2")
		err(`${label}: schemaVersion must be "artifact-manifest/0.2" (got "${m.schemaVersion}")`);
	// no unknown / generated top-level keys
	for (const k of Object.keys(m)) {
		if (GENERATED_FORBIDDEN.includes(k))
			err(`${label}: "${k}" is generated in the projection — remove it from the manifest`);
		else if (!COMPONENT_ALLOWED.has(k)) err(`${label}: unknown top-level key "${k}"`);
		else ok();
	}
	if (Array.isArray(m.chooseOver)) {
		for (const c of m.chooseOver) {
			if (!c.component || !c.because)
				err(`${label}: chooseOver entry must have {component, because} — got ${JSON.stringify(c)}`);
			else ok();
		}
	}
	if (Array.isArray(m.commonMistakes)) {
		for (const c of m.commonMistakes) {
			if (!c.mistake || !c.fix) err(`${label}: commonMistakes entry needs {mistake, fix} — got ${JSON.stringify(c)}`);
			else ok();
		}
	}
	if (m.source && (!m.source.path || !m.source.import || !m.source.export))
		err(`${label}: source needs {path, import, export}`);
	if (m.ownership) {
		for (const key of OWNERSHIP_FIELDS) {
			if (m.ownership[key] === undefined) err(`${label}: ownership missing "${key}"`);
			else ok();
		}
	}
	if (m.lineage) {
		if (!m.lineage.status) err(`${label}: lineage.status required`);
		else ok();
		for (const k of Object.keys(m.lineage)) {
			if (!LINEAGE_ALLOWED.has(k)) err(`${label}: unknown lineage key "${k}" (frozen lineage schema)`);
			else ok();
		}
	}
	// name must resolve to a catalog entry
	if (!entries.has(m.name)) err(`${label}: name "${m.name}" not found in library-index.json`);
	else ok();
}

// ---- 1b. manifest configuration claims agree with the generated public TypeScript API ----
for (const f of readdirSync(manifestsDir)) {
	if (!f.endsWith(".json")) continue;
	const m = JSON.parse(readFileSync(join(manifestsDir, f), "utf8"));
	const api = componentApi.components?.[m.name];
	if (!api) continue;
	if (m.source?.export && api.export && m.source.export !== api.export)
		err(`manifests/${f}: source.export "${m.source.export}" differs from generated API export "${api.export}"`);
	else ok();
	for (const prop of Object.keys(m.configSchema ?? {})) {
		if (!api.props?.[prop]) err(`manifests/${f}: configSchema prop "${prop}" is not present in the generated TypeScript API`);
		else ok();
	}
}

// ---- 2. projection equality (single-source guarantee) ----
const sources = loadProjectionSources();
let projectionChecked = 0;
for (const [name, m] of sources) {
	const e = entries.get(name);
	if (!e) {
		err(`manifest "${name}" (${m.id}) has no catalog entry to project into`);
		continue;
	}
	// entry must point back at a manifest
	if (!e.manifest) err(`${name}: catalog entry is manifest-backed but has no "manifest" pointer`);
	else ok();

	const projected = projectSemantics(m);
	for (const k of SEMANTIC_FIELDS) {
		const inManifest = k in projected;
		const inEntry = e[k] !== undefined;
		if (inManifest && !inEntry) {
			err(`${name}: catalog missing semantic field "${k}" defined by manifest`);
		} else if (!inManifest && inEntry) {
			err(`${name}: catalog has semantic field "${k}" NOT in manifest (duplicated/stale source)`);
		} else if (inManifest && inEntry) {
			if (!eq(projected[k], e[k])) err(`${name}: catalog field "${k}" DIVERGES from manifest projection`);
			else ok();
		}
	}
	projectionChecked++;
}

// ---- 3. insteadUse <-> chooseOver reciprocity (warn) ----
const refsName = (list, name) => Array.isArray(list) && list.some((c) => (c.component ?? c.over) === name);
for (const [name, m] of sources) {
	for (const iu of m.insteadUse ?? []) {
		const target = sources.get(iu.component);
		if (target && !refsName(target.chooseOver, name)) {
			warn(`${name}: insteadUse -> ${iu.component}, but ${iu.component} has no reciprocal chooseOver -> ${name}`);
		}
	}
}

// ---- 4. pattern manifests (tier: pattern) ----
const PATTERN_REQUIRED = [
	"schemaVersion",
	"id",
	"tier",
	"name",
	"version",
	"manifestStatus",
	"intent",
	"when",
	"components",
	"order",
	"tags",
	"lineage",
];
const PATTERN_ALLOWED = new Set([...PATTERN_REQUIRED, "requiredProviders", "notes", "docs"]);
const patternSources = loadPatternSources();
const patternsByName = new Map((index.patterns ?? []).map((p) => [p.name, p]));
for (const [name, m] of patternSources) {
	const label = `manifests/${m.id}.pattern.json`;
	for (const k of PATTERN_REQUIRED) {
		if (m[k] === undefined) err(`${label}: missing required field "${k}"`);
		else ok();
	}
	if (m.tier !== "pattern") err(`${label}: tier must be "pattern"`);
	if (m.schemaVersion !== "artifact-manifest/0.2") err(`${label}: schemaVersion must be 0.2`);
	for (const k of Object.keys(m)) {
		if (k === "requires" || k === "avoid" || k === "knowledgeLevel") err(`${label}: "${k}" is generated — remove it`);
		else if (!PATTERN_ALLOWED.has(k)) err(`${label}: unknown top-level key "${k}"`);
		else ok();
	}
	// projection equality against library-index.patterns[]
	const p = patternsByName.get(name);
	if (!p) err(`${label}: pattern "${name}" has no library-index patterns[] entry`);
	else if (!eq(projectPattern(m), p)) err(`${name}: patterns[] entry DIVERGES from manifest projection`);
	else ok();
}

// ---- report ----
const tag = errors.length ? "\x1b[31m[manifest-integrity]\x1b[0m" : "\x1b[32m[manifest-integrity]\x1b[0m";
console.log(
	`${tag} ${sources.size} catalog-complete manifest(s); ${projectionChecked} projection-checked; ${checks} checks passed, ${warnings.length} warning(s), ${errors.length} error(s).`,
);
for (const w of warnings) console.log("  ⚠ " + w);
if (errors.length) {
	for (const e of errors) console.log("  ✗ " + e);
	process.exit(1);
}
console.log(`${tag} ✓ PASS — library-index.json is a faithful projection of its manifests (single source of truth).`);
