// P2 catalog-integrity / drift detection. The catalog sync scripts have no drift
// detection today, so a renamed/removed component silently leaves a stale entry. This
// reuses the SAME catalog the eval graders use — one source of truth, checked three ways.
//
// Kept pure: filesystem access is injected as `fileExists` so this stays portable for the
// future @core/validate extraction. scripts/validate-catalog.mjs supplies the real fs.
//
// Severity:
//   error   → definitive drift (gating): a path that doesn't exist, an import not exported
//   warning → likely-stale signals (non-gating): dangling pairsWith, catalog/exports orphans

/** @returns {{errors: string[], warnings: string[]}} */
export function validateCatalog(catalog, {fileExists}) {
	const errors = [];
	const warnings = [];
	const names = new Set(catalog.components.map((c) => c.name));

	for (const c of catalog.components) {
		// 1 — every declared source path must exist (catches renames/removals).
		if (c.path && !fileExists(c.path)) {
			errors.push(`${c.name}: path "${c.path}" does not exist on disk.`);
		}
		// 2 — every import must be a real exported subpath.
		if (c.import && !catalog.exportsSet.has(c.import)) {
			errors.push(`${c.name}: import "${c.import}" is not in the package.json exports map.`);
		}
		// 3 — pairsWith should reference real catalog components (lenient: warn only).
		for (const p of c.pairsWith ?? []) {
			if (!names.has(p)) warnings.push(`${c.name}: pairsWith references unknown component "${p}".`);
		}
	}

	// 4 — exports that look like top-level components but have no catalog entry (orphans).
	const cataloguedImports = new Set(catalog.components.map((c) => c.import));
	for (const spec of catalog.exportsSet) {
		if (spec === catalog.coreUi) continue;
		const sub = spec.slice(catalog.coreUi.length + 1); // after "@corensystem/core-ui/"
		const isInternal = sub.includes("/") || /^(styles|types|data|services)/.test(sub);
		if (!isInternal && !cataloguedImports.has(spec)) {
			warnings.push(`export "${spec}" has no library-index.json entry (catalog may be incomplete).`);
		}
	}

	return {errors, warnings};
}
