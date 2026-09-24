// Builds the two system prompts for the A/B. The ONLY difference between the arms is
// the knowledge layer — same user task, same output-format instruction — so any lift is
// attributable to the catalog + skills, not to prompt wording.

import {readFileSync} from "node:fs";
import {join} from "node:path";

import {repoRoot} from "../../scripts/validators/load.mjs";
import {resolve, resolvedDigest} from "./resolution.mjs";

// Shared, arm-agnostic output contract. Both arms get this verbatim.
const OUTPUT_CONTRACT = [
	"Respond with a SINGLE self-contained React + TypeScript snippet that implements the request.",
	"Use @corensystem/coren-ui components. Output only one ```tsx code block — no prose before or after.",
].join(" ");

// without-skills: just enough to use the library at all (package name + basic usage).
export function baselineSystem() {
	return [
		"You build React UIs for Core products using the @corensystem/coren-ui component library.",
		"Components are imported from @corensystem/coren-ui.",
		OUTPUT_CONTRACT,
	].join("\n");
}

const DOMAIN_SKILL = {
	composition: "core-ui-composition",
	primitives: "core-ui-components",
	forms: "core-ui-forms",
	"data-tables": "core-ui-data-table",
	charts: "core-ui-charts",
	chat: "core-ui-chat",
};

function readSkill(slug) {
	try {
		return readFileSync(join(repoRoot, "packages", "components", "skills", slug, "SKILL.md"), "utf8");
	} catch {
		return "";
	}
}

// A compact, machine-readable digest of the semantic catalog: the when/why fields an
// agent needs to choose correctly. (Structural noise like variants/sizes is omitted.)
function catalogDigest(catalog) {
	const components = catalog.components.map((c) => ({
		name: c.name,
		import: c.import,
		intent: c.intent,
		when: c.when,
		chooseOver: c.chooseOver,
		requires: c.requires,
		avoid: c.avoid,
	}));
	return JSON.stringify({components, patterns: catalog.patterns}, null, 1);
}

// Failure modes as wrong/correct exemplars so the agent can avoid the known traps.
function failureModeDigest(catalog) {
	return catalog.failureModes
		.map((fm) => `### ${fm.id} — ${fm.title} (${fm.priority})\nWRONG:\n${fm.wrong}\nCORRECT:\n${fm.correct}`)
		.join("\n\n");
}

// with-skills: baseline + the full knowledge layer (composition skill, the task's domain
// skill, the semantic catalog, and the failure-mode exemplars).
export function skilledSystem(task, catalog) {
	const compositionSkill = readSkill("core-ui-composition");
	const domainSlug = DOMAIN_SKILL[task.domain];
	const domainSkill = domainSlug && domainSlug !== "core-ui-composition" ? readSkill(domainSlug) : "";

	return [
		baselineSystem(),
		"",
		"You have access to the Core design-system knowledge below. Use it to choose the right component, wire required providers, and avoid known failure modes.",
		"",
		"## Composition & selection skill",
		compositionSkill,
		domainSkill ? `\n## Domain skill: ${domainSlug}\n${domainSkill}` : "",
		"",
		"## Semantic catalog (intent / when / chooseOver / requires / avoid) + composition patterns",
		catalogDigest(catalog),
		"",
		"## Known failure modes (avoid these)",
		failureModeDigest(catalog),
	].join("\n");
}

// The user turn — identical across arms.
export function userPrompt(task) {
	return task.prompt;
}

export {OUTPUT_CONTRACT};

// ---------------------------------------------------------------------------
// V2 ablation arms (A0–A4). Each arm = a shared core + a PREFIX of the knowledge
// layers below, so the lift between adjacent arms is attributable to exactly one layer:
//   A0  naive        — legacy information-starved baseline (reference only, not a control)
//   A1  fair         — + structural package facts (README/install + exports map + component
//                       API: names, deep-path imports, variants). NO when/why judgment.
//   A2  + semantic   — + the catalog's intent/when/chooseOver/avoid  → isolates SELECTION
//   A3  + composition— + composition skill + patterns                → isolates COMPOSITION
//   A4  + failure    — + domain skill + failure-mode exemplars       → isolates IMPL KNOWLEDGE
// The fair control is A1, not A0: A1 already gives the agent the public package metadata a
// real developer reads (so deep-path imports are *discoverable* — not a hidden convention).

const CORE = [
	"You build React UIs for Core products using the @corensystem/coren-ui component library.",
	OUTPUT_CONTRACT,
].join("\n");

// Neutral, factual package usage — what package.json + README already tell any developer.
// Deliberately does NOT editorialize "never use the barrel" (that is the catalog's job, in A2+).
const INSTALL_NOTE = [
	"Install `@corensystem/coren-ui` and `@corensystem/coren-tokens` from GitHub Packages.",
	'Import the tokens stylesheet once at the app root: `import "@corensystem/coren-tokens";`.',
	"Each component is published as its own subpath export (the full list of valid import paths follows).",
].join("\n");

function exportsList(catalog) {
	return [...catalog.exportsSet].sort().join("\n");
}

// Structural component API: names, deep-path import, description, variants/sizes. The public
// surface — no intent/when/chooseOver/avoid. Sourced from scripts/catalog-structural.json.
function structuralDigest() {
	const structural = JSON.parse(readFileSync(join(repoRoot, "scripts", "catalog-structural.json"), "utf8"));
	const list = Object.values(structural).map((c) => ({
		name: c.name,
		import: c.import,
		description: c.description,
		variants: c.variants,
		sizes: c.sizes,
	}));
	return JSON.stringify(list, null, 1);
}

// Semantic judgment only (components, no patterns — patterns live in the composition layer).
function semanticDigest(catalog) {
	const components = catalog.components.map((c) => ({
		name: c.name,
		intent: c.intent,
		when: c.when,
		chooseOver: c.chooseOver,
		requires: c.requires,
		avoid: c.avoid,
	}));
	return JSON.stringify(components, null, 1);
}

function domainSkillText(task) {
	const slug = DOMAIN_SKILL[task.domain];
	return slug && slug !== "core-ui-composition" ? `## Domain skill: ${slug}\n${readSkill(slug)}` : "";
}

// Prop/type contracts (pilot): generated component-api.json (props/required/enums from .d.ts)
// merged with the hand-authored overlay (forbiddenProps / commonMistakes / minimalExample).
// Empty string if the pilot artifacts are absent — so A0–A4 are unaffected either way.
function contractsDigest() {
	const read = (p) => {
		try {
			return JSON.parse(readFileSync(join(repoRoot, p), "utf8")).components ?? {};
		} catch {
			return null;
		}
	};
	const api = read("eval/contracts/component-api.json");
	const overlay = read("eval/contracts/overlay.json");
	if (!api) return "";
	const merged = {};
	for (const [name, a] of Object.entries(api)) merged[name] = {...a, ...(overlay?.[name] ?? {})};
	return JSON.stringify(merged, null, 1);
}

// The four stackable layers, smallest → largest.
function buildLayers(task, catalog) {
	return {
		structural: [
			"## Package usage",
			INSTALL_NOTE,
			"",
			"## Valid import paths (package exports)",
			exportsList(catalog),
			"",
			"## Component API (structural — names, deep-path import, variants; no guidance)",
			structuralDigest(),
		].join("\n"),
		semantic: [
			"## Semantic catalog (intent / when / chooseOver / requires / avoid)",
			"Use this to choose the RIGHT component for the need.",
			semanticDigest(catalog),
		].join("\n"),
		composition: [
			"## Composition & selection skill",
			readSkill("core-ui-composition"),
			"",
			"## Composition patterns (screen-level recipes)",
			JSON.stringify(catalog.patterns, null, 1),
		].join("\n"),
		failure: ["## Known failure modes (avoid these)", failureModeDigest(catalog), "", domainSkillText(task)].join("\n"),
		contracts: [
			"## Component API contracts (props, required, forbidden, common mistakes, minimal examples)",
			"Use these EXACT prop names/types for the components below — do not invent props.",
			contractsDigest(),
		].join("\n"),
	};
}

// A0–A4 are the V2/V3 ladder (unchanged). A5 = A4 + the prop/type contract layer — opt-in via
// --arms=A5, so default runs are byte-identical to before.
export const ARMS = ["A0", "A1", "A2", "A3", "A4"];
const ARM_DEPTH = {A1: 1, A2: 2, A3: 3, A4: 4, A5: 5};
const LAYER_ORDER = ["structural", "semantic", "composition", "failure", "contracts"];

// AR — the A2 (Knowledge Resolution) arm. Same knowledge classes as A4 (semantic + composition +
// failure), but RESOLVED to a small relevant slice per task instead of injecting the whole catalog.
// Isolates the effect of retrieval: quality should hold vs A4 at a fraction of the tokens.
export function systemForResolutionArm(task, catalog) {
	const slice = resolve(task, catalog);
	return [
		CORE,
		"",
		"You have access to the Core knowledge retrieved as relevant to THIS task. Use it to choose the right component, wire required providers, and avoid the failure modes.",
		"",
		"## Composition & selection skill",
		readSkill("core-ui-composition"),
		"",
		resolvedDigest(slice),
	].join("\n");
}

// Build the system prompt for an ablation arm.
export function systemForArm(arm, task, catalog) {
	if (arm === "A0") return baselineSystem(); // legacy naive reference (NOT the fair control)
	if (arm === "AR") return systemForResolutionArm(task, catalog); // A2 retrieval arm
	const depth = ARM_DEPTH[arm];
	if (!depth) throw new Error(`Unknown arm: ${arm}`);
	const layers = buildLayers(task, catalog);
	const parts = [CORE, "", "You have access to the following Core design-system knowledge. Use it."];
	for (let i = 0; i < depth; i++) parts.push("", layers[LAYER_ORDER[i]]);
	return parts.join("\n");
}
