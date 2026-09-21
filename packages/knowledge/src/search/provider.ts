// The retrieval seam. `resolve_template`, `resolve_component`, and `search` all rank through a
// SearchProvider so there is ONE ranking implementation and the strategy is swappable. Phase 1 ships
// a deterministic LexicalSearchProvider; a future EmbeddingSearchProvider implements the SAME
// interface and drops in behind config — with NO change to the capability API.

import type {NormalizedRecord, Tier} from "../model/record";

export interface SearchHit {
	record: NormalizedRecord;
	score: number;
	/** Which fields contributed to the match (name/tags/intent/when/…) — for rationale + snippets. */
	matchedFields: string[];
}

export interface SearchQuery {
	query: string;
	tiers?: Tier[];
	limit?: number;
}

export interface SearchProvider {
	/** Precompute whatever the strategy needs (postings/IDF, or embeddings) over the corpus. */
	index(records: NormalizedRecord[]): void;
	/** Rank the corpus against a query. Deterministic for a given index + query in Phase 1. */
	search(query: SearchQuery): SearchHit[];
}
