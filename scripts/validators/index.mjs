// Public entry for the deterministic validators.
//
// These pure graders are written ONCE and reused three ways:
//   - eval graders        (P1b — score with/without-skills agent output)
//   - CI integrity gates  (P2  — validate-catalog.mjs)
//   - shippable validator (P3  — extract to @wakecap/validate)
//
// gradeSnippet() runs all four metric validators and returns a flat Finding[] plus a
// per-metric pass/fail roll-up.

import {validateComponentChoice} from "./component-choice.mjs";
import {analyzeCssOwnership} from "./css-ownership.mjs";
import {detectFailureModes} from "./failure-modes.mjs";
import {analyzeCoverage, extractInventory, normalizeFiles, sourceFiles, styleFiles} from "./file-set.mjs";
import {validateImports} from "./imports.mjs";
import {analyzeInteractionSemantics} from "./interaction-semantics.mjs";
import {loadCatalog} from "./load.mjs";
import {validateProviders} from "./providers.mjs";
import {analyzeTokenCompliance} from "./token-compliance.mjs";
import {analyzeTokenProvenance} from "./token-provenance.mjs";
import {analyzeTokenSemantics} from "./token-semantics.mjs";
import {analyzeVisibility} from "./visibility.mjs";

export {loadCatalog} from "./load.mjs";
export {validateImports} from "./imports.mjs";
export {analyzeInteractionSemantics} from "./interaction-semantics.mjs";
export {validateProviders} from "./providers.mjs";
export {detectFailureModes, RUNTIME_ONLY, DETECTED_IDS} from "./failure-modes.mjs";
export {validateComponentChoice} from "./component-choice.mjs";
export {normalizeFiles, analyzeCoverage, extractInventory} from "./file-set.mjs";
export {analyzeTokenCompliance} from "./token-compliance.mjs";
export {analyzeTokenProvenance} from "./token-provenance.mjs";
export {analyzeTokenSemantics} from "./token-semantics.mjs";
export {analyzeCssOwnership} from "./css-ownership.mjs";
export {analyzeVisibility} from "./visibility.mjs";

/**
 * Grade one code snippet against all four success metrics.
 * @param {string} code        agent-generated (or fixture) code
 * @param {object} task        eval task fixture (expected/acceptable/forbidden); {} is fine
 * @param {object} [catalog]   loadCatalog() result; loaded lazily if omitted
 * @returns {{findings: import("./util.mjs").Finding[], metrics: Record<string, boolean>, pass: boolean}}
 */
export function gradeSnippet(code, task = {}, catalog = loadCatalog()) {
	const findings = [
		...validateComponentChoice(code, task, catalog),
		...validateImports(code, catalog),
		...validateProviders(code, catalog),
		...detectFailureModes(code, catalog),
	];

	const metrics = {};
	for (const f of findings) {
		// A metric passes only if every finding for it passes.
		metrics[f.metric] = (metrics[f.metric] ?? true) && f.pass;
	}

	return {findings, metrics, pass: Object.values(metrics).every(Boolean)};
}

/**
 * Grade a TS/TSX/CSS file set while preserving gradeSnippet's findings/metrics/pass.
 * @param {Array<{path: string, content?: string, code?: string}>|Record<string,string>} files
 * @param {object} task
 * @param {object} [catalog]
 */
export function gradeFileSet(files, task = {}, catalog = loadCatalog()) {
	const normalized = normalizeFiles(files);
	const sources = sourceFiles(normalized);
	const styles = styleFiles(normalized);
	const combinedCode = sources.map((file) => `// ${file.path}\n${file.content}`).join("\n");
	const base = gradeSnippet(combinedCode, task, catalog);
	const visibility = analyzeVisibility(sources);
	const coverage = analyzeCoverage(normalized, catalog, visibility);
	const tokens = analyzeTokenCompliance(styles);
	const tokenProvenance = tokens.provenance;
	const tokenSemantics = analyzeTokenSemantics(normalized, tokenProvenance);
	const cssOwnership = analyzeCssOwnership(styles);
	const interactionSemantics = analyzeInteractionSemantics(sources);
	const inventory = extractInventory(normalized);

	const findings = [...base.findings];
	for (const category of Object.keys(tokens.categories)) {
		const failures = tokens.hardCoded.filter((item) => item.category === category);
		findings.push({
			metric: `tokens-${category}`,
			pass: failures.length === 0,
			reason: failures.length
				? `${failures.length} hard-coded ${category} value(s) found.`
				: `No hard-coded ${category} values found.`,
			suggestedFix: failures.length
				? "Replace authored literals with WakeCore CSS variables, or document a narrow wakecore-token-exception."
				: "",
			source: failures[0] ? `${failures[0].path}:${failures[0].line}` : "file-set",
		});
	}
	findings.push({
		metric: "token-provenance",
		pass: tokenProvenance.issues.length === 0,
		reason: tokenProvenance.issues.length
			? `${tokenProvenance.issues.length} CSS variable usage(s) do not terminate in a recognized WakeCore token.`
			: "All CSS variable usages terminate in recognized WakeCore tokens.",
		suggestedFix: tokenProvenance.issues.length
			? "Replace literal-backed, unresolved, or cyclic variables with aliases that terminate in @wakecap/core-tokens variables."
			: "",
		source: tokenProvenance.issues[0]
			? `${tokenProvenance.issues[0].path}:${tokenProvenance.issues[0].line}`
			: "file-set",
	});
	const semanticIssueCount =
		tokenSemantics.referenceAliases.length +
		tokenSemantics.unresolvedTokens.length +
		tokenSemantics.semanticRoleIssues.length +
		tokenSemantics.syntaxIssues.length;
	const firstSemanticIssue =
		tokenSemantics.referenceAliases[0] ??
		tokenSemantics.unresolvedTokens[0] ??
		tokenSemantics.semanticRoleIssues[0] ??
		tokenSemantics.syntaxIssues[0];
	findings.push({
		metric: "token-semantics",
		pass: tokenSemantics.pass,
		reason: tokenSemantics.pass
			? "All WakeCore token references exist, preserve semantic roles, and use compatible CSS syntax."
			: `${semanticIssueCount} token semantic/syntax issue(s) found.`,
		suggestedFix: tokenSemantics.pass
			? ""
			: "Use existing semantic WakeCore tokens by purpose, remove reference-palette aliases, and do not wrap complete color tokens in hsl()/rgb().",
		source: firstSemanticIssue ? `${firstSemanticIssue.path}:${firstSemanticIssue.line}` : "file-set",
	});
	findings.push({
		metric: "source-color-literals",
		pass: tokenSemantics.sourceColors.length === 0,
		reason: tokenSemantics.sourceColors.length
			? `${tokenSemantics.sourceColors.length} raw color literal(s) found in TS/TSX/JS configuration or SVG props.`
			: "No raw color literals found in TS/TSX/JS configuration or SVG props.",
		suggestedFix: tokenSemantics.sourceColors.length
			? "Replace chart, inline-style, and SVG color literals with existing WakeCore semantic or chart tokens."
			: "",
		source: tokenSemantics.sourceColors[0]
			? `${tokenSemantics.sourceColors[0].path}:${tokenSemantics.sourceColors[0].line}`
			: "file-set",
	});
	findings.push({
		metric: "css-ownership",
		pass: cssOwnership.pass,
		reason: cssOwnership.pass
			? "No excessive application-owned widget anatomy or internal WakeCore overrides found."
			: `${cssOwnership.issues.length} CSS ownership risk(s) found: ${cssOwnership.issues.map((issue) => issue.kind).join(", ")}.`,
		suggestedFix: cssOwnership.pass
			? ""
			: "Use WakeCore-owned regions and public styling APIs; remove internal selector overrides and broad custom visual systems.",
		source: cssOwnership.internalOverrides[0]
			? `${cssOwnership.internalOverrides[0].path}:${cssOwnership.internalOverrides[0].line}`
			: "file-set",
	});
	const semanticInteractionCount =
		interactionSemantics.duplicateComposers.length +
		interactionSemantics.redundantSurfaceWrappers.length +
		interactionSemantics.fabricatedBackNavigation.length +
		interactionSemantics.decorativeCanvases.length +
		interactionSemantics.duplicateSurfaceBoundaries.length +
		interactionSemantics.inactiveGaps.length;
	findings.push({
		metric: "interaction-semantics",
		pass: interactionSemantics.pass,
		reason: interactionSemantics.pass
			? "Navigation, composition, surfaces, and canvas controls have one meaningful owner."
			: `${semanticInteractionCount} duplicate, redundant, fabricated, or decorative interaction issue(s) found.`,
		suggestedFix: interactionSemantics.pass
			? ""
			: "Assign one owner per task and surface boundary, use gap only on flex/grid layouts, remove redundant wrappers/back controls, and provide functional canvas behavior.",
		source:
			interactionSemantics.duplicateComposers[0]?.path ??
			interactionSemantics.redundantSurfaceWrappers[0]?.path ??
			interactionSemantics.fabricatedBackNavigation[0]?.path ??
			interactionSemantics.decorativeCanvases[0]?.path ??
			interactionSemantics.duplicateSurfaceBoundaries[0]?.path ??
			interactionSemantics.inactiveGaps[0]?.path ??
			"file-set",
	});
	findings.push({
		metric: "artifact-visibility",
		pass: visibility.hidden.length === 0 && visibility.nearZero.length === 0,
		reason:
			visibility.hidden.length || visibility.nearZero.length
				? `${visibility.hidden.length} hidden and ${visibility.nearZero.length} near-zero component render(s) found.`
				: "No statically hidden or near-zero component renders found.",
		suggestedFix: "Render showcase artifacts at a visible, usable size; use a browser audit for runtime visibility.",
		source: "file-set",
	});

	const metrics = {...base.metrics};
	for (const finding of findings.slice(base.findings.length))
		metrics[finding.metric] = (metrics[finding.metric] ?? true) && finding.pass;
	return {
		findings,
		metrics,
		pass: Object.values(metrics).every(Boolean),
		coverage,
		tokens,
		tokenProvenance,
		tokenSemantics,
		cssOwnership,
		interactionSemantics,
		visibility,
		inventory,
		files: normalized.map(({path}) => path),
	};
}
