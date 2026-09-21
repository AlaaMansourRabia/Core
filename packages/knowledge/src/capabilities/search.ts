// search — semantic-ish retrieval across the WHOLE design system (all tiers). Advisory. Routes through
// the same SearchProvider as resolve_template/resolve_component so there is one ranking behavior; a
// future embedding provider upgrades all three at once.

import type {CapabilityResult} from "../schemas/envelope";
import type {SearchInput} from "../schemas/inputs";
import type {CapabilityFn} from "./context";

export interface SearchResult {
	ref: {id: string; tier: string};
	name: string;
	tier: string;
	intent?: string;
	score: number;
	matchedFields: string[];
	snippet: string;
	import?: string;
}

export interface SearchData {
	query: string;
	results: SearchResult[];
}

const snippetOf = (text: string, max = 160): string =>
	text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export const search: CapabilityFn<SearchInput, SearchData> = (input, ctx): CapabilityResult<SearchData> => {
	const hits = ctx.store.searchProvider().search({query: input.query, tiers: input.tiers, limit: input.limit ?? 10});
	const results: SearchResult[] = hits.map((h) => ({
		ref: {id: h.record.id, tier: h.record.tier},
		name: h.record.name,
		tier: h.record.tier,
		intent: h.record.intent,
		score: h.score,
		matchedFields: h.matchedFields,
		snippet: snippetOf(h.record.intent ?? h.record._search.text),
		import: h.record.source.import,
	}));
	return {data: {query: input.query, results}, sources: hits.map((h) => h.record)};
};
