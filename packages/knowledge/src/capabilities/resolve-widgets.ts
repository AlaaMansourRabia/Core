// resolve_widgets — the DETERMINISTIC structural graph-walk half of retrieval (entry template -> its
// composition). Closes the SDK's #1 gap: it unifies the THREE authored widget shapes
// (requiredWidgets/optionalWidgets · regions[].recommended · composedOf) plus a thin fallback, and
// flags when data was synthesized from regions rather than authored. Never re-discovers a dependency
// by keyword — everything comes from the manifest graph.

import type {ArtifactOwnership, NormalizedRecord, WidgetPlacement} from "../model/record";
import type {CapabilityResult, Warning} from "../schemas/envelope";
import type {ResolveWidgetsInput} from "../schemas/inputs";
import type {KnowledgeStore} from "../store/store";
import {CapabilityError, type CapabilityFn} from "./context";

export type WidgetShape = "widgets" | "regions" | "composed" | "thin";

export interface WidgetEntry {
	ref: {id: string; tier: string};
	name: string;
	intent?: string;
	tier: string;
	region?: string;
	required: boolean;
	kind: "required" | "recommended";
	/** false when the referenced artifact has no manifest yet (declared but not renderable). */
	renderable: boolean;
	source?: {path?: string; import?: string; export?: string};
	minimalExample?: string;
	propsStatus?: "available" | "unavailable";
	ownership?: ArtifactOwnership;
}

export interface ResolveWidgetsData {
	templateId: string;
	shape: WidgetShape;
	widgets: WidgetEntry[];
	byRegion: Record<string, {role?: string; required: boolean; widgets: WidgetEntry[]}>;
	requiredDependencies: string[];
	notes: string[];
}

const SHAPE_BY_SOURCE: Record<WidgetPlacement["derivedFrom"], WidgetShape> = {
	widgets: "widgets",
	regions: "regions",
	composedOf: "composed",
};

function resolveEntry(store: KnowledgeStore, w: WidgetPlacement): WidgetEntry {
	const rec = store.getByName(w.name);
	const tier = rec?.tier ?? "widget";
	return {
		ref: {id: rec?.id ?? w.name, tier},
		name: w.name,
		intent: rec?.intent,
		tier,
		region: w.region,
		required: w.required,
		kind: w.kind,
		renderable: rec != null,
		source: rec?.source,
		minimalExample: rec?.minimalExample,
		propsStatus: rec?.propsStatus,
		ownership: rec?.ownership,
	};
}

export const resolveWidgets: CapabilityFn<ResolveWidgetsInput, ResolveWidgetsData> = (
	input,
	ctx,
): CapabilityResult<ResolveWidgetsData> => {
	const t = ctx.store.getById(input.template) ?? ctx.store.getByName(input.template);
	if (!t)
		throw new CapabilityError("template.not_found", `No template "${input.template}" in the index.`, {
			target: input.template,
		});
	if (t.tier !== "template")
		throw new CapabilityError("not_a_template", `"${input.template}" is a ${t.tier}, not a template.`, {
			target: input.template,
		});

	let placements = t.widgets ?? [];
	if (input.region) placements = placements.filter((w) => w.region === input.region);

	const shape: WidgetShape = placements.length ? SHAPE_BY_SOURCE[placements[0].derivedFrom] : "thin";
	const widgets = placements.map((w) => resolveEntry(ctx.store, w));

	const byRegion: ResolveWidgetsData["byRegion"] = {};
	for (const region of t.regions ?? [])
		byRegion[region.id] = {role: region.role, required: region.required, widgets: []};
	for (const w of widgets) {
		const key = w.region ?? "(unassigned)";
		if (!byRegion[key]) byRegion[key] = {role: undefined, required: false, widgets: []};
		byRegion[key].widgets.push(w);
	}

	// Structural graph-walk for dependencies: providers the template + its placed widgets require.
	const deps = new Set<string>(t.requiredProviders);
	const touched: NormalizedRecord[] = [t];
	for (const w of widgets) {
		const rec = ctx.store.getByName(w.name);
		if (rec) {
			touched.push(rec);
			for (const p of rec.requiredProviders) deps.add(p);
		}
	}

	const warnings: Warning[] = [];
	const notes: string[] = [];
	if (shape === "regions")
		warnings.push({
			code: "widgets.derived_from_regions",
			message: "Widget plan was synthesized from regions[].recommended (not an authored widget list).",
			target: t.id,
		});
	if (shape === "composed")
		warnings.push({
			code: "widgets.derived_from_composedOf",
			message: "Plan derived from composedOf building blocks (component/widget mix), not a region layout.",
			target: t.id,
		});
	if (shape === "thin")
		notes.push(
			`Template "${t.id}" declares no widgets/regions/composedOf yet — it is not widgetized. See its minimalExample or resolve_template lineage.`,
		);

	return {
		data: {templateId: t.id, shape, widgets, byRegion, requiredDependencies: [...deps], notes},
		warnings,
		sources: touched,
	};
};
