// Shared loader for the deterministic validators.
//
// The validators are PURE: they take a `catalog` object (the data below) plus a
// code string and return Finding[]. This loader is the ONLY place that touches the
// filesystem, so the validator logic stays portable — ready to extract into a
// shippable `@core/validate` package later (the catalog can then be bundled or
// passed in by the consumer).
//
// Sources of truth (never duplicated, always derived):
//   - library-index.json                  → components + `requires` (provider wiring)
//   - packages/components/package.json     → `exports` map (valid import subpaths)
//   - skills/_artifacts/domain_map.yaml    → fm-* failure modes (wrong/correct fixtures)

import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {parse as parseYaml} from "yaml";

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const CORE_UI = "@corensystem/core-ui";

/** Flatten the category-keyed `components` object into a single array. */
function flattenComponents(index) {
	const out = [];
	for (const arr of Object.values(index.components ?? {})) {
		for (const c of arr) out.push(c);
	}
	return out;
}

/** Build the set of valid `@corensystem/core-ui/...` import specifiers from the exports map. */
function buildExportsSet(pkg) {
	const set = new Set();
	for (const key of Object.keys(pkg.exports ?? {})) {
		if (key === ".") {
			set.add(CORE_UI); // the barrel (valid path, but only for types/services — see fm-prim-1)
		} else if (key.startsWith("./")) {
			set.add(`${CORE_UI}/${key.slice(2)}`);
		}
	}
	return set;
}

/** Collect every fm-* failure mode across all domains, flattened with its domain slug. */
function flattenFailureModes(domainMap) {
	const out = [];
	for (const domain of domainMap.domains ?? []) {
		for (const skill of domain.skills ?? []) {
			for (const fm of skill.failure_modes ?? []) {
				out.push({...fm, domain: domain.slug});
			}
		}
	}
	return out;
}

/**
 * Load the catalog once and return the shape the validators consume.
 * Pass the result into each validator (or use gradeSnippet, which calls this for you).
 */
export function loadCatalog() {
	const index = JSON.parse(readFileSync(join(repoRoot, "library-index.json"), "utf8"));
	const pkg = JSON.parse(readFileSync(join(repoRoot, "packages", "components", "package.json"), "utf8"));
	const domainMap = parseYaml(readFileSync(join(repoRoot, "skills", "_artifacts", "domain_map.yaml"), "utf8"));

	const components = flattenComponents(index);
	const byName = new Map(components.map((c) => [c.name, c]));

	// Provider-wiring rules: every component with a non-empty `requires` in the catalog.
	// `requires` lists the ancestor/hook each component needs (the authoritative source).
	const requires = components
		.filter((c) => Array.isArray(c.requires) && c.requires.length > 0)
		.map((c) => ({component: c.name, requires: c.requires}));

	const failureModes = flattenFailureModes(domainMap);

	return {
		coreUi: CORE_UI,
		components,
		byName,
		patterns: index.patterns ?? [],
		exportsSet: buildExportsSet(pkg),
		requires,
		failureModes,
		failureModeById: new Map(failureModes.map((fm) => [fm.id, fm])),
	};
}
