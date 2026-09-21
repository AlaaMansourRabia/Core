// resolve_component — rank components by intent (or fetch one by name) and return everything an editor
// needs to USE it: the correct import, variants/sizes, minimalExample, selection guidance. Props are
// returned when structured (from component-api.json) and honestly reported as unavailable otherwise
// (the props gap) — never fabricated. Advisory.

import type {ArtifactOwnership, ChooseOver, CommonMistake, NormalizedRecord, PropDef, SourceRef} from "../model/record";
import type {CapabilityResult, Warning} from "../schemas/envelope";
import type {ResolveComponentInput} from "../schemas/inputs";
import {CapabilityError, confidenceBand, type CapabilityFn} from "./context";

export interface ComponentCandidate {
	ref: {id: string; tier: string};
	name: string;
	category?: string;
	intent?: string;
	score?: number;
	confidence?: "high" | "medium" | "low";
	when: string[];
	chooseOver: ChooseOver[];
	pairsWith: string[];
	requiredProviders: string[];
	subcomponents?: string[];
	source: SourceRef;
	variants?: string[];
	sizes?: string[];
	minimalExample?: string;
	commonMistakes: CommonMistake[];
	props: PropDef[] | null;
	propsStatus: "available" | "unavailable";
	ownership?: ArtifactOwnership;
	propCompatibility: {status: "compatible" | "incompatible" | "unknown"; matched: string[]; missing: string[]};
}

export interface ResolveComponentData {
	query: {intent?: string; name?: string; requiredProps: string[]};
	candidates: ComponentCandidate[];
}

const toCandidate = (r: NormalizedRecord, score?: number, requiredProps: string[] = []): ComponentCandidate => {
	const available = new Set((r.props ?? []).map((prop) => prop.name));
	const matched = requiredProps.filter((prop) => available.has(prop));
	const missing = requiredProps.filter((prop) => !available.has(prop));
	return {
		ref: {id: r.id, tier: r.tier},
		name: r.name,
		category: r.category,
		intent: r.intent,
		score,
		confidence: score != null ? confidenceBand(score) : undefined,
		when: r.when,
		chooseOver: r.chooseOver,
		pairsWith: r.pairsWith,
		requiredProviders: r.requiredProviders,
		subcomponents: r.subcomponents,
		source: r.source,
		variants: r.variants,
		sizes: r.sizes,
		minimalExample: r.minimalExample,
		commonMistakes: r.commonMistakes,
		props: r.props ?? null,
		propsStatus: r.propsStatus ?? "unavailable",
		ownership: r.ownership,
		propCompatibility: {
			status: r.propsStatus !== "available" ? "unknown" : missing.length ? "incompatible" : "compatible",
			matched,
			missing: r.propsStatus === "available" ? missing : [],
		},
	};
};

export const resolveComponent: CapabilityFn<ResolveComponentInput, ResolveComponentData> = (
	input,
	ctx,
): CapabilityResult<ResolveComponentData> => {
	if (!input.intent && !input.name)
		throw new CapabilityError("bad_request", "Provide `intent` (to rank) or `name` (to fetch).");

	const candidates: ComponentCandidate[] = [];
	const touched = [];

	if (input.name) {
		const r = ctx.store.getByName(input.name);
		if (!r || r.tier !== "component")
			throw new CapabilityError("component.not_found", `No component "${input.name}" in the index.`, {
				target: input.name,
			});
		candidates.push(toCandidate(r, undefined, input.requiredProps));
		touched.push(r);
	} else if (input.intent) {
		const hits = ctx.store
			.searchProvider()
			.search({query: input.intent, tiers: ["component"], limit: Math.min(25, Math.max(input.limit ?? 5, 15))});
		for (const h of hits) {
			candidates.push(toCandidate(h.record, h.score, input.requiredProps));
			touched.push(h.record);
		}
		candidates.sort((a, b) => {
			const rank = {compatible: 0, unknown: 1, incompatible: 2};
			return rank[a.propCompatibility.status] - rank[b.propCompatibility.status] || (b.score ?? 0) - (a.score ?? 0);
		});
		candidates.splice(input.limit ?? 5);
	}

	const warnings: Warning[] = [];
	const missingProps = candidates.filter((c) => c.propsStatus === "unavailable").map((c) => c.name);
	if (missingProps.length)
		warnings.push({
			code: "props.unavailable",
			message: `Structured props are not yet indexed for: ${missingProps.join(", ")}. Use minimalExample + variants/sizes; a props-extraction indexing step is planned.`,
		});

	return {
		data: {query: {intent: input.intent, name: input.name, requiredProps: input.requiredProps}, candidates},
		warnings,
		sources: touched,
	};
};
