// Typeform-style form builder — the authoring state hook.
// A pure reducer owns every mutation to `FormSchema`; the exposed `FormBuilder` wraps each
// action in a stable `useCallback` so the BuilderScreen can pass them straight to handlers.
import {useCallback, useMemo, useReducer} from "react";

import {orderBySections} from "./logic";
import {makeOption, makeQuestion, makeSection, uid} from "./model";
import type {Choice, FormSchema, Question, QuestionType, Section} from "./model";

export interface FormBuilder {
	schema: FormSchema;
	selectedId: string | null;
	selected: Question | null;
	/** The section new content is added to (when the form has sections). */
	activeSectionId: string | null;
	addQuestion(type: QuestionType): void;
	updateQuestion(id: string, patch: Partial<Question>): void;
	removeQuestion(id: string): void;
	duplicate(id: string): void;
	reorder(from: number, to: number): void;
	/** Move a question into a section, inserted before `beforeId` (or appended when null). */
	moveQuestion(id: string, toSectionId: string | undefined, beforeId: string | null): void;
	select(id: string | null): void;
	/** Make a section the target for new content (clears the selected question). */
	selectSection(id: string): void;
	setMeta(patch: Partial<Pick<FormSchema, "title" | "description" | "displayMode">>): void;
	setSchema(schema: FormSchema): void;
	addSection(title?: string): void;
	updateSection(id: string, patch: Partial<Pick<Section, "title" | "description">>): void;
	removeSection(id: string): void;
	/** Reorder a section up or down among the other sections (keeps question order consistent). */
	moveSection(id: string, direction: "up" | "down"): void;
	/** Move the section at index `from` to index `to` (drag reorder). */
	reorderSection(from: number, to: number): void;
	addOption(qId: string): void;
	updateOption(qId: string, optId: string, patch: Partial<Choice>): void;
	removeOption(qId: string, optId: string): void;
}

interface State {
	schema: FormSchema;
	selectedId: string | null;
	/** Which section new content lands in. Overridden by the selected question's section. */
	activeSectionId: string | null;
}

/** The section to default to as the add target: the first question's section, else the first section. */
function defaultActiveSection(schema: FormSchema): string | null {
	const sections = schema.sections ?? [];
	return schema.questions[0]?.sectionId ?? sections[0]?.id ?? null;
}

type Action =
	| {kind: "add"; type: QuestionType}
	| {kind: "update"; id: string; patch: Partial<Question>}
	| {kind: "remove"; id: string}
	| {kind: "duplicate"; id: string}
	| {kind: "reorder"; from: number; to: number}
	| {kind: "moveQuestion"; id: string; toSectionId: string | undefined; beforeId: string | null}
	| {kind: "select"; id: string | null}
	| {kind: "selectSection"; id: string}
	| {kind: "setMeta"; patch: Partial<Pick<FormSchema, "title" | "description" | "displayMode">>}
	| {kind: "setSchema"; schema: FormSchema}
	| {kind: "addSection"; title?: string}
	| {kind: "updateSection"; id: string; patch: Partial<Pick<Section, "title" | "description">>}
	| {kind: "removeSection"; id: string}
	| {kind: "moveSection"; id: string; direction: "up" | "down"}
	| {kind: "reorderSection"; from: number; to: number}
	| {kind: "addOption"; qId: string}
	| {kind: "updateOption"; qId: string; optId: string; patch: Partial<Choice>}
	| {kind: "removeOption"; qId: string; optId: string};

/** Deep-copy a question, minting fresh ids for it and every option. */
function cloneQuestion(q: Question): Question {
	return {
		...q,
		id: uid(),
		options: q.options?.map((o) => ({...o, id: uid()})),
	};
}

/** Map a question by id through `fn`, returning a new array (pure). */
function mapQuestion(questions: Question[], id: string, fn: (q: Question) => Question): Question[] {
	return questions.map((q) => (q.id === id ? fn(q) : q));
}

// Section-order sorting lives in ./logic (orderBySections) so the reorder-guard and the reducer agree.

function reducer(state: State, action: Action): State {
	const {schema} = state;
	const questions = schema.questions;

	switch (action.kind) {
		case "add": {
			const q = makeQuestion(action.type);
			const sections = schema.sections ?? [];
			const selIndex = questions.findIndex((x) => x.id === state.selectedId);
			const selQ = selIndex >= 0 ? questions[selIndex] : undefined;
			// New questions join the selected question's section; with no selection they join the
			// explicitly-chosen active section, else fall back to the last section.
			const activeTarget =
				state.activeSectionId && sections.some((s) => s.id === state.activeSectionId)
					? state.activeSectionId
					: undefined;
			q.sectionId = selQ?.sectionId ?? activeTarget ?? sections[sections.length - 1]?.id;
			// Insert after the selected question; otherwise at the end (orderBySections then regroups
			// it into the tail of its section).
			const insertAt = selIndex >= 0 ? selIndex + 1 : questions.length;
			const next = [...questions.slice(0, insertAt), q, ...questions.slice(insertAt)];
			return {
				...state,
				schema: {...schema, questions: orderBySections(next, sections)},
				selectedId: q.id,
				activeSectionId: q.sectionId ?? state.activeSectionId,
			};
		}

		case "update": {
			const nextQuestions = mapQuestion(questions, action.id, (q) => ({...q, ...action.patch}));
			// If the question moved to another section, re-group so array order matches section order.
			const resorted =
				"sectionId" in action.patch ? orderBySections(nextQuestions, schema.sections ?? []) : nextQuestions;
			return {...state, schema: {...schema, questions: resorted}};
		}

		case "remove": {
			const index = questions.findIndex((q) => q.id === action.id);
			if (index === -1) return state;
			const next = questions.filter((q) => q.id !== action.id);
			let selectedId = state.selectedId;
			if (selectedId === action.id) {
				// Reselect a neighbour: prefer the previous row, else the new first, else nothing.
				const neighbour = next[index] ?? next[index - 1] ?? null;
				selectedId = neighbour ? neighbour.id : null;
			}
			return {...state, schema: {...schema, questions: next}, selectedId};
		}

		case "duplicate": {
			const index = questions.findIndex((q) => q.id === action.id);
			if (index === -1) return state;
			const copy = cloneQuestion(questions[index]);
			const next = [...questions.slice(0, index + 1), copy, ...questions.slice(index + 1)];
			return {...state, schema: {...schema, questions: next}, selectedId: copy.id};
		}

		case "reorder": {
			const {from, to} = action;
			if (from === to || from < 0 || to < 0 || from >= questions.length || to >= questions.length) {
				return state;
			}
			const next = [...questions];
			const [moved] = next.splice(from, 1);
			next.splice(to, 0, moved);
			return {...state, schema: {...schema, questions: next}};
		}

		case "moveQuestion": {
			const {id, toSectionId, beforeId} = action;
			const moving = questions.find((q) => q.id === id);
			if (!moving) return state;
			const without = questions.filter((q) => q.id !== id);
			const updated: Question = {...moving, sectionId: toSectionId};
			const idx = beforeId ? without.findIndex((q) => q.id === beforeId) : -1;
			const inserted = idx >= 0 ? [...without.slice(0, idx), updated, ...without.slice(idx)] : [...without, updated];
			return {
				...state,
				schema: {...schema, questions: orderBySections(inserted, schema.sections ?? [])},
				selectedId: id,
				activeSectionId: toSectionId ?? state.activeSectionId,
			};
		}

		case "select": {
			// Keep the add-target in sync: selecting a question makes its section active.
			const q = questions.find((x) => x.id === action.id);
			return {
				...state,
				selectedId: action.id,
				activeSectionId: q?.sectionId ?? state.activeSectionId,
			};
		}

		case "selectSection":
			// Selecting a section clears the question selection so new content appends to that section.
			return {...state, selectedId: null, activeSectionId: action.id};

		case "setMeta":
			return {...state, schema: {...schema, ...action.patch}};

		case "setSchema":
			return {
				schema: action.schema,
				selectedId: action.schema.questions[0]?.id ?? null,
				activeSectionId: defaultActiveSection(action.schema),
			};

		case "addSection": {
			const s = makeSection(action.title);
			// The new section becomes the add target so the next question lands in it.
			return {
				...state,
				schema: {...schema, sections: [...(schema.sections ?? []), s]},
				selectedId: null,
				activeSectionId: s.id,
			};
		}

		case "updateSection": {
			return {
				...state,
				schema: {
					...schema,
					sections: (schema.sections ?? []).map((s) => (s.id === action.id ? {...s, ...action.patch} : s)),
				},
			};
		}

		case "removeSection": {
			return {
				...state,
				schema: {
					...schema,
					sections: (schema.sections ?? []).filter((s) => s.id !== action.id),
					// Orphaned questions fall back to the ungrouped default.
					questions: questions.map((q) => (q.sectionId === action.id ? {...q, sectionId: undefined} : q)),
				},
				// Drop the add-target if it was the removed section.
				activeSectionId: state.activeSectionId === action.id ? null : state.activeSectionId,
			};
		}

		case "moveSection": {
			const sections = schema.sections ?? [];
			const idx = sections.findIndex((s) => s.id === action.id);
			if (idx < 0) return state;
			const to = action.direction === "up" ? idx - 1 : idx + 1;
			if (to < 0 || to >= sections.length) return state;
			const nextSections = [...sections];
			const [moved] = nextSections.splice(idx, 1);
			nextSections.splice(to, 0, moved);
			return {
				...state,
				schema: {
					...schema,
					sections: nextSections,
					questions: orderBySections(questions, nextSections),
				},
			};
		}

		case "reorderSection": {
			const sections = schema.sections ?? [];
			const {from, to} = action;
			if (from === to || from < 0 || to < 0 || from >= sections.length || to >= sections.length) {
				return state;
			}
			const nextSections = [...sections];
			const [moved] = nextSections.splice(from, 1);
			nextSections.splice(to, 0, moved);
			return {
				...state,
				schema: {
					...schema,
					sections: nextSections,
					questions: orderBySections(questions, nextSections),
				},
			};
		}

		case "addOption": {
			return {
				...state,
				schema: {
					...schema,
					questions: mapQuestion(questions, action.qId, (q) => {
						const options = q.options ?? [];
						return {...q, options: [...options, makeOption(options.length + 1)]};
					}),
				},
			};
		}

		case "updateOption": {
			return {
				...state,
				schema: {
					...schema,
					questions: mapQuestion(questions, action.qId, (q) => ({
						...q,
						options: (q.options ?? []).map((o) => (o.id === action.optId ? {...o, ...action.patch} : o)),
					})),
				},
			};
		}

		case "removeOption": {
			return {
				...state,
				schema: {
					...schema,
					questions: mapQuestion(questions, action.qId, (q) => ({
						...q,
						options: (q.options ?? []).filter((o) => o.id !== action.optId),
					})),
				},
			};
		}
	}
}

export function useFormBuilder(initial: FormSchema): FormBuilder {
	const [state, dispatch] = useReducer(reducer, initial, (schema) => ({
		schema,
		selectedId: schema.questions[0]?.id ?? null,
		activeSectionId: defaultActiveSection(schema),
	}));

	const addQuestion = useCallback((type: QuestionType) => dispatch({kind: "add", type}), []);
	const updateQuestion = useCallback(
		(id: string, patch: Partial<Question>) => dispatch({kind: "update", id, patch}),
		[],
	);
	const removeQuestion = useCallback((id: string) => dispatch({kind: "remove", id}), []);
	const duplicate = useCallback((id: string) => dispatch({kind: "duplicate", id}), []);
	const reorder = useCallback((from: number, to: number) => dispatch({kind: "reorder", from, to}), []);
	const moveQuestion = useCallback(
		(id: string, toSectionId: string | undefined, beforeId: string | null) =>
			dispatch({kind: "moveQuestion", id, toSectionId, beforeId}),
		[],
	);
	const select = useCallback((id: string | null) => dispatch({kind: "select", id}), []);
	const selectSection = useCallback((id: string) => dispatch({kind: "selectSection", id}), []);
	const setMeta = useCallback(
		(patch: Partial<Pick<FormSchema, "title" | "description" | "displayMode">>) => dispatch({kind: "setMeta", patch}),
		[],
	);
	const setSchema = useCallback((schema: FormSchema) => dispatch({kind: "setSchema", schema}), []);
	const addSection = useCallback((title?: string) => dispatch({kind: "addSection", title}), []);
	const updateSection = useCallback(
		(id: string, patch: Partial<Pick<Section, "title" | "description">>) =>
			dispatch({kind: "updateSection", id, patch}),
		[],
	);
	const removeSection = useCallback((id: string) => dispatch({kind: "removeSection", id}), []);
	const moveSection = useCallback(
		(id: string, direction: "up" | "down") => dispatch({kind: "moveSection", id, direction}),
		[],
	);
	const reorderSection = useCallback((from: number, to: number) => dispatch({kind: "reorderSection", from, to}), []);
	const addOption = useCallback((qId: string) => dispatch({kind: "addOption", qId}), []);
	const updateOption = useCallback(
		(qId: string, optId: string, patch: Partial<Choice>) => dispatch({kind: "updateOption", qId, optId, patch}),
		[],
	);
	const removeOption = useCallback((qId: string, optId: string) => dispatch({kind: "removeOption", qId, optId}), []);

	const selected = useMemo(
		() => state.schema.questions.find((q) => q.id === state.selectedId) ?? null,
		[state.schema.questions, state.selectedId],
	);

	return {
		schema: state.schema,
		selectedId: state.selectedId,
		selected,
		activeSectionId: state.activeSectionId,
		addQuestion,
		updateQuestion,
		removeQuestion,
		duplicate,
		reorder,
		moveQuestion,
		select,
		selectSection,
		setMeta,
		setSchema,
		addSection,
		updateSection,
		removeSection,
		moveSection,
		reorderSection,
		addOption,
		updateOption,
		removeOption,
	};
}
