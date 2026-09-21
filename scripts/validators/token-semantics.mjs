import {isKnownWakeCoreToken, tokenColorRole, wakecoreTokenType} from "./token-catalog.mjs";

const SOURCE_RE = /\.(?:[cm]?[jt]sx?)$/i;
const REFERENCE_ALIAS_RE = /^--(?:ref|reference)-color-/i;
const RAW_COLOR_RE = /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch|oklab)a?\(\s*[.\d]/gi;
const COLOR_CONTEXT_RE =
	/\b(?:color|background|border|fill|stroke|shadow|chart|series|itemStyle|lineStyle|areaStyle)\b/i;

function lineAt(content, offset) {
	return content.slice(0, offset).split(/\r?\n/).length;
}

function expectedRole(name) {
	const bare = name.replace(/^--/, "").toLowerCase();
	if (/muted.*(?:foreground|text)|(?:foreground|text).*muted/.test(bare)) return "muted-foreground";
	if (/\bborder\b/.test(bare.replaceAll("-", " "))) return "border";
	if (/(?:destructive|danger|error)/.test(bare)) return "destructive";
	if (/(?:foreground|text|ink)/.test(bare)) return "foreground-family";
	if (/(?:background|surface|canvas|panel|\bbg\b)/.test(bare.replaceAll("-", " "))) return "background-family";
	return undefined;
}

function compatible(expected, actual) {
	if (!expected || !actual) return true;
	if (expected === "foreground-family") return actual === "foreground" || actual.endsWith("-foreground");
	if (expected === "background-family") return !actual.endsWith("-foreground") && !["border", "ring"].includes(actual);
	return actual === expected || actual.startsWith(`${expected}-`);
}

export function analyzeTokenSemantics(files, provenance) {
	const referenceAliases = provenance.definitions
		.filter((definition) => REFERENCE_ALIAS_RE.test(definition.name))
		.map((definition) => ({...definition, kind: "reference-palette-alias"}));
	const unresolvedTokens = provenance.issues.filter((usage) => usage.status === "unresolved");
	const semanticRoleIssues = [];
	for (const definition of provenance.definitions) {
		const expected = expectedRole(definition.name);
		for (const terminal of definition.terminalTokens ?? []) {
			const actual = tokenColorRole(terminal);
			if (expected && !compatible(expected, actual))
				semanticRoleIssues.push({
					name: definition.name,
					terminal,
					expected,
					actual: actual ?? "non-color",
					path: definition.path,
					line: definition.line,
					kind: "semantic-role-mismatch",
				});
		}
	}
	for (const usage of provenance.usages) {
		for (const terminal of usage.terminalTokens ?? []) {
			const role = tokenColorRole(terminal);
			const backgroundProperty = /^background(?:-color)?$/i.test(usage.property);
			const foregroundProperty = /^(?:color|fill|stroke)$/i.test(usage.property);
			const incompatible =
				(backgroundProperty && role?.endsWith("-foreground")) ||
				(foregroundProperty && ["background", "card", "popover", "muted", "accent", "secondary"].includes(role));
			if (incompatible)
				semanticRoleIssues.push({
					name: usage.name,
					terminal,
					expected: backgroundProperty ? "background-family" : "foreground-family",
					actual: role,
					property: usage.property,
					path: usage.path,
					line: usage.line,
					kind: "property-role-mismatch",
				});
		}
	}

	const syntaxIssues = [];
	const sourceColors = [];
	for (const file of files) {
		const wrapperRe = /\b(hsl|rgb|oklch|oklab)\(\s*var\(\s*(--[\w-]+)\s*\)\s*\)/gi;
		let match;
		while ((match = wrapperRe.exec(file.content)) !== null) {
			const usage = provenance.usages.find((item) => item.name === match[2]);
			const terminals = usage?.terminalTokens?.length ? usage.terminalTokens : [match[2]];
			if (
				terminals.some((terminal) => isKnownWakeCoreToken(terminal) && wakecoreTokenType(terminal) === "complete-color")
			)
				syntaxIssues.push({
					wrapper: match[1].toLowerCase(),
					token: match[2],
					path: file.path,
					line: lineAt(file.content, match.index),
					kind: "complete-color-wrapper",
				});
		}
		if (!SOURCE_RE.test(file.path) && !["tsx", "ts", "jsx", "js"].includes(file.language)) continue;
		for (const [index, line] of file.content.split(/\r?\n/).entries()) {
			if (!COLOR_CONTEXT_RE.test(line)) continue;
			for (const color of line.match(RAW_COLOR_RE) ?? [])
				sourceColors.push({value: color, path: file.path, line: index + 1, kind: "source-color-literal"});
		}
	}

	return {
		referenceAliases,
		unresolvedTokens,
		semanticRoleIssues,
		syntaxIssues,
		sourceColors,
		pass:
			referenceAliases.length === 0 &&
			unresolvedTokens.length === 0 &&
			semanticRoleIssues.length === 0 &&
			syntaxIssues.length === 0,
	};
}
