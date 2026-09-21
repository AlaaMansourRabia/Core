// The KnowledgeStore is the DB-swap seam. Every capability reads knowledge ONLY through this
// interface — never the filesystem, never a global. Phase 1 ships an in-memory FileSystemStore built
// from the canonical repo files; Phase 2 can implement the same interface over Postgres/pgvector with
// zero change to the capabilities or the wire API. That invariant is the whole point of this layer.

import type {NormalizedRecord, Tier} from "../model/record";
import type {SearchProvider} from "../search/provider";

export type ReverseKind = "composedOf" | "widgetOf" | "references";

export interface StoreMeta {
	indexVersion: string;
	manifestSchema: string;
	builtAt: string;
	counts: Record<string, number>;
	rootDir?: string;
}

export interface KnowledgeStore {
	getById(id: string): NormalizedRecord | null;
	/** Look up by artifact name OR kebab id (callers pass either). */
	getByName(name: string): NormalizedRecord | null;
	listByTier(tier: Tier): NormalizedRecord[];
	all(): NormalizedRecord[];
	/** Reverse lookups over the manifest graph: which artifacts use / compose / reference `name`. */
	reverse(kind: ReverseKind, name: string): NormalizedRecord[];
	searchProvider(): SearchProvider;
	meta(): StoreMeta;
}
