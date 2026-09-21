// Metric: correct component choice.
// Task fixtures declare `expected` (the right pick), `acceptable` (defensible
// alternatives — avoids brittle overfitting), and `forbidden` (the classic wrong pick
// the catalog warns against). We check what the agent actually reached for, and when it
// picks a forbidden component we surface the catalog's own `chooseOver` rationale.

import {finding, references} from "./util.mjs";

const METRIC = "component-choice";

function used(code, name) {
	// Match the bare component name and common sub-parts (Sheet → SheetContent, etc.).
	return references(code, name) || references(code, `${name}Content`) || references(code, `${name}Trigger`);
}

/** Pull the catalog's reason for choosing `expected` over `forbidden`, if recorded. */
function rationale(catalog, expected, forbidden) {
	for (const name of expected) {
		const entry = (catalog.byName.get(name)?.chooseOver ?? []).find(
			(co) => co.component && forbidden.some((f) => co.component.toLowerCase().includes(f.toLowerCase())),
		);
		if (entry?.because) return entry.because;
	}
	return "";
}

/**
 * @param {string} code
 * @param {{expected?: string[], acceptable?: string[], forbidden?: string[]}} task
 * @param {import("./load.mjs").Catalog} catalog
 * @returns {import("./util.mjs").Finding[]}
 */
export function validateComponentChoice(code, task, catalog) {
	const expected = task.expected ?? [];
	const acceptable = task.acceptable ?? [];
	const forbidden = task.forbidden ?? [];
	if (expected.length === 0 && forbidden.length === 0) {
		return [finding(METRIC, true, "Task declares no component-choice expectation.", "", "eval/tasks")];
	}

	const chosenForbidden = forbidden.filter((f) => used(code, f));
	if (chosenForbidden.length > 0) {
		const why = rationale(catalog, expected, chosenForbidden);
		return [
			finding(
				METRIC,
				false,
				`Used ${chosenForbidden.join(", ")} where ${expected.join("/") || "a different component"} was expected.${why ? ` ${why}` : ""}`,
				`Use ${expected.join(" or ")}${acceptable.length ? ` (or ${acceptable.join("/")})` : ""} instead.`,
				expected[0] ? `library-index.json#${expected[0]}.chooseOver` : "eval/tasks",
			),
		];
	}

	const allowed = [...expected, ...acceptable];
	if (allowed.some((name) => used(code, name))) {
		return [
			finding(
				METRIC,
				true,
				`Chose an expected/acceptable component (${allowed.filter((n) => used(code, n)).join(", ")}).`,
				"",
				"eval/tasks",
			),
		];
	}

	return [
		finding(
			METRIC,
			false,
			`None of the expected components (${expected.join(", ") || "—"}) were used.`,
			`Reach for ${expected.join(" or ") || "the documented component"} for this decision.`,
			expected[0] ? `library-index.json#${expected[0]}` : "eval/tasks",
		),
	];
}
