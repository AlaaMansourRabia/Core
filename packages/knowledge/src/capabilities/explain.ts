// explain — the "why does this artifact exist / when (not) to use it / what instead" narrative for a
// single artifact, assembled from its normalized record + reverse-graph lookups. This is how an editor
// justifies a choice or finds alternatives without reading the repo.

import type {ChooseOver, CommonMistake, InsteadUse} from "../model/record";
import type {CapabilityResult} from "../schemas/envelope";
import type {ExplainInput} from "../schemas/inputs";
import {CapabilityError, type CapabilityFn} from "./context";

export interface ExplainData {
	ref: {id: string; tier: string; version: string};
	name: string;
	purpose?: string;
	when: string[];
	whenNot: string[];
	chooseOver: ChooseOver[];
	insteadUse: InsteadUse[];
	alternatives: string[];
	pairsWith: string[];
	requiredProviders: string[];
	commonMistakes: CommonMistake[];
	minimalExample?: string;
	import?: string;
	relatedTemplates: string[];
	relatedWidgets: string[];
}

export const explain: CapabilityFn<ExplainInput, ExplainData> = (input, ctx): CapabilityResult<ExplainData> => {
	const key = input.id ?? input.name;
	if (!key) throw new CapabilityError("bad_request", "Provide `id` or `name`.");
	const r = ctx.store.getByName(key) ?? ctx.store.getById(key);
	if (!r) throw new CapabilityError("artifact.not_found", `No artifact "${key}" in the index.`, {target: key});

	const usedBy = [...ctx.store.reverse("widgetOf", r.name), ...ctx.store.reverse("composedOf", r.name)];
	const relatedTemplates = [...new Set(usedBy.filter((x) => x.tier === "template").map((x) => x.name))];
	const relatedWidgets = [
		...new Set([...usedBy.filter((x) => x.tier === "widget").map((x) => x.name), ...r.pairsWith]),
	];
	const alternatives = [...new Set([...r.chooseOver.map((c) => c.component), ...r.insteadUse.map((u) => u.component)])];

	return {
		data: {
			ref: {id: r.id, tier: r.tier, version: r.version},
			name: r.name,
			purpose: r.intent,
			when: r.when,
			whenNot: r.whenNot,
			chooseOver: r.chooseOver,
			insteadUse: r.insteadUse,
			alternatives,
			pairsWith: r.pairsWith,
			requiredProviders: r.requiredProviders,
			commonMistakes: r.commonMistakes,
			minimalExample: r.minimalExample,
			import: r.source.import,
			relatedTemplates,
			relatedWidgets,
		},
		sources: [r],
	};
};
