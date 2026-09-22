import type {ReactElement} from "react";

import {cn} from "@corensystem/core-utils";
import {Box, Check, Search} from "lucide-react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Empty} from "../empty";
import {type Wc3Install, productTypeMeta} from "./wc3-lineage-data";
import type {Wc3FsLinkProps, Wc3LineageNavTarget} from "./wc3-lineage-shared";
import {WC3_ACTION_TYPES, WC3_LINK_TYPES, WC3_OBJECT_TYPES, type Wc3ObjectType} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";
import {
	WC3_GROUP_TO_PLATFORM_ROLES,
	WC3_PRODUCTS,
	type Wc3Product,
	type Wc3ProductPermissionKey,
} from "./wc3-product-data";

// The one module the three Products surfaces share — the catalogue view, the single-product detail
// page and the install dialog. Same rule as wc3-lineage-shared.tsx: it imports nothing from them, so
// there is no cycle and no helper has to be pasted three times.
//
// What is deliberately NOT here: computeInstallPlan and the blocker vocabulary (one consumer — the
// dialog) and the nine permission-matrix row descriptors (one consumer — the detail page). Keeping
// single-consumer code out is what keeps this module small enough to freeze while three agents build
// against it.

// ─── Props ───────────────────────────────────────────────────────────────────

export type Wc3ProductViewProps = {
	/** Reports the drill-in segment for the shell's breadcrumb. */
	onDetailChange?: (label: string | null) => void;
	/** Cross-perspective navigation — the green object-type chips jump to the Ontology perspective. */
	onNavigate?: (target: Wc3LineageNavTarget) => void;
} & Wc3FsLinkProps;

// ─── Types ───────────────────────────────────────────────────────────────────

/** A workspace persona — the "lens" the permission gates are evaluated against. */
export type Wc3Persona = {id: string; name: string; groups: string[]; lens: string};

/** The result of checking one product permission list against a persona's platform roles. */
export type Wc3RoleGate = {
	gateKey: Wc3ProductPermissionKey;
	need: string[];
	have: string[];
	matched: string[];
	ok: boolean;
	/** Empty when `ok`; callers render {@link gateOkSentence} instead. */
	reason: string;
};

/** Which flow the install dialog is running — only the title and the apply record differ. */
export type Wc3InstallMode = "install" | "upgrade";

/** The catalogue's table⇄card toggle. One DataTable is mounted either way. */
export type Wc3ProductViewMode = "table" | "cards";

/** A section of the single-product detail page — the prototype's PRODUCT_TABS. */
export type Wc3ProductSection = "outputs" | "permissions" | "evidence" | "dependencies" | "readiness" | "installs";

/** The catalogue's KPI band, computed from the live install array and the active persona. */
export type Wc3ProductKpis = {
	catalogueCount: number;
	productTypeCount: number;
	installedCount: number;
	baselineCount: number;
	sessionCount: number;
	provenancedObjectTypes: number;
	liveObjectTypes: number;
	osdkScopeCount: number;
	prodBlockedCount: number;
	personaRoleList: string[];
};

// ─── Constants ───────────────────────────────────────────────────────────────

/** The five workspace personas, verbatim from the prototype's PERSONAS. */
export const WC3_PERSONAS: Wc3Persona[] = [
	{id: "u1", name: "Hana Al-Sayed", groups: ["Ontology Admins"], lens: "Admin lens"},
	{id: "u2", name: "Farid Mansour", groups: ["Safety Team"], lens: "HSE Lead lens"},
	{id: "u3", name: "Odalys Reyes", groups: ["Site Engineers"], lens: "Site Engineer lens"},
	{id: "u4", name: "Priya Venkat", groups: ["Schedulers"], lens: "Scheduler lens"},
	{id: "u5", name: "Leo Baptiste", groups: ["Viewers"], lens: "Viewer lens"},
];

/** The persona the workspace opens on — the Admin lens. */
export const WC3_DEFAULT_PERSONA = WC3_PERSONAS[0];

/** Detail-page sections, in PRODUCT_TABS order. */
export const WC3_PRODUCT_SECTIONS: readonly Wc3ProductSection[] = [
	"outputs",
	"permissions",
	"evidence",
	"dependencies",
	"readiness",
	"installs",
];

/**
 * Product type -> Badge variant. Theme tokens only; the prototype's hex palette stays dropped (the
 * decision wc3-lineage-data.ts already made when it wrote WC3_PRODUCT_TYPE_META).
 */
export const PRODUCT_TYPE_VARIANT: Record<string, "infoSoft" | "successSoft" | "warningSoft" | "neutralSoft"> = {
	"ontology-product": "infoSoft",
	"source-product": "successSoft",
	"runtime-product": "warningSoft",
	"composite-product": "neutralSoft",
};

/** What the install dialog pre-fills three of its four release-evidence fields with. */
export const DEFAULT_RELEASE_EVIDENCE = {
	releaseChannel: "STABLE",
	promotionRunbookRef: "runbooks/product-release-promotion.md",
	rollbackRunbookRef: "runbooks/product-rollback.md",
};

// ─── Persona / gate ──────────────────────────────────────────────────────────

/** The WC3 platform roles a persona holds — the union of its groups' role lists, insertion-ordered. */
export function personaRoles(persona: Wc3Persona): string[] {
	const roles: string[] = [];
	for (const group of persona.groups) {
		for (const role of WC3_GROUP_TO_PLATFORM_ROLES[group] ?? []) {
			if (!roles.includes(role)) roles.push(role);
		}
	}
	return roles;
}

/**
 * Checks one of a product's nine permission lists against a persona.
 *
 * A manifest may declare an EMPTY list, which no role can ever satisfy — 11 of the 17 products do
 * exactly that for `installProdRoles`, which is why the catalogue's "Prod-blocked" KPI is high on
 * every lens including Admin. That case gets its own reason so the copy does not read as a
 * role-assignment problem when it is a manifest problem.
 */
export function roleGate(p: Wc3Product, gateKey: Wc3ProductPermissionKey, persona: Wc3Persona): Wc3RoleGate {
	const need = p.permissions[gateKey];
	const have = personaRoles(persona);
	const matched = need.filter((r) => have.includes(r));
	const ok = matched.length > 0;
	let reason = "";
	if (!ok) {
		reason =
			need.length === 0
				? `Blocked: the manifest declares an EMPTY ${gateKey} list for ${p.productKey} ${p.version} — no platform role can do this. It takes a manifest change and a re-publish.`
				: `Blocked: ${persona.name} (${persona.lens}) holds ${have.join(", ") || "no platform roles"}; ${gateKey} requires one of ${need.join(", ")}.`;
	}
	return {gateKey, need, have, matched, ok, reason};
}

/** The positive counterpart of `gate.reason` — the Draft step's and the Apply summary's ok box. */
export function gateOkSentence(gate: Wc3RoleGate, persona: Wc3Persona): string {
	return `${persona.name} satisfies ${gate.gateKey} via ${gate.matched.join(", ")}.`;
}

/** Why a baseline install cannot be rolled back or uninstalled. All four fixture installs are baseline. */
export function baselineBlockReason(p: Wc3Product): string {
	return `Blocked: “${p.displayName}” is a BASELINE install — it provisioned the ontology this fixture workspace was seeded with, so it is pinned.`;
}

// ─── Live install state ──────────────────────────────────────────────────────

// wc3-product-data.ts's installsOf / activeInstall / isProductInstalled close over the frozen
// module-level WC3_INSTALLS, so they start lying the moment a session install exists. Use them ONLY
// to seed state; every render path must go through these array-taking variants instead.

/** Every install of a product in the live array, applied or not, in order. */
export function installsOfIn(installs: Wc3Install[], key: string): Wc3Install[] {
	return installs.filter((i) => i.productKey === key);
}

/** The applied install of a product in the live array, if the workspace currently has one. */
export function activeInstallIn(installs: Wc3Install[], key: string): Wc3Install | undefined {
	return installs.find((i) => i.productKey === key && i.status === "applied");
}

/** Whether a product has an applied install in the live array. */
export function isInstalledIn(installs: Wc3Install[], key: string): boolean {
	return activeInstallIn(installs, key) !== undefined;
}

// ─── Ontology bridge ─────────────────────────────────────────────────────────

/**
 * The prototype's `camel()`: a manifest name (`capture_activity`, `Crew`) becomes the API name the
 * ontology stores (`captureActivity`, `crew`). Only the FIRST character of the head segment is
 * lower-cased and only the first character of each following segment is upper-cased — the rest of
 * every segment is left alone, which is what keeps an already-camel name stable.
 */
export function camelApiName(name: string): string {
	const parts = name
		.trim()
		.split(/[^A-Za-z0-9]+/)
		.filter(Boolean);
	if (parts.length === 0) return "";
	const [head, ...rest] = parts;
	return (
		head.charAt(0).toLowerCase() +
		head.slice(1) +
		rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("")
	);
}

/** The live ontology's object types, keyed by API name — the install plan's collision index. */
export const LIVE_OBJECT_TYPE_BY_API: ReadonlyMap<string, Wc3ObjectType> = new Map(
	WC3_OBJECT_TYPES.map((ot) => [ot.apiName, ot]),
);

/** The live object type a manifest name resolves to, or undefined when the name is free. */
export function liveObjectType(manifestName: string): Wc3ObjectType | undefined {
	return LIVE_OBJECT_TYPE_BY_API.get(camelApiName(manifestName));
}

/** Every link API name in use — both endpoints of every live link type. */
export const LIVE_LINK_API_NAMES: ReadonlySet<string> = new Set(
	WC3_LINK_TYPES.flatMap((lt) => [lt.sideA.apiName, lt.sideB.apiName]),
);

/** Every action API name in use. */
export const LIVE_ACTION_API_NAMES: ReadonlySet<string> = new Set(WC3_ACTION_TYPES.map((at) => at.apiName));

// ─── Search ──────────────────────────────────────────────────────────────────

/**
 * The blob the catalogue's "product" column matches on — the prototype's `textOf()` plus the
 * product-type LABEL, so typing "Composite" finds something now that the label (not the raw
 * `composite-product` key) is what the Filter and the badges show.
 *
 * Because it is one column filter it behaves identically in table mode and card mode: the toggle
 * only changes what DataTable's body renders, never what it filters.
 */
export function productSearchText(p: Wc3Product): string {
	return [
		p.productKey,
		p.displayName,
		p.version,
		p.productType,
		p.ownerEnclaveId,
		p.outputs.ontologyObjectTypes.join(" "),
		p.dependencies.map((d) => d.productKey).join(" "),
		productTypeMeta(p.productType).label,
	].join(" ");
}

// ─── KPI band ────────────────────────────────────────────────────────────────

/**
 * The five catalogue MetricCards. Reads the LIVE install array so an in-session install moves the
 * install counts, and the LIVE persona so the Prod-blocked count follows the lens.
 *
 * `provenancedObjectTypes` counts only the added object types that still resolve to a live ontology
 * row — an install applied in-session cannot actually mutate WC3_OBJECT_TYPES (it is a module const
 * shared with the Ontology perspective), so this deliberately stays honest rather than optimistic.
 */
export function productKpis(installs: Wc3Install[], persona: Wc3Persona): Wc3ProductKpis {
	const applied = installs.filter((i) => i.status === "applied");
	const liveIds = new Set(WC3_OBJECT_TYPES.map((ot) => ot.id));
	const provenanced = new Set<string>();
	for (const install of applied) {
		for (const id of install.addedObjectTypes) {
			if (liveIds.has(id)) provenanced.add(id);
		}
	}
	return {
		catalogueCount: WC3_PRODUCTS.length,
		productTypeCount: new Set(WC3_PRODUCTS.map((p) => p.productType)).size,
		installedCount: applied.length,
		baselineCount: applied.filter((i) => i.baseline).length,
		sessionCount: applied.filter((i) => !i.baseline).length,
		provenancedObjectTypes: provenanced.size,
		liveObjectTypes: WC3_OBJECT_TYPES.length,
		osdkScopeCount: WC3_PRODUCTS.reduce((total, p) => total + p.outputs.osdkScopes.length, 0),
		prodBlockedCount: WC3_PRODUCTS.filter((p) => !roleGate(p, "installProdRoles", persona).ok).length,
		personaRoleList: personaRoles(persona),
	};
}

// ─── Presentational ──────────────────────────────────────────────────────────

/** A product type's glyph. All four fixture icons (layers/database/bolt/component) are in GLYPHS. */
export function ProductTypeGlyph({productType, className}: {productType: string; className?: string}): ReactElement {
	return <OntologyGlyph name={productTypeMeta(productType).icon} className={className} />;
}

/** Tile tints, mirroring the Badge soft variants so a card's tile and its badge read as one colour. */
const TILE_TINT: Record<string, string> = {
	infoSoft: "wwc:border-blue-600/25 wwc:bg-blue-500/10 wwc:text-blue-700 wwc:dark:text-blue-400",
	successSoft: "wwc:border-green-600/25 wwc:bg-green-500/10 wwc:text-green-700 wwc:dark:text-green-400",
	warningSoft: "wwc:border-amber-600/25 wwc:bg-amber-500/10 wwc:text-amber-700 wwc:dark:text-amber-400",
	neutralSoft: "wwc:border-border wwc:bg-muted wwc:text-muted-foreground",
};

/** The square tinted product tile — the card's, the table cell's and the detail header's avatar. */
export function ProductGlyphTile({productType, className}: {productType: string; className?: string}): ReactElement {
	const variant = PRODUCT_TYPE_VARIANT[productType] ?? "neutralSoft";
	return (
		<span
			className={cn(
				"wwc:flex wwc:size-7 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border",
				TILE_TINT[variant],
				className,
			)}
		>
			<ProductTypeGlyph productType={productType} className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
		</span>
	);
}

/** Glyph + label badge for a product type. Falls back to neutral for an unmapped type. */
export function ProductTypeBadge({productType}: {productType: string}): ReactElement {
	return (
		<Badge variant={PRODUCT_TYPE_VARIANT[productType] ?? "neutralSoft"}>
			<ProductTypeGlyph productType={productType} />
			{productTypeMeta(productType).label}
		</Badge>
	);
}

/** Installed (with its environment, and a `baseline` marker) or Available. */
export function InstallStateBadge({install}: {install: Wc3Install | undefined}): ReactElement {
	if (!install) return <Badge variant="neutralSoft">Available</Badge>;
	return (
		<>
			<Badge variant="successSoft">
				<Check />
				{`Installed · ${install.environment}`}
			</Badge>
			{install.baseline && <Badge variant="neutralSoft">baseline</Badge>}
		</>
	);
}

/**
 * The catalogue's no-results state. ONE definition, passed to the DataTable's `emptyMessage` AND
 * returned from the card grid's empty branch, so the two view modes cannot drift apart.
 */
export function ProductsEmptyState({onClear}: {onClear: () => void}): ReactElement {
	return (
		<Empty
			icon={<Search className="wwc:h-6 wwc:w-6" />}
			title="No products match"
			description="Nothing in the 17-product first-party catalogue matches this filter."
			action={
				<Button variant="outline" onClick={onClear}>
					<Search />
					Clear the filter
				</Button>
			}
		/>
	);
}

/** The detail route's 404 — an unknown product key. */
export function ProductNotFound({productKey, onBack}: {productKey: string; onBack: () => void}): ReactElement {
	return (
		<Empty
			icon={<Box className="wwc:h-6 wwc:w-6" />}
			title="No such product"
			description={`There is no product with key “${productKey}” in the Core first-party catalogue (17 products).`}
			action={<Button onClick={onBack}>Back to the catalogue</Button>}
		/>
	);
}

// ─── Re-exports ──────────────────────────────────────────────────────────────

// Re-exported, not restated: the Products surfaces use the same pane, mono span, object-type chip and
// breadcrumb effect the Lineage tabs already ship, and the same product-type label/icon lookup.
export {Mono, Pane, TypeGlyphLabel, useDetailLabel} from "./wc3-lineage-shared";
export type {Wc3LineageNavTarget};
export {productTypeMeta} from "./wc3-lineage-data";
