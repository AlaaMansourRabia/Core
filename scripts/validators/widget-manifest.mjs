// Widget-tier manifest validator.
//
// Iterates every tier:"widget" entry in library-index.json and checks:
//   - the entry is discoverable (name resolves, has a tier) and points at a manifest that exists on disk
//   - manifestStatus:"complete" manifests are validated STRICTLY (full contract)
//   - manifestStatus:"stub" manifests are validated LIGHTLY (minimal stub fields present)
//   - complete manifests are validated strictly (DataTable, MetricCard, …)
//   - needsDecision entries are reported, not promoted
//
// Run:  node scripts/validators/widget-manifest.mjs
// Exit: 0 = pass, 1 = errors.

import {readFileSync, existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, resolve} from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => readFileSync(resolve(root, p), "utf8");
const readJson = (p) => JSON.parse(read(p));

const errors = [];
const warnings = [];
let checks = 0;
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const ok = () => checks++;

const library = readJson("library-index.json");
const flat = {};
for (const cat of Object.keys(library.components)) for (const e of library.components[cat]) flat[e.name] = e;
const names = Object.keys(flat);

const isEmpty = (v) =>
	v == null ||
	(typeof v === "string" && v.trim() === "") ||
	(Array.isArray(v) && v.length === 0) ||
	(typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

// ---- strict validation (complete manifests) ----
const STRICT_REQUIRED = [
	"schemaVersion", "id", "tier", "name", "intent", "when", "whenNot", "chooseOver",
	"dataContract", "configSchema", "states", "composedOf", "requiredProviders",
	"allowedPlacement", "commonMistakes", "minimalExample", "evaluationCriteria", "lineage",
];
// composedOf may be empty: a leaf widget (e.g. KPIBar) can be built from primitive markup + passed-in
// icons without composing another catalog component.
const ALLOW_EMPTY = new Set(["requiredProviders", "forbiddenPlacement", "composedOf"]);

function validateStrict(m, label) {
	for (const f of STRICT_REQUIRED) {
		if (!(f in m)) err(`${label}: missing required field ${f}`);
		else if (ALLOW_EMPTY.has(f)) {
			if (!Array.isArray(m[f])) err(`${label}: ${f} must be an array`);
			else ok();
		} else if (isEmpty(m[f])) err(`${label}: required field empty: ${f}`);
		else ok();
	}
	for (const n of m.composedOf ?? []) (flat[n] ? ok() : err(`${label}: composedOf references unknown artifact ${n}`));
	if (m.dataContract && !m.dataContract.input) err(`${label}: dataContract.input required`);
	const refsFm = JSON.stringify(m.commonMistakes ?? []) + JSON.stringify(m.evaluationCriteria ?? []);
	const declaredFm = (m.commonMistakes ?? []).map((x) => x.id).filter(Boolean);
	for (const fm of declaredFm) {
		let dm = "";
		try {
			dm = read("skills/_artifacts/domain_map.yaml");
		} catch {
			/* ignore */
		}
		if (dm && !dm.includes(fm)) err(`${label}: failure mode ${fm} not found in domain_map.yaml`);
		else ok();
	}
	if (refsFm.length < 5) warn(`${label}: no commonMistakes/evaluationCriteria content`);
	for (const c of m.evaluationCriteria ?? []) if (!c.id || !c.check) err(`${label}: evaluationCriteria entry missing id/check`);
}

// ---- light validation (stub manifests) ----
const STUB_REQUIRED = ["schemaVersion", "id", "tier", "name", "category", "source", "intent", "manifestStatus"];
function validateStub(m, label) {
	for (const f of STUB_REQUIRED) {
		if (!(f in m)) err(`${label}: stub missing field ${f}`);
		else if (isEmpty(m[f]) && f !== "intent") err(`${label}: stub field empty: ${f}`);
		else ok();
	}
	if (m.tier !== "widget") err(`${label}: stub tier must be "widget"`);
	if (m.manifestStatus !== "stub" && m.manifestStatus !== "draft")
		warn(`${label}: stub manifestStatus is "${m.manifestStatus}" (expected stub/draft)`);
}

// ---- iterate the widget tier ----
const widgets = names.filter((n) => flat[n].tier === "widget");
let complete = 0, stub = 0, missingManifest = 0;

for (const name of widgets) {
	const e = flat[name];
	const label = `[${name}]`;
	if (!e.manifest) {
		err(`${label}: tier:widget but no manifest pointer`);
		continue;
	}
	if (!existsSync(resolve(root, e.manifest))) {
		err(`${label}: manifest file missing: ${e.manifest}`);
		missingManifest++;
		continue;
	}
	ok();
	let m;
	try {
		m = readJson(e.manifest);
	} catch (ex) {
		err(`${label}: manifest unparseable: ${ex.message}`);
		continue;
	}
	if (m.name !== name) warn(`${label}: manifest.name "${m.name}" != "${name}"`);
	const status = e.manifestStatus ?? m.manifestStatus ?? "stub";
	if (status === "complete") {
		complete++;
		validateStrict(m, label);
	} else {
		stub++;
		validateStub(m, label);
	}
}

// ---- needs-decision report ----
const decisions = names.filter((n) => flat[n].needsDecision);

// ---- output ----
const tag = "[widget-manifest]";
console.log(`${tag} widget tier: ${widgets.length} entries — ${complete} complete, ${stub} stub, ${missingManifest} missing manifest`);
console.log(`${tag} needs-decision (left as component): ${decisions.length}${decisions.length ? " — " + decisions.join(", ") : ""}`);
for (const w of warnings) console.log(`${tag} ⚠ ${w}`);
if (errors.length) {
	for (const e of errors) console.log(`${tag} ✗ ${e}`);
	console.log(`\n${tag} FAIL — ${errors.length} error(s), ${warnings.length} warning(s), ${checks} checks passed.`);
	process.exit(1);
}
console.log(`${tag} ✓ PASS — ${checks} checks passed, ${warnings.length} warning(s), 0 errors.`);
