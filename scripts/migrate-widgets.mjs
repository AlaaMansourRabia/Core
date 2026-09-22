#!/usr/bin/env node
// A1 migration scaffold for the WIDGET tier -> artifact-manifest/0.2.
//
//   node scripts/migrate-widgets.mjs DataTable MetricCard ...
//
// Widgets carry semantics in BOTH the manifest and the catalog. The manifest is the source of truth:
//   - complete widgets: the (richer) manifest intent/when/chooseOver win; the catalog reconciles to them.
//   - stub widgets: the manifest lacks catalog semantics, so we pull tags/intent/when/chooseOver/pairsWith
//     from the catalog INTO the manifest (nothing lost), and convert its TODO block to `stubPlan`.
//
// Conversions: chooseOver.over -> component; requires -> requiredProviders; drop generated fields
// (avoid/requires/knowledgeLevel); catalog `avoid` surfaces via commonMistakes.avoidOverride; lineage
// normalized to the frozen key set; schemaVersion -> 0.2; ensure version.
// Does NOT touch library-index.json (run the projector afterwards).

import {readFileSync, writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const index = JSON.parse(readFileSync(join(repoRoot, "library-index.json"), "utf8"));

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

// Collapse a divergent lineage into the frozen 9-key schema; non-standard keys are preserved as notes.
function normalizeLineage(L = {}) {
	const out = {
		origin: L.origin ?? "migrated",
		authoredBy: L.authoredBy ?? "A1 widget migration batch (2026-07)",
		derivedFrom: L.derivedFrom ?? {source: null, extracted: []},
		status: L.status ?? "accepted",
		verifiedBy: L.verifiedBy ?? null,
		confidence: L.confidence ?? "unset — projection round-trip verified; no held-out eval yet",
		supersedes: L.supersedes ?? null,
		lastValidated: "2026-07-05",
		notes: Array.isArray(L.notes) ? [...L.notes] : L.notes ? [String(L.notes)] : [],
	};
	for (const [k, v] of Object.entries(L)) {
		if (LINEAGE_KEYS.includes(k) || k === "manifestStatus") continue; // manifestStatus is top-level only
		out.notes.push(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
	}
	return out;
}

// Derive a structured commonMistakes entry from a catalog `avoid` line (same patterns as components).
function deriveMistake(name, a) {
	const i = a.indexOf(" — ");
	if (i >= 0) {
		return {
			mistake: a
				.slice(0, i)
				.trim()
				.replace(/^Use\b/, `Using ${name}`),
			fix: (() => {
				const p = a.slice(i + 3).trim();
				return p.charAt(0).toUpperCase() + p.slice(1);
			})(),
			avoidOverride: a,
		};
	}
	const u = a.match(/^Use ([A-Z][A-Za-z/]+) (for|when|as|inside) (.+)$/);
	if (u) return {mistake: `Using ${name} ${u[2]} ${u[3]}`, fix: `Use ${u[1]}`, avoidOverride: a};
	return {mistake: a, fix: "See chooseOver for the correct alternative.", avoidOverride: a};
}

// Ensure the catalog `avoid` lines are surfaced through commonMistakes.avoidOverride (byte-stable).
function reconcileCommonMistakes(existing, avoid, name) {
	const cm = Array.isArray(existing) ? existing.map((c) => ({...c})) : [];
	for (const line of avoid ?? []) {
		if (cm.some((c) => c.avoidOverride === line)) continue;
		// attach to a matching existing entry, else derive a new structured entry
		const match = cm.find((c) => !c.avoidOverride && (line.includes(c.mistake) || (c.fix && line.includes(c.fix))));
		if (match) match.avoidOverride = line;
		else cm.push(deriveMistake(name, line));
	}
	return cm;
}

const WIDGET_ORDER = [
	"schemaVersion",
	"id",
	"tier",
	"name",
	"category",
	"archetype",
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
	"dataContract",
	"configSchema",
	"states",
	"composedOf",
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
	console.error("usage: node scripts/migrate-widgets.mjs <WidgetName> [...]");
	process.exit(1);
}

let written = 0;
for (const name of names) {
	const e = findEntry(name);
	if (!e) {
		console.error(`  ✗ ${name}: not in library-index.json`);
		process.exit(1);
	}
	if (e.tier !== "widget") {
		console.error(`  ✗ ${name}: tier=${e.tier}, not a widget`);
		process.exit(1);
	}
	const id = e.import.replace("@core/core-ui/", "").split("/").pop(); // manifests are flat, by basename
	const mf = join(repoRoot, "manifests", `${id}.widget.json`);
	const m = JSON.parse(readFileSync(mf, "utf8"));

	const out = {...m};
	out.schemaVersion = "artifact-manifest/0.2";
	out.version = m.version ?? "1.0.0";
	out.tier = "widget";
	out.name = e.name;
	out.category = m.category ?? "widget";
	// catalog-projection semantics: manifest wins where present (richer), else pull from catalog.
	out.tags = m.tags ?? e.tags ?? [];
	out.intent = m.intent ?? e.intent;
	out.when = m.when && m.when.length ? m.when : (e.when ?? []);
	out.chooseOver = normChooseOver(m.chooseOver && m.chooseOver.length ? m.chooseOver : e.chooseOver) ?? [];
	out.pairsWith = m.pairsWith ?? e.pairsWith ?? [];
	out.requiredProviders = m.requiredProviders ?? m.requires ?? e.requires ?? [];
	out.commonMistakes = reconcileCommonMistakes(m.commonMistakes, e.avoid, e.name);
	// convert stub TODO -> stubPlan
	if (m.TODO) {
		out.stubPlan = Object.entries(m.TODO).map(([k, v]) => `${k}: ${v}`);
		delete out.TODO;
	}
	out.lineage = normalizeLineage(m.lineage);
	// drop generated / renamed / stale fields
	delete out.requires;
	delete out.avoid;
	delete out.knowledgeLevel;

	const ordered = {};
	for (const k of WIDGET_ORDER) if (k in out) ordered[k] = out[k];
	for (const k of Object.keys(out)) if (!(k in ordered)) ordered[k] = out[k];
	writeFileSync(mf, JSON.stringify(ordered, null, "\t") + "\n");
	written++;
	const status = m.manifestStatus ?? (m.TODO ? "stub" : "complete");
	console.log(
		`  ✓ ${id}.widget.json  [${status}]  tags+${!m.tags ? "(from catalog)" : ""} chooseOver=${out.chooseOver.length} cm=${out.commonMistakes.length}`,
	);
}
console.log(
	`\nwrote ${written} widget manifest(s). Next: node scripts/project-catalog-manifests.mjs && pnpm validate:manifests`,
);
