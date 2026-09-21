// Template-tier manifest validator.
//
// Iterates every tier:"template" entry in library-index.json and checks:
//   - templates WITH a manifest pointer: the file exists, parses, and validates
//       · manifestStatus:"complete" -> STRICT (full template contract)
//       · manifestStatus:"stub"/"draft" -> LIGHT (minimal stub fields present)
//   - templates WITHOUT a manifest pointer are REPORTED as not-yet-manifested (info, not an error)
//   - ErrorPage is currently the only complete (strict) template manifest (pilot)
//
// Mirrors scripts/validators/widget-manifest.mjs (same artifact-manifest/0.1 family), with
// template-specific fields: category, regions, requiredWidgets/optionalWidgets/requiredComponents,
// and (for data-bearing templates) dataSources, dataFlow, responsive. dataContract and the
// data-flow fields are OPTIONAL — validated only when present (a config-only template like ErrorPage
// has none; a data dashboard declares all of them).
//
// Dependency rule (do not invent widgets silently): requiredWidgets/optionalWidgets MUST resolve to
// existing tier:widget artifacts; anything not built yet must be listed under
// missingRequiredWidgets / impliedWidgets with status "not-yet-authored" and must NOT already exist.
//
// Run:  node scripts/validators/template-manifest.mjs
// Exit: 0 = pass, 1 = errors.

import {readFileSync, existsSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

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

// ---- strict validation (complete template manifests) ----
const STRICT_REQUIRED = [
	"schemaVersion",
	"id",
	"tier",
	"name",
	"category",
	"source",
	"intent",
	"when",
	"whenNot",
	"regions",
	"states",
	"composedOf",
	"allowedPlacement",
	"commonMistakes",
	"minimalExample",
	"evaluationCriteria",
	"lineage",
];
const ALLOW_EMPTY = new Set(["requiredWidgets", "requiredComponents", "requiredProviders", "forbiddenPlacement"]);

function validateStrict(m, label) {
	for (const f of STRICT_REQUIRED) {
		if (!(f in m)) err(`${label}: missing required field ${f}`);
		else if (isEmpty(m[f])) err(`${label}: required field empty: ${f}`);
		else ok();
	}

	if (m.tier !== "template") err(`${label}: tier must be "template" (got "${m.tier}")`);
	else ok();

	if (!m.source?.import) err(`${label}: source.import required`);
	else ok();

	// A template must declare its composition surface: at least one of requiredWidgets / requiredComponents.
	const hasWidgets = "requiredWidgets" in m;
	const hasComponents = "requiredComponents" in m;
	if (!hasWidgets && !hasComponents)
		err(`${label}: must declare requiredWidgets and/or requiredComponents (may be empty arrays)`);
	else ok();
	for (const f of ["requiredWidgets", "requiredComponents", "requiredProviders", "forbiddenPlacement"])
		if (f in m && !Array.isArray(m[f])) err(`${label}: ${f} must be an array`);

	// regions: non-empty array of { id, role }.
	if (Array.isArray(m.regions)) {
		for (const r of m.regions) {
			if (!r || !r.id || !r.role) err(`${label}: each region needs an id and a role`);
			else ok();
		}
	} else err(`${label}: regions must be an array`);

	// composedOf + region/required references must resolve to known catalog artifacts.
	for (const n of m.composedOf ?? []) flat[n] ? ok() : err(`${label}: composedOf references unknown artifact ${n}`);
	for (const c of m.requiredComponents ?? []) {
		const n = typeof c === "string" ? c : c?.name;
		if (!n) err(`${label}: requiredComponents entry missing name`);
		else if (!flat[n]) err(`${label}: requiredComponents references unknown artifact ${n}`);
		else ok();
	}
	for (const key of ["requiredWidgets", "optionalWidgets"]) {
		for (const c of m[key] ?? []) {
			const n = typeof c === "string" ? c : c?.name;
			if (!n) err(`${label}: ${key} entry missing name`);
			else if (!flat[n]) err(`${label}: ${key} references unknown artifact ${n}`);
			else if (flat[n].tier !== "widget") err(`${label}: ${key} "${n}" is not tier:widget`);
			else ok();
		}
	}

	// Dependency rule (do not invent widgets silently): missing/implied widgets must be honestly
	// flagged "not-yet-authored" and must NOT already exist — a real artifact belongs in
	// requiredWidgets/optionalWidgets, not the missing bucket.
	for (const key of ["missingRequiredWidgets", "impliedWidgets"]) {
		for (const w of m[key] ?? []) {
			const n = typeof w === "string" ? w : w?.name;
			if (!n) {
				err(`${label}: ${key} entry missing name`);
				continue;
			}
			if (w.status !== "not-yet-authored")
				err(`${label}: ${key} "${n}" must have status "not-yet-authored" (got "${w.status ?? "unset"}")`);
			else ok();
			if (flat[n])
				err(
					`${label}: ${key} "${n}" already exists (tier:${flat[n].tier}) — move it to requiredWidgets/optionalWidgets, don't list it as missing`,
				);
			else ok();
		}
	}

	// Optional data-flow fields — validated only when present (templates legitimately differ:
	// a config-only template like ErrorPage has none; a data dashboard declares all three).
	if ("dataSources" in m) {
		if (!Array.isArray(m.dataSources) || m.dataSources.length === 0)
			err(`${label}: dataSources must be a non-empty array when present`);
		else for (const ds of m.dataSources) ds && ds.id ? ok() : err(`${label}: dataSources entry needs an id`);
	}
	if ("dataFlow" in m && (!Array.isArray(m.dataFlow) || m.dataFlow.length === 0))
		err(`${label}: dataFlow must be a non-empty array when present`);
	if ("responsive" in m && isEmpty(m.responsive)) err(`${label}: responsive must be non-empty when present`);

	// dataContract is OPTIONAL for templates; if present and applicable, it must declare input.
	if (m.dataContract && m.dataContract.applicable !== false && !m.dataContract.input)
		err(`${label}: dataContract present and applicable but missing input (set applicable:false if N/A)`);
	else ok();

	// failure-mode ids (if any) must exist in domain_map.yaml — same rule as widgets.
	let dm = "";
	try {
		dm = read("skills/_artifacts/domain_map.yaml");
	} catch {
		/* ignore */
	}
	for (const mk of m.commonMistakes ?? [])
		if (mk.id) dm && !dm.includes(mk.id) ? err(`${label}: failure mode ${mk.id} not found in domain_map.yaml`) : ok();

	for (const c of m.evaluationCriteria ?? [])
		if (!c.id || !c.check) err(`${label}: evaluationCriteria entry missing id/check`);
}

// ---- light validation (stub template manifests) ----
const STUB_REQUIRED = ["schemaVersion", "id", "tier", "name", "category", "source", "intent", "manifestStatus"];
function validateStub(m, label) {
	for (const f of STUB_REQUIRED) {
		if (!(f in m)) err(`${label}: stub missing field ${f}`);
		else if (isEmpty(m[f]) && f !== "intent") err(`${label}: stub field empty: ${f}`);
		else ok();
	}
	if (m.tier !== "template") err(`${label}: stub tier must be "template"`);
	if (m.manifestStatus === "variant") {
		if (!m.variantOf || !m.variantOf.template) err(`${label}: variant requires variantOf.template`);
		else ok();
	} else if (m.manifestStatus !== "stub" && m.manifestStatus !== "draft") {
		warn(`${label}: stub manifestStatus is "${m.manifestStatus}" (expected stub/draft/variant)`);
	}
}

// ---- iterate the template tier ----
const templates = names.filter((n) => flat[n].tier === "template");
let complete = 0,
	stub = 0,
	variant = 0,
	missingManifest = 0;
const notYetManifested = [];

for (const name of templates) {
	const e = flat[name];
	const label = `[${name}]`;
	if (!e.manifest) {
		notYetManifested.push(name);
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
	} else if (status === "variant") {
		variant++;
		validateStub(m, label);
	} else {
		stub++;
		validateStub(m, label);
	}
}

// ---- output ----
const tag = "[template-manifest]";
console.log(
	`${tag} template tier: ${templates.length} entries — ${complete} complete, ${variant} variant, ${stub} stub,` +
		`${missingManifest} missing manifest, ${notYetManifested.length} not yet manifested`,
);
if (notYetManifested.length)
	console.log(`${tag} not yet manifested (tier-tagged, no manifest yet): ${notYetManifested.join(", ")}`);
for (const w of warnings) console.log(`${tag} ⚠ ${w}`);
if (errors.length) {
	for (const e of errors) console.log(`${tag} ✗ ${e}`);
	console.log(`\n${tag} FAIL — ${errors.length} error(s), ${warnings.length} warning(s), ${checks} checks passed.`);
	process.exit(1);
}
console.log(`${tag} ✓ PASS — ${checks} checks passed, ${warnings.length} warning(s), 0 errors.`);
