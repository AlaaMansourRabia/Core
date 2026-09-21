// Deterministic, dependency-free lexical ranking — Phase 1's SearchProvider. Field-weighted term
// matching with IDF weighting (BM25-lite): rarer query terms and matches in higher-signal fields
// (name > tags > intent > when) score higher. Scores are normalized to 0..1 against the query's
// theoretical maximum so they read as a confidence.
//
// The tokenizer + synonym seed are LIFTED from packages/sdk/src/sdk.mjs (the existing resolveTemplate
// scoring) so the two converge on one behavior; the synonym map is an explicit stand-in for a future
// embedding re-rank, which will arrive as a separate SearchProvider with no API change.

import type {NormalizedRecord, Tier} from "../model/record";
import type {SearchHit, SearchProvider, SearchQuery} from "./provider";

const STOP = new Set([
	"a",
	"an",
	"the",
	"for",
	"of",
	"to",
	"with",
	"and",
	"in",
	"on",
	"your",
	"page",
	"screen",
	"ui",
	"build",
	"make",
	"create",
	"show",
]);

const SYNONYMS: Record<string, string[]> = {
	sign: ["login", "auth"],
	signin: ["login", "auth"],
	login: ["auth"],
	ops: ["operations"],
	operations: ["ops"],
	overview: ["dashboard"],
	dashboard: ["overview"],
	metrics: ["kpi"],
	kpi: ["metrics"],
	admin: ["settings", "management"],
	settings: ["admin"],
	table: ["grid", "datatable"],
	delete: ["destructive", "remove"],
	confirm: ["destructive", "dialog"],
};

const FIELD_WEIGHTS = {name: 3, tags: 2, intent: 1.5, when: 1, category: 1} as const;
type Field = keyof typeof FIELD_WEIGHTS;
const FIELDS = Object.keys(FIELD_WEIGHTS) as Field[];
const MAX_FIELD_WEIGHT = Object.values(FIELD_WEIGHTS).reduce((a, b) => a + b, 0);

export function tokenize(s: string): string[] {
	return String(s ?? "")
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter((t) => t && !STOP.has(t));
}

function expand(tokens: string[]): string[] {
	return [...new Set(tokens.flatMap((t) => [t, ...(SYNONYMS[t] ?? [])]))];
}

const round = (n: number): number => Math.round(n * 1000) / 1000;

interface Indexed {
	record: NormalizedRecord;
	fields: Record<Field, Set<string>>;
	terms: Set<string>;
}

export function createLexicalSearchProvider(): SearchProvider {
	let docs: Indexed[] = [];
	let idf = new Map<string, number>();

	function index(records: NormalizedRecord[]): void {
		docs = records.map((record) => {
			const s = record._search;
			const fields: Record<Field, Set<string>> = {
				name: new Set(tokenize(s.name)),
				tags: new Set(tokenize(s.tags)),
				intent: new Set(tokenize(s.intent)),
				when: new Set(tokenize(s.when)),
				category: new Set(tokenize(s.category)),
			};
			return {record, fields, terms: new Set(tokenize(s.text))};
		});
		const N = Math.max(docs.length, 1);
		const df = new Map<string, number>();
		for (const d of docs) for (const t of d.terms) df.set(t, (df.get(t) ?? 0) + 1);
		idf = new Map();
		for (const [t, f] of df) idf.set(t, Math.log(1 + N / f));
	}

	function search({query, tiers, limit = 10}: SearchQuery): SearchHit[] {
		const qtokens = expand(tokenize(query));
		if (qtokens.length === 0) return [];
		const tierSet = tiers && tiers.length ? new Set<Tier>(tiers) : null;
		// Theoretical max: every token is maximally discriminative and hits every field.
		const maxIdf = Math.max(...idf.values(), 1);
		const maxScore = qtokens.length * maxIdf * MAX_FIELD_WEIGHT;

		const hits: SearchHit[] = [];
		for (const d of docs) {
			if (tierSet && !tierSet.has(d.record.tier)) continue;
			let score = 0;
			const matched = new Set<string>();
			for (const tok of qtokens) {
				const w = idf.get(tok) ?? maxIdf; // unseen query term is treated as maximally rare
				for (const field of FIELDS) {
					if (d.fields[field].has(tok)) {
						score += w * FIELD_WEIGHTS[field];
						matched.add(field);
					}
				}
			}
			if (score > 0) hits.push({record: d.record, score: round(score / maxScore), matchedFields: [...matched]});
		}
		return hits.sort((a, b) => b.score - a.score).slice(0, limit);
	}

	return {index, search};
}
