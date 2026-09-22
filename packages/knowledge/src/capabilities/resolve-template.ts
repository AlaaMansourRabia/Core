// resolve_template — the FUZZY intent-match half of retrieval (task -> entry artifact). Advisory:
// ranks templates and explains the match; it never mints authoritative truth. Each candidate also
// reports which structural resolve path to take next (regions vs composedOf vs thin) so the editor
// walks the graph deterministically from here.

import {inferImplementationGoal, type ImplementationGoal} from "../compliance/implementation-goal";
import type {ChooseOver} from "../model/record";
import type {CapabilityResult} from "../schemas/envelope";
import type {ResolveTemplateInput} from "../schemas/inputs";
import {confidenceBand, type CapabilityFn} from "./context";

export interface TemplateCandidate {
	ref: {id: string; tier: "template"; version: string};
	name: string;
	archetype?: string;
	intent?: string;
	score: number;
	confidence: "high" | "medium" | "low";
	rationale: string;
	when: string[];
	whenNot: string[];
	chooseOver: ChooseOver[];
	regionsCount: number;
	hasWidgets: boolean;
	hasComposedOf: boolean;
	implementationContract: {
		mode: "direct-template" | "adapt-template" | "compose";
		requiredImport?: {path: string; export?: string};
		minimalExample?: string;
		forbiddenApproaches: string[];
		requiredNextTool: "create_implementation_plan";
	};
}

export interface ResolveTemplateData {
	query: {intent: string; goal: ImplementationGoal; goalSource: "explicit" | "inferred"};
	goal: ImplementationGoal;
	referenceAnalysis?: ResolveTemplateInput["referenceAnalysis"];
	candidates: TemplateCandidate[];
	selectionGate: {
		status: "ready" | "fallback-ready";
		mayImplement: true;
		strategy: "direct-template" | "adapt-template" | "compose";
		selectedTemplateId?: string;
		fallbackOrder: Array<"adapt-template" | "compose-widgets" | "compose-components" | "create-with-core">;
		message: string;
	};
}

const FALLBACK_ORDER: ResolveTemplateData["selectionGate"]["fallbackOrder"] = [
	"adapt-template",
	"compose-widgets",
	"compose-components",
	"create-with-core",
];

export const resolveTemplate: CapabilityFn<ResolveTemplateInput, ResolveTemplateData> = (
	input,
	ctx,
): CapabilityResult<ResolveTemplateData> => {
	const limit = input.limit ?? 3;
	const goal = input.goal ?? inferImplementationGoal(input.intent);
	// Over-fetch so post-filters (archetype/category) still leave `limit` candidates.
	const hits = ctx.store.searchProvider().search({query: input.intent, tiers: ["template"], limit: limit * 4});

	const filtered = hits.filter((h) => {
		if (input.archetype && (h.record.archetype ?? "").toLowerCase() !== input.archetype.toLowerCase()) return false;
		if (input.category && (h.record.category ?? "").toLowerCase() !== input.category.toLowerCase()) return false;
		return true;
	});

	const candidates: TemplateCandidate[] = filtered.slice(0, limit).map((h) => {
		const t = h.record;
		const regionsCount = t.regions?.length ?? 0;
		const hasWidgets = (t.widgets?.length ?? 0) > 0;
		const hasComposedOf = (t.composedOf?.length ?? 0) > 0;
		const confidence = confidenceBand(h.score);
		return {
			ref: {id: t.id, tier: "template", version: t.version},
			name: t.name,
			archetype: t.archetype,
			intent: t.intent,
			score: h.score,
			confidence,
			rationale: `matched [${h.matchedFields.join(", ") || "text"}]${t.archetype ? ` · ${t.archetype}` : ""} · ${regionsCount} regions`,
			when: t.when,
			whenNot: t.whenNot,
			chooseOver: t.chooseOver,
			regionsCount,
			hasWidgets,
			hasComposedOf,
			implementationContract: {
				mode: !t.source.import ? "compose" : confidence === "low" ? "adapt-template" : "direct-template",
				requiredImport:
					t.source.import && confidence !== "low" ? {path: t.source.import, export: t.source.export} : undefined,
				minimalExample: t.minimalExample,
				forbiddenApproaches: [
					"Do not recreate an available Core template with standalone HTML/CSS.",
					"Do not substitute generic or hand-built UI for an available Core template or component.",
				],
				requiredNextTool: "create_implementation_plan",
			},
		};
	});

	const top = candidates[0];
	const selectionGate: ResolveTemplateData["selectionGate"] =
		candidates.length === 0
			? {
					status: "fallback-ready",
					mayImplement: true,
					strategy: "compose",
					fallbackOrder: FALLBACK_ORDER,
					message:
						"No Core template matched. Continue without confirmation by composing Core widgets/components, then create Core-aligned application UI if the catalog has no suitable artifact.",
				}
			: top.confidence === "low" || top.implementationContract.mode !== "direct-template"
				? {
						status: "fallback-ready",
						mayImplement: true,
						strategy: top.implementationContract.mode === "compose" ? "compose" : "adapt-template",
						selectedTemplateId: top.ref.id,
						fallbackOrder: FALLBACK_ORDER,
						message:
							"No exact template match is required. Use the nearest template as a structural reference, then automatically fall back through Core widgets, components, and Core-aligned custom application UI.",
					}
				: {
						status: "ready",
						mayImplement: true,
						strategy: "direct-template",
						selectedTemplateId: top.ref.id,
						fallbackOrder: FALLBACK_ORDER,
						message: "The selected template is ready for create_implementation_plan.",
					};

	return {
		data: {
			query: {intent: input.intent, goal, goalSource: input.goal ? "explicit" : "inferred"},
			goal,
			referenceAnalysis: input.referenceAnalysis,
			candidates,
			selectionGate,
		},
		sources: filtered.slice(0, limit).map((h) => h.record),
	};
};
