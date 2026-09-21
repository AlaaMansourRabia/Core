// The versioned response envelope — every capability response is wrapped in this exact shape so
// editors get one predictable contract regardless of transport. `apiVersion` is date-based and
// changes only on a breaking change; the independent schema versions (manifest, index) travel in
// `provenance`. Errors are values (`ok:false`), never thrown across the transport boundary.

import type {NormalizedRecord} from "../model/record";
import type {StoreMeta} from "../store/store";

/** Date-based capability version. Additive changes keep it; breaking changes bump it. */
export const API_VERSION = "wakecore-knowledge/2026-07";

export interface Warning {
	code: string;
	message: string;
	target?: string;
}

export interface ProvenanceSource {
	id: string;
	tier: string;
	manifest?: string;
}

export interface Provenance {
	indexVersion: string;
	manifestSchema: string;
	sources: ProvenanceSource[];
}

export interface Meta {
	elapsedMs: number;
	count?: number;
}

export interface OkEnvelope<T> {
	apiVersion: string;
	capability: string;
	requestId: string;
	ok: true;
	data: T;
	warnings: Warning[];
	provenance: Provenance;
	meta: Meta;
}

export interface ErrorEnvelope {
	apiVersion: string;
	capability: string;
	requestId: string;
	ok: false;
	error: {code: string; message: string; retryable: boolean; target?: string};
}

export type Envelope<T> = OkEnvelope<T> | ErrorEnvelope;

/** What a capability returns to the registry: the `data`, plus the records it touched (for provenance)
 *  and any advisory warnings. The registry turns this into an OkEnvelope. */
export interface CapabilityResult<T> {
	data: T;
	warnings?: Warning[];
	sources?: NormalizedRecord[];
}

export const sourceOf = (r: NormalizedRecord): ProvenanceSource => ({id: r.id, tier: r.tier, manifest: r.manifestPath});

export function makeProvenance(meta: StoreMeta, records: NormalizedRecord[] = []): Provenance {
	return {indexVersion: meta.indexVersion, manifestSchema: meta.manifestSchema, sources: records.map(sourceOf)};
}
