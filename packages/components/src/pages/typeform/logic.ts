// The conditional-logic engine. Given a form + the current answers, computes for EVERY question
// whether it is visible / required / editable, which choice options are allowed, and its default.
// Pure and shared by the builder (previews of rules), the validator (compile.ts) and the filler.
//
// Forward-reference guard: a condition may only reference a question that appears earlier; a rule
// referencing a same-or-later question evaluates that condition to false.
import type {Condition, FormSchema, Question, RuleGroup, Section} from "./model";

export interface QuestionState {
	visible: boolean;
	required: boolean;
	editable: boolean;
	/** Choice types: the option values currently allowed; undefined ⇒ all options offered. */
	allowedValues?: string[];
	defaultValue?: unknown;
}

function answered(v: unknown): boolean {
	if (v == null) return false;
	if (typeof v === "string") return v.trim().length > 0;
	if (Array.isArray(v)) return v.length > 0;
	return true;
}

/** Evaluate one condition against the current answers. */
export function evaluateCondition(c: Condition, answers: Record<string, unknown>): boolean {
	const a = answers[c.questionId];
	switch (c.operator) {
		case "answered":
			return answered(a);
		case "not_answered":
			return !answered(a);
		case "includes":
			return Array.isArray(a) ? a.map(String).includes(String(c.value)) : String(a) === String(c.value);
		case "eq":
			return String(a ?? "") === String(c.value ?? "");
		case "neq":
			return String(a ?? "") !== String(c.value ?? "");
		case "gt":
			return Number(a) > Number(c.value);
		case "lt":
			return Number(a) < Number(c.value);
	}
}

/**
 * Evaluate a rule group. `allowed` is the set of question ids that may be referenced (the earlier
 * questions); references outside it evaluate to false. `fallback` is returned when there is no rule
 * or it has no conditions.
 */
export function evaluateRule(
	rule: RuleGroup | undefined,
	answers: Record<string, unknown>,
	allowed: Set<string>,
	fallback: boolean,
): boolean {
	if (!rule || rule.conditions.length === 0) return fallback;
	const results = rule.conditions.map((c) => (allowed.has(c.questionId) ? evaluateCondition(c, answers) : false));
	return rule.match === "any" ? results.some(Boolean) : results.every(Boolean);
}

/** Compute the full per-question state map for a set of answers. */
export function evaluateForm(schema: FormSchema, answers: Record<string, unknown>): Record<string, QuestionState> {
	const result: Record<string, QuestionState> = {};

	schema.questions.forEach((q, i) => {
		const allowed = new Set(schema.questions.slice(0, i).map((x) => x.id));

		const visible = evaluateRule(q.visibilityRule, answers, allowed, true);
		const editable = evaluateRule(q.editableRule, answers, allowed, true);

		let required: boolean;
		if (!visible || !editable) {
			required = false; // hidden or non-editable is never required
		} else {
			// Toggle and requiredness rule are SEPARATE behaviours combined with OR: required if the
			// Required toggle is on, OR the (optional) requiredness rule passes.
			const ruleRequires = q.requirednessRule ? evaluateRule(q.requirednessRule, answers, allowed, false) : false;
			required = q.required || ruleRequires;
		}

		let allowedValues: string[] | undefined;
		for (const r of q.optionRestrictions ?? []) {
			const inForce = r.rule ? evaluateRule(r.rule, answers, allowed, true) : true;
			if (!inForce) continue;
			allowedValues =
				allowedValues === undefined ? [...r.allowedValues] : allowedValues.filter((v) => r.allowedValues.includes(v)); // intersect
		}

		result[q.id] = {visible, required, editable, allowedValues, defaultValue: q.defaultValue};
	});

	return result;
}

// ── Rule-dependency integrity (broken-logic detection + reorder guards) ────────
// A rule creates an ordering dependency: the referenced question must stay EARLIER than the question
// that uses it. Reordering can violate that; these helpers detect it so the builder can warn + flag.

/** Every rule attached to a question (the three logic rules + option-restriction rules). */
function rulesOf(q: Question): (RuleGroup | undefined)[] {
	return [q.visibilityRule, q.requirednessRule, q.editableRule, ...(q.optionRestrictions ?? []).map((r) => r.rule)];
}

function ruleBroken(rule: RuleGroup | undefined, ownerIndex: number, indexOf: Map<string, number>): boolean {
	if (!rule) return false;
	return rule.conditions.some((c) => {
		const ri = indexOf.get(c.questionId);
		return ri === undefined || ri >= ownerIndex; // references a same/later question, or a deleted one
	});
}

/** The set of question ids whose logic is broken for a given question ORDER. */
function brokenSet(questions: Question[]): Set<string> {
	const indexOf = new Map(questions.map((q, i) => [q.id, i]));
	const broken = new Set<string>();
	questions.forEach((q, i) => {
		if (rulesOf(q).some((rule) => ruleBroken(rule, i, indexOf))) broken.add(q.id);
	});
	return broken;
}

/** Is a specific question's logic currently broken (references a non-earlier / missing question)? */
export function questionLogicBroken(schema: FormSchema, questionId: string): boolean {
	return brokenSet(schema.questions).has(questionId);
}

/** All question ids whose logic is currently broken. */
export function brokenQuestionIds(schema: FormSchema): string[] {
	return [...brokenSet(schema.questions)];
}

/** Order questions by their section's position (stable within a section); orphans → first section. */
export function orderBySections(questions: Question[], sections: Section[]): Question[] {
	const order = new Map(sections.map((s, i) => [s.id, i]));
	return questions
		.map((q, i) => ({q, i}))
		.sort((a, b) => {
			const sa = a.q.sectionId != null && order.has(a.q.sectionId) ? (order.get(a.q.sectionId) ?? 0) : 0;
			const sb = b.q.sectionId != null && order.has(b.q.sectionId) ? (order.get(b.q.sectionId) ?? 0) : 0;
			return sa !== sb ? sa - sb : a.i - b.i;
		})
		.map((x) => x.q);
}

export interface BreakCheck {
	breaks: boolean;
	/** Question ids whose logic would become broken by the move. */
	newlyBroken: string[];
}

/** Would moving the question at index `from` to `to` NEWLY break any rule dependency? */
export function wouldReorderBreak(schema: FormSchema, from: number, to: number): BreakCheck {
	const list = schema.questions;
	if (from < 0 || from >= list.length || to < 0 || to >= list.length || from === to) {
		return {breaks: false, newlyBroken: []};
	}
	const before = brokenSet(list);
	const next = [...list];
	const [moved] = next.splice(from, 1);
	next.splice(to, 0, moved);
	const after = brokenSet(next);
	const newlyBroken = [...after].filter((id) => !before.has(id));
	return {breaks: newlyBroken.length > 0, newlyBroken};
}

/**
 * Would moving question `id` into `toSectionId` (inserted before `beforeId`, or appended when null)
 * NEWLY break any rule dependency? Simulates the exact move the reducer performs.
 */
export function wouldMoveQuestionBreak(
	schema: FormSchema,
	id: string,
	toSectionId: string | undefined,
	beforeId: string | null,
): BreakCheck {
	const moving = schema.questions.find((q) => q.id === id);
	if (!moving) return {breaks: false, newlyBroken: []};
	const before = brokenSet(schema.questions);
	const without = schema.questions.filter((q) => q.id !== id);
	const updated: Question = {...moving, sectionId: toSectionId};
	const idx = beforeId ? without.findIndex((q) => q.id === beforeId) : -1;
	const next = idx >= 0 ? [...without.slice(0, idx), updated, ...without.slice(idx)] : [...without, updated];
	const after = brokenSet(orderBySections(next, schema.sections ?? []));
	const newlyBroken = [...after].filter((x) => !before.has(x));
	return {breaks: newlyBroken.length > 0, newlyBroken};
}

/** Would reordering the section at index `from` to index `to` NEWLY break any rule? */
export function wouldReorderSectionsBreak(schema: FormSchema, from: number, to: number): BreakCheck {
	const sections = schema.sections ?? [];
	if (from === to || from < 0 || to < 0 || from >= sections.length || to >= sections.length) {
		return {breaks: false, newlyBroken: []};
	}
	const before = brokenSet(schema.questions);
	const next = [...sections];
	const [m] = next.splice(from, 1);
	next.splice(to, 0, m);
	const after = brokenSet(orderBySections(schema.questions, next));
	const newlyBroken = [...after].filter((x) => !before.has(x));
	return {breaks: newlyBroken.length > 0, newlyBroken};
}

/** Would moving a section up/down NEWLY break any rule (because questions get re-grouped)? */
export function wouldMoveSectionBreak(schema: FormSchema, sectionId: string, direction: "up" | "down"): BreakCheck {
	const sections = schema.sections ?? [];
	const idx = sections.findIndex((s) => s.id === sectionId);
	const to = direction === "up" ? idx - 1 : idx + 1;
	if (idx < 0 || to < 0 || to >= sections.length) return {breaks: false, newlyBroken: []};
	const before = brokenSet(schema.questions);
	const nextSections = [...sections];
	const [m] = nextSections.splice(idx, 1);
	nextSections.splice(to, 0, m);
	const after = brokenSet(orderBySections(schema.questions, nextSections));
	const newlyBroken = [...after].filter((id) => !before.has(id));
	return {breaks: newlyBroken.length > 0, newlyBroken};
}

/** Is THIS rule (on the given question) broken — does it reference a same/later or missing question? */
export function isRuleBroken(schema: FormSchema, questionId: string, rule: RuleGroup | undefined): boolean {
	const ownerIndex = schema.questions.findIndex((q) => q.id === questionId);
	if (ownerIndex < 0) return false;
	const indexOf = new Map(schema.questions.map((q, i) => [q.id, i]));
	return ruleBroken(rule, ownerIndex, indexOf);
}
