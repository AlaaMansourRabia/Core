// Phase-1 Stores. `createFileSystemStore` builds the index from the canonical repo files (via
// buildIndex); `createMemoryStore` wraps an already-assembled index (e.g. a prebuilt JSON bundle in a
// serverless function) — no filesystem access at all. Both return the SAME KnowledgeStore, so the
// capabilities that consume it are already DB-ready — a DbStore just implements the same interface.

import type {NormalizedRecord, Tier} from "../model/record";
import {assembleIndex, buildIndex, type KnowledgeIndex} from "../pipeline/build-index";
import {createLexicalSearchProvider} from "../search/lexical-provider";
import type {SearchProvider} from "../search/provider";
import type {KnowledgeStore, ReverseKind, StoreMeta} from "./store";

/** Wrap an assembled index in a KnowledgeStore (+ a freshly-indexed search provider). */
export function storeFromIndex(index: KnowledgeIndex): KnowledgeStore {
	const search = createLexicalSearchProvider();
	search.index(index.records);

	const resolveNames = (names: string[]): NormalizedRecord[] =>
		names.map((n) => index.byName.get(n)).filter((r): r is NormalizedRecord => r != null);

	return {
		getById: (id) => index.byId.get(id) ?? null,
		getByName: (name) => index.byName.get(name) ?? index.byId.get(name) ?? null,
		listByTier: (tier: Tier) => index.byTier.get(tier) ?? [],
		all: () => index.records,
		reverse: (kind: ReverseKind, name: string) => {
			const map =
				kind === "composedOf"
					? index.reverse.composedByArtifact
					: kind === "widgetOf"
						? index.reverse.widgetUsedByTemplate
						: index.reverse.referencedByArtifact;
			return resolveNames(map.get(name) ?? []);
		},
		searchProvider: (): SearchProvider => search,
		meta: (): StoreMeta => index.meta,
	};
}

/** Build the store from the canonical repo files. */
export function createFileSystemStore(opts: {rootDir?: string; builtAt?: string} = {}): KnowledgeStore {
	return storeFromIndex(buildIndex(opts));
}

/** Build the store from a prebuilt records array (no filesystem) — for serverless / bundle deploys. */
export function createMemoryStore(
	records: NormalizedRecord[],
	meta?: {builtAt?: string; indexVersion?: string},
): KnowledgeStore {
	return storeFromIndex(assembleIndex(records, {builtAt: meta?.builtAt}));
}
