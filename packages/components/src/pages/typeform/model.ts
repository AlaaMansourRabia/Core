// Typeform-style form builder — data model.
// Authors edit `Question[]`; zod validation is DERIVED from this model (see compile.ts),
// never hand-authored. This is the single source of truth for both the builder and the filler.

export type QuestionType =
	| "short_text"
	| "long_text"
	| "email"
	| "multiple_choice"
	| "rating"
	| "date"
	| "signature"
	| "attachment"
	| "matrix"
	| "gas_test_table"
	| "data_source_select"
	| "derived_count";

/** The input type of a table/matrix cell. */
export type CellType = "yes_no" | "text" | "number" | "rating";

export interface TableRow {
	id: string;
	label: string;
}

export interface TableColumn {
	id: string;
	label: string;
	/** Per-column input type (gas_test_table); matrix uses the question's uniform `cellType`. */
	type?: CellType;
}

export interface Choice {
	id: string;
	label: string;
	value: string;
}

// ── Conditional logic ─────────────────────────────────────────────────────────
// Rules may only reference questions that appear EARLIER in the form (forward-reference guard),
// enforced by the builder (rule editors offer only earlier questions) and defensively by the engine.

export type ConditionOperator = "eq" | "neq" | "answered" | "not_answered" | "includes" | "gt" | "lt";

export interface Condition {
	/** The EARLIER question whose answer this condition tests. */
	questionId: string;
	operator: ConditionOperator;
	/** Compare value (option value / number); unused for answered/not_answered. */
	value?: string | number;
}

/** A group of conditions combined with AND ("all") or OR ("any"). */
export interface RuleGroup {
	match: "all" | "any";
	conditions: Condition[];
}

/** One narrowing of a choice question's answerable options. Multiple active restrictions INTERSECT. */
export interface OptionRestriction {
	id: string;
	/** When present, the restriction is only in force while this rule passes; absent ⇒ always in force. */
	rule?: RuleGroup;
	/** The option values allowed while this restriction is in force. */
	allowedValues: string[];
}

/** An ordered group of questions in the form. */
export interface Section {
	id: string;
	title: string;
	description?: string;
}

export interface Question {
	id: string;
	type: QuestionType;
	/** The question text shown to respondents. */
	label: string;
	/** Optional helper/subtext under the question. */
	description?: string;
	required: boolean;
	/** Placeholder for text/email inputs. */
	placeholder?: string;
	/** multiple_choice only. */
	options?: Choice[];
	/** multiple_choice: allow selecting more than one option (checkboxes vs. radio). */
	allowMultiple?: boolean;
	/** rating: scale bounds (default 1..5). long_text: min/max character length. */
	min?: number;
	max?: number;

	// ── logic + grouping (all optional; absence = the permissive default) ──
	/** Which section this question belongs to (undefined ⇒ the default/first group). */
	sectionId?: string;
	/** Extra guidance shown under the control. */
	helpText?: string;
	/** Pre-filled in the browser when the question first appears; never satisfies "required". */
	defaultValue?: unknown;
	/** Absent ⇒ always visible; present ⇒ visible only when the rule passes. */
	visibilityRule?: RuleGroup;
	/** Absent ⇒ follows the `required` toggle; present ⇒ REPLACES it (required only when it passes). */
	requirednessRule?: RuleGroup;
	/** Absent ⇒ always editable; present ⇒ editable only when the rule passes. */
	editableRule?: RuleGroup;
	/** Choice types: each active restriction narrows the allowed options; multiple intersect. */
	optionRestrictions?: OptionRestriction[];

	// ── config for the richer question types (all optional) ──
	/** matrix rows / gas_test_table gases. */
	tableRows?: TableRow[];
	/** matrix columns / gas_test_table reading columns (with per-column `type`). */
	tableColumns?: TableColumn[];
	/** matrix: the uniform input type used by every cell. */
	cellType?: CellType;
	/** data_source_select: which named data source populates the options. */
	dataSource?: string;
	/** derived_count: the earlier data_source_select question this derives from. */
	dependsOn?: string;
	/** derived_count: optional binding of the answer to a first-class permit column (metadata only). */
	columnBinding?: string;
}

/**
 * How respondents move through the form in the preview/filler:
 * - "one_question": Typeform-style, one question at a time with Next/Back.
 * - "list": every question on a single scrollable page with one Submit at the end.
 */
export type FormDisplayMode = "one_question" | "list";

export interface FormSchema {
	id: string;
	title: string;
	description?: string;
	questions: Question[];
	/** Ordered sections. Optional — a form with no sections renders as one ungrouped list. */
	sections?: Section[];
	/** Preview/filler layout — set at Publish. Defaults to one-question-at-a-time. */
	displayMode: FormDisplayMode;
	/** Forward-compat guard for persisted JSON. */
	version: 1;
}

/** Stable id generator (browser + node both expose crypto.randomUUID). */
export function uid(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	// Fallback for exotic runtimes.
	return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export interface QuestionTypeMeta {
	type: QuestionType;
	label: string;
	hint: string;
	/** lucide-react icon name — resolved to a component at the call site. */
	icon:
		| "Type"
		| "AlignLeft"
		| "Mail"
		| "CircleDot"
		| "Star"
		| "Calendar"
		| "PenLine"
		| "Paperclip"
		| "Grid3x3"
		| "Table"
		| "Database"
		| "Sigma";
}

/** Catalogue used by the "Add content" picker and the inspector type switcher. */
export const QUESTION_TYPES: QuestionTypeMeta[] = [
	{type: "short_text", label: "Short Text", hint: "One-line free answer", icon: "Type"},
	{type: "long_text", label: "Long Text", hint: "Paragraph answer", icon: "AlignLeft"},
	{type: "email", label: "Email", hint: "Validated email address", icon: "Mail"},
	{
		type: "multiple_choice",
		label: "Multiple Choice",
		hint: "Pick from a list of options",
		icon: "CircleDot",
	},
	{type: "rating", label: "Rating", hint: "Star / number scale", icon: "Star"},
	{type: "date", label: "Date", hint: "Calendar picker", icon: "Calendar"},
	{type: "signature", label: "Signature", hint: "Sign with your finger / mouse", icon: "PenLine"},
	{type: "attachment", label: "Attachment", hint: "Upload a file", icon: "Paperclip"},
	{type: "matrix", label: "Matrix", hint: "Rows × columns, one cell type", icon: "Grid3x3"},
	{
		type: "gas_test_table",
		label: "Gas test table",
		hint: "Rows × columns, per-column type",
		icon: "Table",
	},
	{
		type: "data_source_select",
		label: "Data source select",
		hint: "Options from a data source",
		icon: "Database",
	},
	{
		type: "derived_count",
		label: "Derived count",
		hint: "Computed count from another answer",
		icon: "Sigma",
	},
];

export function questionTypeMeta(type: QuestionType): QuestionTypeMeta {
	return QUESTION_TYPES.find((t) => t.type === type) ?? QUESTION_TYPES[0];
}

const DEFAULT_LABELS: Record<QuestionType, string> = {
	short_text: "Short text question",
	long_text: "Long text question",
	email: "What's your email address?",
	multiple_choice: "Pick an option",
	rating: "How would you rate this?",
	date: "Pick a date",
	signature: "Please sign here",
	attachment: "Attach a file",
	matrix: "New matrix question",
	gas_test_table: "Gas test readings",
	data_source_select: "Select a record",
	derived_count: "Derived count",
};

function makeChoice(label: string): Choice {
	return {id: uid(), label, value: label.toLowerCase().replace(/\s+/g, "-")};
}

export function makeTableRow(label: string): TableRow {
	return {id: uid(), label};
}

export function makeTableColumn(label: string, type?: CellType): TableColumn {
	return {id: uid(), label, type};
}

/** Create a fresh question of a given type with sensible defaults. */
export function makeQuestion(type: QuestionType): Question {
	const base: Question = {
		id: uid(),
		type,
		label: DEFAULT_LABELS[type],
		required: false,
	};
	switch (type) {
		case "short_text":
			return {...base, placeholder: "Type your answer here..."};
		case "long_text":
			return {...base, placeholder: "Type your answer here..."};
		case "email":
			return {...base, placeholder: "name@example.com"};
		case "multiple_choice":
			return {
				...base,
				allowMultiple: false,
				options: [makeChoice("Option 1"), makeChoice("Option 2"), makeChoice("Option 3")],
			};
		case "rating":
			return {...base, min: 1, max: 5};
		case "date":
			return {...base};
		case "signature":
			return {...base};
		case "attachment":
			return {...base};
		case "matrix":
			return {
				...base,
				tableRows: [makeTableRow("Row 1")],
				tableColumns: [makeTableColumn("Column 1")],
				cellType: "yes_no",
			};
		case "gas_test_table":
			return {
				...base,
				tableRows: [makeTableRow("O2"), makeTableRow("LEL")],
				tableColumns: [makeTableColumn("Pre-entry", "text")],
			};
		case "data_source_select":
			return {...base, dataSource: "companies"};
		case "derived_count":
			return {...base};
	}
}

/** Append a new option to a multiple_choice question. */
export function makeOption(index: number): Choice {
	return makeChoice(`Option ${index}`);
}

export function makeSection(title = "New section"): Section {
	return {id: uid(), title};
}

/** A blank condition referencing a given earlier question. */
export function makeCondition(questionId: string): Condition {
	return {questionId, operator: "eq", value: ""};
}

export function makeRuleGroup(questionId: string): RuleGroup {
	return {match: "all", conditions: [makeCondition(questionId)]};
}

/** The questions that appear strictly BEFORE `questionId` (valid rule references). */
export function earlierQuestions(schema: FormSchema, questionId: string): Question[] {
	const index = schema.questions.findIndex((q) => q.id === questionId);
	return index <= 0 ? [] : schema.questions.slice(0, index);
}

export function questionById(schema: FormSchema, id: string): Question | undefined {
	return schema.questions.find((q) => q.id === id);
}

export function makeForm(title = "My new form"): FormSchema {
	// Every form starts with one default section; questions live inside it unless moved.
	return {
		id: uid(),
		title,
		questions: [],
		sections: [makeSection("Section")],
		displayMode: "one_question",
		version: 1,
	};
}

/** A realistic, ready-to-preview form used as the default/demo. */
export function sampleForm(): FormSchema {
	const q1 = makeQuestion("short_text");
	q1.label = "Which walking-tour did you join?";
	q1.description = "Each route, tour guide, and time of tour makes an experience unique.";
	q1.required = true;

	const q2 = makeQuestion("rating");
	q2.label = "How would you rate your guide?";
	q2.required = true;

	const q3 = makeQuestion("multiple_choice");
	q3.label = "What did you enjoy most?";
	q3.options = [makeChoice("The route"), makeChoice("The guide"), makeChoice("The pace"), makeChoice("The stories")];

	const q4 = makeQuestion("long_text");
	q4.label = "Anything we could improve?";
	q4.placeholder = "Share your thoughts...";

	const q5 = makeQuestion("email");
	q5.label = "Where can we send your discount?";
	q5.required = true;

	const section = makeSection("Section");
	for (const q of [q1, q2, q3, q4, q5]) q.sectionId = section.id;

	return {
		id: uid(),
		title: "Walking tour feedback",
		description: "Help us make the next tour even better.",
		questions: [q1, q2, q3, q4, q5],
		sections: [section],
		displayMode: "one_question",
		version: 1,
	};
}

/**
 * A second seeded form that exercises the six richer question types (signature, attachment, matrix,
 * gas test table, data source select, derived count) in a coherent permit-inspection context. Seeded
 * into the form-builder widgets so the new types are demonstrable inside the builder + preview.
 */
export function permitInspectionForm(): FormSchema {
	const confined = makeQuestion("multiple_choice");
	confined.label = "Is this a confined space?";
	confined.required = true;
	confined.placeholder = "Select yes or no";
	confined.options = [makeChoice("Yes"), makeChoice("No")];

	const dept = makeQuestion("data_source_select");
	dept.label = "Department";
	dept.dataSource = "departments";
	dept.required = true;

	const headcount = makeQuestion("derived_count");
	headcount.label = "Workers in the selected department";
	headcount.dependsOn = dept.id;

	const barriers = makeQuestion("matrix");
	barriers.label = "Barrier checklist";
	barriers.tableRows = [makeTableRow("Barriers"), makeTableRow("Signage")];
	barriers.tableColumns = [makeTableColumn("Before"), makeTableColumn("After")];
	barriers.cellType = "yes_no";

	const gas = makeQuestion("gas_test_table");
	gas.label = "Gas readings";
	gas.tableRows = [makeTableRow("O₂"), makeTableRow("LEL")];
	gas.tableColumns = [makeTableColumn("Pre-entry", "number"), makeTableColumn("Notes", "text")];
	// Conditional logic: gas testing only applies to confined spaces. Hidden until "Yes" is chosen.
	gas.visibilityRule = {
		match: "all",
		conditions: [{questionId: confined.id, operator: "eq", value: "yes"}],
	};

	const method = makeQuestion("attachment");
	method.label = "Attach the method statement";

	const signature = makeQuestion("signature");
	signature.label = "Inspector signature";
	signature.required = true;

	const section = makeSection("Site inspection");
	const questions = [confined, dept, headcount, barriers, gas, method, signature];
	for (const q of questions) q.sectionId = section.id;

	return {
		id: uid(),
		title: "Permit inspection",
		description: "Pre-work checks an inspector completes before a permit is issued.",
		questions,
		sections: [section],
		displayMode: "list",
		version: 1,
	};
}
