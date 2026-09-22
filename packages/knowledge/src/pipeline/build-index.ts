// The indexing pipeline. Reads the canonical Core sources and projects them into the unified
// NormalizedRecord[] + derived lookup structures. This is the ONE place that knows the on-disk layout;
// swapping it (or the Store that wraps it) for a database changes nothing above.
//
// Sources (all canonical, never duplicated):
//   manifests/*.json                  — the frozen source of truth (artifact-manifest/0.2)
//   library-index.json                — generated projection: variants/sizes/import per component
//   eval/contracts/component-api.json — generated structured props (6-family pilot today)

import {readdirSync} from "node:fs";
import {join} from "node:path";

import {
	normalize,
	type NormalizedRecord,
	type PropDef,
	type RawManifest,
	type StructuralEnrichment,
	type Tier,
} from "../model/record";
import {findRepoRoot, readJson, readJsonSafe} from "./paths";
import {buildReverseIndex, type ReverseIndex} from "./reverse-index";

export const INDEX_VERSION = "knowledge-index/0.1";
export const MANIFEST_SCHEMA = "artifact-manifest/0.2";

const TIER_BY_SUFFIX: Record<string, Tier> = {
	template: "template",
	widget: "widget",
	component: "component",
	pattern: "pattern",
	utility: "utility",
};

/** filename `foo.template.json` -> "template" */
function tierOf(file: string): Tier | null {
	const m = file.match(/\.([a-z]+)\.json$/);
	return m ? (TIER_BY_SUFFIX[m[1]] ?? null) : null;
}

interface LibraryIndex {
	components?: Record<
		string,
		Array<{name: string; variants?: string[]; sizes?: string[]; import?: string; path?: string}>
	>;
	patterns?: Array<Record<string, unknown>>;
}

interface ComponentApi {
	components?: Record<
		string,
		{import?: string; props?: Record<string, {type: string; values?: string[]; required?: boolean}>}
	>;
}

export interface KnowledgeIndex {
	records: NormalizedRecord[];
	byId: Map<string, NormalizedRecord>;
	byName: Map<string, NormalizedRecord>;
	byTier: Map<Tier, NormalizedRecord[]>;
	reverse: ReverseIndex;
	meta: {
		indexVersion: string;
		manifestSchema: string;
		builtAt: string;
		counts: Record<string, number>;
		/** Present for filesystem-backed indexes; absent for bundle/memory indexes. */
		rootDir?: string;
	};
}

/** Structural enrichment (variants/sizes/import) keyed by component name, from library-index.json. */
function structuralByName(lib: LibraryIndex): Map<string, StructuralEnrichment> {
	const out = new Map<string, StructuralEnrichment>();
	for (const group of Object.values(lib.components ?? {}))
		for (const c of group) out.set(c.name, {variants: c.variants, sizes: c.sizes, import: c.import, path: c.path});
	return out;
}

/** Structured props keyed by component name, from component-api.json (present for a subset today). */
function propsByName(api: ComponentApi): Map<string, PropDef[]> {
	const out = new Map<string, PropDef[]>();
	for (const [name, entry] of Object.entries(api.components ?? {})) {
		const props: PropDef[] = Object.entries(entry.props ?? {}).map(([propName, spec]) => ({
			name: propName,
			type: spec.type,
			required: !!spec.required,
			values: spec.values,
		}));
		out.set(name, props);
	}
	return out;
}

/** Build the in-memory knowledge index from the canonical sources under `rootDir`. */
export function buildIndex(opts: {rootDir?: string; builtAt?: string} = {}): KnowledgeIndex {
	const rootDir = opts.rootDir ?? findRepoRoot();
	const manifestsDir = join(rootDir, "manifests");
	const lib = readJsonSafe<LibraryIndex>(join(rootDir, "library-index.json"), {});
	const api = readJsonSafe<ComponentApi>(join(rootDir, "eval", "contracts", "component-api.json"), {});
	const struct = structuralByName(lib);
	const props = propsByName(api);

	const records: NormalizedRecord[] = [];
	for (const file of readdirSync(manifestsDir)) {
		if (!file.endsWith(".json")) continue;
		const tier = tierOf(file);
		if (!tier) continue;
		const raw = readJson<RawManifest>(join(manifestsDir, file));
		records.push(
			normalize(raw, tier, {
				enrich: tier === "component" ? struct.get(raw.name ?? "") : undefined,
				props: tier === "component" ? (props.get(raw.name ?? "") ?? null) : undefined,
				manifestPath: `manifests/${file}`,
			}),
		);
	}

	return assembleIndex(records, {builtAt: opts.builtAt, rootDir});
}

/** Assemble the lookup structures from a records array — the fs-free half of the pipeline. Both the
 *  filesystem build (above) and a bundle-backed memory store (createMemoryStore) go through here, so a
 *  prebuilt index behaves identically to a freshly-read one. */
export function assembleIndex(
	records: NormalizedRecord[],
	opts: {builtAt?: string; rootDir?: string} = {},
): KnowledgeIndex {
	const byId = new Map<string, NormalizedRecord>();
	const byName = new Map<string, NormalizedRecord>();
	const byTier = new Map<Tier, NormalizedRecord[]>();
	for (const r of records) {
		byId.set(r.id, r);
		byName.set(r.name, r);
		const list = byTier.get(r.tier);
		if (list) list.push(r);
		else byTier.set(r.tier, [r]);
	}

	const counts: Record<string, number> = {};
	for (const [tier, list] of byTier) counts[tier] = list.length;

	return {
		records,
		byId,
		byName,
		byTier,
		reverse: buildReverseIndex(records),
		meta: {
			indexVersion: INDEX_VERSION,
			manifestSchema: MANIFEST_SCHEMA,
			builtAt: opts.builtAt ?? new Date().toISOString(),
			counts,
			rootDir: opts.rootDir,
		},
	};
}
