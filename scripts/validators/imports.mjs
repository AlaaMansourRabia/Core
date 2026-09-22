// Metric: correct imports.
// Rules derived from the `exports` map in packages/components/package.json:
//   1. Components must be imported via their deep subpath (@corensystem/core-ui/button),
//      never the barrel (@corensystem/core-ui) — the barrel only re-exports types /
//      services / mock-data, so a barrel component import is `undefined` at runtime
//      (fm-prim-1 / fm-setup-1).
//   2. Any @corensystem/core-ui/<path> used must be a real exported subpath.

import {finding, parseImports, stripComments} from "./util.mjs";

const METRIC = "imports";

/**
 * @param {string} code
 * @param {import("./load.mjs").Catalog} catalog
 * @returns {import("./util.mjs").Finding[]}
 */
export function validateImports(code, catalog) {
	const findings = [];
	const componentNames = new Set(catalog.components.map((c) => c.name));
	const imports = parseImports(stripComments(code));

	for (const imp of imports) {
		const {specifier, names} = imp;
		if (!specifier.startsWith(catalog.coreUi)) continue;

		// Rule 1 — barrel import of a real component.
		if (specifier === catalog.coreUi) {
			const offending = names.filter((n) => componentNames.has(n));
			if (offending.length > 0) {
				const example = offending[0];
				const sub = catalog.byName.get(example)?.import ?? `${catalog.coreUi}/<component>`;
				findings.push(
					finding(
						METRIC,
						false,
						`Barrel import of ${offending.join(", ")} from "${catalog.coreUi}" — the barrel only re-exports types/services, so these are undefined at runtime.`,
						`Use the deep path, e.g. import { ${example} } from "${sub}".`,
						"fm-prim-1",
					),
				);
			}
			continue;
		}

		// Rule 2 — subpath must exist in the exports map.
		if (!catalog.exportsSet.has(specifier)) {
			findings.push(
				finding(
					METRIC,
					false,
					`Import path "${specifier}" is not an exported subpath of ${catalog.coreUi}.`,
					`Check packages/components/package.json exports — the path may be misspelled or the component lives under a scope (chat/, navigation/, pages/).`,
					"packages/components/package.json#exports",
				),
			);
		}
	}

	if (findings.length === 0) {
		findings.push(
			finding(
				METRIC,
				true,
				"All @corensystem/core-ui imports use valid deep subpaths.",
				"",
				"packages/components/package.json#exports",
			),
		);
	}
	return findings;
}
