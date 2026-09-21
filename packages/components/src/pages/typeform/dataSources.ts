// Mock "data sources" that back the data_source_select question type, and the derive helper the
// derived_count type uses. Each record carries a `count` (e.g. workers under it) so a derived count
// has something real to compute. Prototype data — no backend.
import type {FormSchema, Question} from "./model";

export interface DataRecord {
	id: string;
	label: string;
	/** A representative count (e.g. workers under this record) — the basis for derived_count. */
	count: number;
}

export interface DataSource {
	key: string;
	label: string;
	/** What `count` means for this source, used in derived_count guidance. */
	countNoun: string;
	records: DataRecord[];
}

export const DATA_SOURCES: DataSource[] = [
	{
		key: "companies",
		label: "Companies",
		countNoun: "workers",
		records: [
			{id: "co-acme", label: "Acme Construction", count: 128},
			{id: "co-orbit", label: "Orbit Mechanical", count: 74},
			{id: "co-vertex", label: "Vertex Electrical", count: 52},
			{id: "co-delta", label: "Delta Scaffolding", count: 31},
		],
	},
	{
		key: "work_areas",
		label: "Work areas",
		countNoun: "active permits",
		records: [
			{id: "wa-north", label: "North Tower — L12", count: 6},
			{id: "wa-base", label: "Basement Plant Room", count: 3},
			{id: "wa-roof", label: "Roof Deck", count: 2},
			{id: "wa-yard", label: "Laydown Yard", count: 4},
		],
	},
	{
		key: "workshifts",
		label: "Workshifts",
		countNoun: "workers",
		records: [
			{id: "ws-day", label: "Day shift (06:00–14:00)", count: 210},
			{id: "ws-swing", label: "Swing shift (14:00–22:00)", count: 96},
			{id: "ws-night", label: "Night shift (22:00–06:00)", count: 41},
		],
	},
	{
		key: "workers",
		label: "Workers",
		countNoun: "certifications",
		records: [
			{id: "wk-ali", label: "Ali Hassan", count: 5},
			{id: "wk-mei", label: "Mei Chen", count: 7},
			{id: "wk-omar", label: "Omar Farouk", count: 3},
			{id: "wk-lena", label: "Lena Petrova", count: 6},
		],
	},
	{
		key: "crew_leads",
		label: "Crew leads",
		countNoun: "crew members",
		records: [
			{id: "cl-james", label: "James Okoro", count: 12},
			{id: "cl-sara", label: "Sara Kim", count: 9},
			{id: "cl-diego", label: "Diego Alvarez", count: 15},
		],
	},
	{
		key: "departments",
		label: "Departments",
		countNoun: "workers",
		records: [
			{id: "dp-civil", label: "Civil", count: 88},
			{id: "dp-mech", label: "Mechanical", count: 64},
			{id: "dp-elec", label: "Electrical", count: 47},
			{id: "dp-safety", label: "HSE / Safety", count: 19},
		],
	},
];

export function dataSourceByKey(key: string | undefined): DataSource | undefined {
	return key ? DATA_SOURCES.find((s) => s.key === key) : undefined;
}

export const DATA_SOURCE_OPTIONS = DATA_SOURCES.map((s) => ({value: s.key, label: s.label}));

/** The permit columns a derived_count can bind to (metadata only, prototype). */
export const PERMIT_COLUMN_OPTIONS = [
	{value: "", label: "No binding"},
	{value: "worker_count", label: "Worker count"},
	{value: "crew_size", label: "Crew size"},
	{value: "area_permits", label: "Active permits in area"},
];

/**
 * Compute a derived_count's value: the `count` on the record selected in its `dependsOn`
 * data_source_select question. Returns undefined if not set up or nothing selected.
 */
export function deriveValue(
	schema: FormSchema,
	question: Question,
	values: Record<string, unknown>,
): number | undefined {
	if (question.type !== "derived_count" || !question.dependsOn) return undefined;
	const dep = schema.questions.find((q) => q.id === question.dependsOn);
	if (!dep || dep.type !== "data_source_select") return undefined;
	const source = dataSourceByKey(dep.dataSource);
	const selectedId = values[dep.id];
	const record = source?.records.find((r) => r.id === selectedId);
	return record?.count;
}

/** Return `values` with every derived_count question's value recomputed. */
export function deriveAllValues(schema: FormSchema, values: Record<string, unknown>): Record<string, unknown> {
	let next = values;
	for (const q of schema.questions) {
		if (q.type !== "derived_count") continue;
		const v = deriveValue(schema, q, values);
		if (v !== next[q.id]) {
			if (next === values) next = {...values};
			next[q.id] = v;
		}
	}
	return next;
}
