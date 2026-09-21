#!/usr/bin/env node
// A1 migration scaffold for the TEMPLATE tier -> artifact-manifest/0.2.
//
//   node scripts/migrate-templates.mjs CoreOrgOverview ErrorPage ...
//
// Like the widget migration: the manifest is the source of truth. Pull tags/pairsWith from the catalog,
// normalize chooseOver.over -> component, requires -> requiredProviders, surface catalog `avoid` via
// commonMistakes.avoidOverride, fold ad-hoc `_note_*` keys and the divergent lineage into the frozen
// lineage schema, schemaVersion -> 0.2. Template-specific fields (regions/requiredWidgets/dataSources/
// composedOf/...) are preserved. Does NOT touch library-index.json (run the projector afterwards).

import {readFileSync, readdirSync, writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestsDir = join(repoRoot, "manifests");
const index = JSON.parse(readFileSync(join(repoRoot, "library-index.json"), "utf8"));

// Some template manifests are named by archetype (for example regular-dashboard.template.json), not import basename — map each
// file by its source.import and name so we can resolve it from the catalog entry.
const fileByImport = new Map();
const fileByName = new Map();
for (const f of readdirSync(manifestsDir)) {
	if (!f.endsWith(".template.json")) continue;
	const mm = JSON.parse(readFileSync(join(manifestsDir, f), "utf8"));
	if (mm.source?.import) fileByImport.set(mm.source.import, f);
	if (mm.name) fileByName.set(mm.name, f);
}

const LINEAGE_KEYS = [
	"origin",
	"authoredBy",
	"derivedFrom",
	"status",
	"verifiedBy",
	"confidence",
	"supersedes",
	"lastValidated",
	"notes",
];
const findEntry = (name) => {
	for (const list of Object.values(index.components)) {
		const e = list.find((x) => x.name === name);
		if (e) return e;
	}
	return null;
};
const normChooseOver = (list) =>
	Array.isArray(list) ? list.map((c) => ({component: c.component ?? c.over, because: c.because})) : list;

function normalizeLineage(L = {}, extraNotes = []) {
	const out = {
		origin: L.origin ?? "migrated",
		authoredBy: L.authoredBy ?? "A1 template migration (2026-07)",
		derivedFrom: L.derivedFrom ?? {source: null, extracted: []},
		status: L.status ?? "accepted",
		verifiedBy: L.verifiedBy ?? null,
		confidence: L.confidence ?? "unset — projection round-trip verified; no held-out eval yet",
		supersedes: L.supersedes ?? null,
		lastValidated: "2026-07-05",
		notes: Array.isArray(L.notes) ? [...L.notes] : L.notes ? [String(L.notes)] : [],
	};
	for (const [k, v] of Object.entries(L)) {
		if (LINEAGE_KEYS.includes(k) || k === "manifestStatus") continue;
		out.notes.push(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
	}
	out.notes.push(...extraNotes);
	return out;
}

function reconcileCommonMistakes(existing, avoid) {
	const cm = Array.isArray(existing) ? existing.map((c) => ({...c})) : [];
	for (const line of avoid ?? []) {
		if (cm.some((c) => c.avoidOverride === line)) continue;
		const match = cm.find((c) => !c.avoidOverride && (line.includes(c.mistake) || (c.fix && line.includes(c.fix))));
		if (match) match.avoidOverride = line;
		else cm.push({mistake: line, fix: "See chooseOver for the correct alternative.", avoidOverride: line});
	}
	return cm;
}

const TEMPLATE_ORDER = [
	"schemaVersion",
	"id",
	"tier",
	"name",
	"archetype",
	"category",
	"version",
	"manifestStatus",
	"source",
	"tags",
	"intent",
	"when",
	"whenNot",
	"chooseOver",
	"pairsWith",
	"requiredProviders",
	"regions",
	"requiredWidgets",
	"optionalWidgets",
	"requiredComponents",
	"missingRequiredWidgets",
	"impliedWidgets",
	"dataContract",
	"dataSources",
	"dataFlow",
	"configSchema",
	"states",
	"composedOf",
	"responsive",
	"allowedPlacement",
	"forbiddenPlacement",
	"commonMistakes",
	"minimalExample",
	"evaluationCriteria",
	"stubPlan",
	"lineage",
];

const names = process.argv.slice(2);
if (!names.length) {
	console.error("usage: node scripts/migrate-templates.mjs <TemplateCatalogName> [...]");
	process.exit(1);
}

let written = 0;
for (const name of names) {
	const e = findEntry(name);
	if (!e) {
		console.error(`  ✗ ${name}: not in library-index.json`);
		process.exit(1);
	}
	if (e.tier !== "template") {
		console.error(`  ✗ ${name}: tier=${e.tier}, not a template`);
		process.exit(1);
	}
	const file = fileByImport.get(e.import) ?? fileByName.get(e.name);
	if (!file) {
		console.error(`  ✗ ${name}: no template manifest matches import ${e.import}`);
		process.exit(1);
	}
	const base = file.replace(".template.json", "");
	const mf = join(manifestsDir, file);
	const m = JSON.parse(readFileSync(mf, "utf8"));

	// collect ad-hoc note keys (_note_*) to fold into lineage.notes
	const extraNotes = [];
	for (const k of Object.keys(m))
		if (k.startsWith("_note")) extraNotes.push(`${k.replace(/^_note_?/, "note: ")} ${m[k]}`);

	const out = {...m};
	for (const k of Object.keys(out)) if (k.startsWith("_note")) delete out[k];
	out.schemaVersion = "artifact-manifest/0.2";
	out.version = m.version ?? "1.0.0";
	out.tier = "template";
	out.name = e.name;
	out.tags = m.tags ?? e.tags ?? [];
	out.intent = m.intent ?? e.intent;
	out.when = m.when && m.when.length ? m.when : (e.when ?? []);
	out.chooseOver = normChooseOver(m.chooseOver && m.chooseOver.length ? m.chooseOver : e.chooseOver) ?? [];
	out.pairsWith = m.pairsWith ?? e.pairsWith ?? [];
	out.requiredProviders = m.requiredProviders ?? m.requires ?? e.requires ?? [];
	out.commonMistakes = reconcileCommonMistakes(m.commonMistakes, e.avoid);
	if (m.TODO) {
		out.stubPlan = Object.entries(m.TODO).map(([k, v]) => `${k}: ${v}`);
		delete out.TODO;
	}
	out.lineage = normalizeLineage(m.lineage, extraNotes);
	delete out.requires;
	delete out.avoid;
	delete out.knowledgeLevel;

	const ordered = {};
	for (const k of TEMPLATE_ORDER) if (k in out) ordered[k] = out[k];
	for (const k of Object.keys(out)) if (!(k in ordered)) ordered[k] = out[k];
	writeFileSync(mf, JSON.stringify(ordered, null, "\t") + "\n");
	written++;
	console.log(
		`  ✓ ${base}.template.json  intent=${m.intent === e.intent ? "same" : "RECONCILED"} notes+${extraNotes.length} cm=${out.commonMistakes.length}`,
	);
}
console.log(
	`\nwrote ${written} template manifest(s). Next: node scripts/project-catalog-manifests.mjs && pnpm validate:manifests`,
);
