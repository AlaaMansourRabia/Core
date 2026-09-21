// The unified knowledge record. Every artifact tier (template / widget / component / pattern /
// utility) is normalized to ONE shape so the Store, the SearchProvider, and the capabilities never
// branch on tier for storage or ranking. Tier-specific fields are all optional. This is the in-memory
// projection of the canonical sources (manifests/*.json + library-index.json + component-api.json);
// a future DbStore persists the SAME shape, which is why nothing here is coupled to the filesystem.

export type Tier = "template" | "widget" | "component" | "pattern" | "utility";

export interface ChooseOver {
	component: string;
	because?: string;
}

/** "Defer to X in this situation" — the reciprocal of chooseOver. Authored as an object in manifests
 *  (`{component, whenInstead}`) but tolerant of a bare string. */
export interface InsteadUse {
	component: string;
	whenInstead?: string;
}

export interface RegionRecord {
	id: string;
	role?: string;
	required: boolean;
	recommended: string[];
	note?: string;
}

/** A widget placement declared by a template, unified from requiredWidgets/optionalWidgets or synthesized from regions. */
export interface WidgetPlacement {
	name: string;
	region?: string;
	required: boolean;
	kind: "required" | "recommended";
	note?: string;
	/** How this placement was derived — authored widget lists vs synthesized from a region's `recommended`. */
	derivedFrom: "widgets" | "regions" | "composedOf";
}

export interface PropDef {
	name: string;
	type: string;
	required: boolean;
	values?: string[];
}

export interface CommonMistake {
	mistake?: string;
	symptom?: string;
	fix?: string;
	ref?: string;
}

export interface SourceRef {
	path?: string;
	import?: string;
	export?: string;
}

export interface Lineage {
	origin?: string;
	status?: string;
	confidence?: string | number;
	[k: string]: unknown;
}

/** Values catalog manifests may emit for responsive layout ownership. */
export const ARTIFACT_RESPONSIVE_BEHAVIORS = [
	"wrap",
	"collapse",
	"overflow-menu",
	"overflow-menu-and-navigation-row",
	"consumer",
	"none",
] as const;

export type ArtifactResponsiveBehavior = (typeof ARTIFACT_RESPONSIVE_BEHAVIORS)[number];

/** Machine-readable layout ownership contract authored by an artifact manifest. */
export interface ArtifactOwnership {
	surface: "artifact" | "route" | "shell";
	background: "owned" | "transparent" | "consumer";
	border: "top" | "bottom" | "all" | "none";
	padding: "owned" | "slot" | "consumer";
	scrolling: "artifact" | "route" | "none";
	responsiveBehavior: ArtifactResponsiveBehavior;
	expectedWrapper: string;
}

/** Precomputed search haystack — the SearchProvider reads only this, never the raw record. */
export interface SearchDoc {
	name: string;
	tags: string;
	intent: string;
	when: string;
	category: string;
	/** Everything concatenated (used for snippet extraction + fallback matching). */
	text: string;
}

export interface NormalizedRecord {
	id: string;
	tier: Tier;
	name: string;
	category?: string;
	archetype?: string;
	version: string;
	manifestStatus: string;
	intent?: string;
	when: string[];
	whenNot: string[];
	chooseOver: ChooseOver[];
	insteadUse: InsteadUse[];
	pairsWith: string[];
	requiredProviders: string[];
	tags: string[];
	source: SourceRef;
	// tier-specific (all optional):
	regions?: RegionRecord[];
	widgets?: WidgetPlacement[];
	composedOf?: string[];
	subcomponents?: string[];
	variants?: string[];
	sizes?: string[];
	props?: PropDef[] | null;
	propsStatus?: "available" | "unavailable";
	commonMistakes: CommonMistake[];
	minimalExample?: string;
	dataContract?: unknown;
	ownership?: ArtifactOwnership;
	lineage?: Lineage;
	variantOf?: string;
	/** Path to the canonical manifest this record projects (for provenance). */
	manifestPath?: string;
	_search: SearchDoc;
}

const arr = <T>(v: T[] | undefined | null): T[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** Manifests author insteadUse as objects (`{component, whenInstead}`); tolerate a bare string too. */
function normalizeInsteadUse(v: Array<string | InsteadUse> | undefined): InsteadUse[] {
	return arr(v).map((x) =>
		typeof x === "string" ? {component: x} : {component: x.component, whenInstead: x.whenInstead},
	);
}

/** A minimal view of a raw manifest — we read defensively since manifests vary by tier/completeness. */
export interface RawManifest {
	id?: string;
	tier?: string;
	name?: string;
	category?: string;
	archetype?: string;
	version?: string;
	manifestStatus?: string;
	intent?: string;
	when?: string[];
	whenNot?: string[];
	chooseOver?: ChooseOver[];
	insteadUse?: Array<string | InsteadUse>;
	pairsWith?: string[];
	requiredProviders?: string[];
	tags?: string[];
	source?: SourceRef;
	regions?: Array<{id: string; role?: string; required?: boolean; recommended?: string[]; note?: string}>;
	requiredWidgets?: Array<{name: string; region?: string; required?: boolean; note?: string}>;
	optionalWidgets?: Array<{name: string; region?: string; required?: boolean; note?: string}>;
	composedOf?: string[];
	subcomponents?: unknown[];
	commonMistakes?: CommonMistake[];
	minimalExample?: string;
	dataContract?: unknown;
	ownership?: ArtifactOwnership;
	lineage?: Lineage;
	variantOf?: string;
	[k: string]: unknown;
}

/** Structural enrichment merged from library-index.json (generated projection). */
export interface StructuralEnrichment {
	variants?: string[];
	sizes?: string[];
	import?: string;
	path?: string;
}

/** Build the unified WidgetPlacement[] for a template, unifying the three authored shapes. Returns
 *  `{widgets, derivedFrom}` — `derivedFrom` tells the caller whether the data was authored or synthesized. */
export function unifyWidgets(m: RawManifest): {
	widgets: WidgetPlacement[];
	source: "widgets" | "regions" | "composedOf" | "none";
} {
	const req = arr(m.requiredWidgets);
	const opt = arr(m.optionalWidgets);
	if (req.length || opt.length) {
		return {
			source: "widgets",
			widgets: [
				...req.map((w): WidgetPlacement => ({
					name: w.name,
					region: w.region,
					required: true,
					kind: "required",
					note: w.note,
					derivedFrom: "widgets",
				})),
				...opt.map((w): WidgetPlacement => ({
					name: w.name,
					region: w.region,
					required: false,
					kind: "recommended",
					note: w.note,
					derivedFrom: "widgets",
				})),
			],
		};
	}
	// Fall back to synthesizing from regions[].recommended (dashboard/login-style templates the SDK drops).
	const regions = arr(m.regions);
	const fromRegions: WidgetPlacement[] = [];
	for (const r of regions)
		for (const name of arr(r.recommended))
			fromRegions.push({
				name,
				region: r.id,
				required: !!r.required,
				kind: r.required ? "required" : "recommended",
				note: r.note,
				derivedFrom: "regions",
			});
	if (fromRegions.length) return {source: "regions", widgets: fromRegions};
	// Last resort: composedOf as tier-agnostic building blocks (resolved to widget/component by the caller).
	const composed = arr(m.composedOf);
	if (composed.length)
		return {
			source: "composedOf",
			widgets: composed.map((name): WidgetPlacement => ({
				name,
				required: false,
				kind: "recommended",
				derivedFrom: "composedOf",
			})),
		};
	return {source: "none", widgets: []};
}

export function normalizeRegions(m: RawManifest): RegionRecord[] {
	return arr(m.regions).map((r) => ({
		id: r.id,
		role: r.role,
		required: !!r.required,
		recommended: arr(r.recommended),
		note: r.note,
	}));
}

/** Normalize one raw manifest (+ optional structural/props enrichment) into a NormalizedRecord. */
export function normalize(
	m: RawManifest,
	tier: Tier,
	opts: {enrich?: StructuralEnrichment; props?: PropDef[] | null; manifestPath?: string} = {},
): NormalizedRecord {
	const {enrich, props, manifestPath} = opts;
	const name = str(m.name) || str(m.id);
	const tags = arr(m.tags);
	const when = arr(m.when);
	const intent = str(m.intent);
	const regions = tier === "template" ? normalizeRegions(m) : undefined;
	const widgets = tier === "template" ? unifyWidgets(m).widgets : undefined;

	const search: SearchDoc = {
		name,
		tags: tags.join(" "),
		intent,
		when: when.join(" "),
		category: str(m.category),
		text: [name, m.id, m.archetype, tags.join(" "), intent, when.join(" "), arr(m.whenNot).join(" ")]
			.filter(Boolean)
			.join(" "),
	};

	return {
		id: str(m.id) || name,
		tier,
		name,
		category: m.category ? str(m.category) : undefined,
		archetype: m.archetype ? str(m.archetype) : undefined,
		version: str(m.version) || "1.0.0",
		manifestStatus: str(m.manifestStatus) || "complete",
		intent: intent || undefined,
		when,
		whenNot: arr(m.whenNot),
		chooseOver: arr(m.chooseOver),
		insteadUse: normalizeInsteadUse(m.insteadUse),
		pairsWith: arr(m.pairsWith),
		requiredProviders: arr(m.requiredProviders),
		tags,
		source: {
			path: m.source?.path ?? enrich?.path,
			import: m.source?.import ?? enrich?.import,
			export: m.source?.export,
		},
		regions,
		widgets,
		composedOf: m.composedOf ? arr(m.composedOf) : undefined,
		subcomponents: m.subcomponents ? (m.subcomponents as string[]) : undefined,
		variants: enrich?.variants,
		sizes: enrich?.sizes,
		props: tier === "component" ? (props ?? null) : undefined,
		propsStatus: tier === "component" ? (props && props.length ? "available" : "unavailable") : undefined,
		commonMistakes: arr(m.commonMistakes),
		minimalExample: m.minimalExample ? str(m.minimalExample) : undefined,
		dataContract: m.dataContract,
		ownership: m.ownership,
		lineage: m.lineage,
		variantOf: m.variantOf ? str(m.variantOf) : undefined,
		manifestPath,
		_search: search,
	};
}
