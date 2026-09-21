// Small shared helpers for the validators: a Finding factory + lightweight,
// dependency-free static analysis of a code snippet (regex-based — good enough for
// snippet-level eval grading; we deliberately avoid a full TS parser to stay portable).

/**
 * The actionable result shape every grader returns. `source` references the fm-* id
 * or catalog entry the rule came from, so a failing eval points straight at the fix.
 * @typedef {{metric: string, pass: boolean, reason: string, suggestedFix: string, source: string}} Finding
 */

/** @returns {Finding} */
export function finding(metric, pass, reason, suggestedFix, source) {
	return {metric, pass, reason, suggestedFix, source};
}

/** Strip line and block comments so heuristics don't match commented-out example code. */
export function stripComments(code) {
	return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

/**
 * Parse `import ... from "..."` statements.
 * @returns {Array<{names: string[], specifier: string, raw: string}>}
 */
export function parseImports(code) {
	const out = [];
	const re = /import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g;
	let m;
	while ((m = re.exec(code)) !== null) {
		const clause = m[1];
		const specifier = m[2];
		const names = [];
		const braced = clause.match(/\{([^}]*)\}/);
		if (braced) {
			for (const part of braced[1].split(",")) {
				const name = part
					.trim()
					.replace(/^type\s+/, "")
					.split(/\s+as\s+/)[0]
					.trim();
				if (name) names.push(name);
			}
		}
		out.push({names, specifier, raw: m[0]});
	}
	return out;
}

/** True if a JSX element `<Name ...>` / `<Name/>` appears in the code. */
export function usesJsx(code, name) {
	return new RegExp(`<${name}(?=[\\s/>])`).test(code);
}

/** True if `name` is referenced at all (JSX element, call, or identifier token). */
export function references(code, name) {
	return usesJsx(code, name) || new RegExp(`\\b${name}\\b`).test(code);
}

/** True if a function/hook is *called*: `name(` appears. */
export function callsFn(code, name) {
	return new RegExp(`\\b${name}\\s*\\(`).test(code);
}
