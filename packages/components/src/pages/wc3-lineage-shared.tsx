import {cn} from "@corensystem/core-utils";
import {Download, LayoutGrid, Map, Plane, Radar, Ruler, SlidersHorizontal, Tag, Upload, Workflow} from "lucide-react";
import {useEffect, useRef} from "react";

import type {Wc3ObjectType} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";

// The one module the three Lineage tabs share. It imports nothing from them, so — unlike the
// ontology precedent, where Pane is copied into every view to avoid closing an import cycle —
// Pane can live here and be imported three times instead of pasted three times.

// ─── Props ───────────────────────────────────────────────────────────────────

/** Where an "Open" affordance wants the workspace shell to go. */
export type Wc3LineageNavTarget = {perspectiveId: string; tabId?: string; recordId?: string};

/**
 * The props that wire a perspective's view to the file system, in both directions.
 *
 * Outbound (file → app): a file's `ref` arrives as `openRecordId` and the view drills into that
 * record instead of dropping the user on a list to find it again.
 *
 * Inbound (app → file): `onShowInFiles` lets each listed record show the folder it lives in and
 * navigate back to it, which is what makes the two ends one loop.
 */
export type Wc3FsLinkProps = {
	/** A record to open on arrival, or `null` for an ordinary visit to the tab. */
	openRecordId?: string | null;
	/** Called once the view has opened it, so the shell can forget it. */
	onOpenRecordConsumed?: () => void;
	/** Opens the file system at a folder. Omit and listings render their Location column read-only. */
	onShowInFiles?: (folderId: string) => void;
	/**
	 * Rendered as the FIRST field of this perspective's create dialog — the file system's "where does
	 * this go?".
	 *
	 * A slot rather than a prop with a value, because the shell owns both the control and the answer:
	 * this view only has to give it a place to appear. Omit it and the dialog is exactly what it was.
	 */
	createLocationField?: React.ReactNode;
	/**
	 * A record was just created here. The shell files it at whatever `createLocationField` chose, so a
	 * thing made in an app is as findable as one made in Files.
	 *
	 * The NAME comes with the id because this fires in the same tick as the array update above it: a
	 * shell looking the record up in its own state would be reading the array from before the change.
	 */
	onRecordCreated?: (recordId: string, name: string) => void;
};

export type LineageViewProps = {
	/** Reports the drill-in segment for the shell's breadcrumb. Only the Impact tab uses it. */
	onDetailChange?: (label: string | null) => void;
	/** Cross-perspective navigation. Coarse by design — it selects a perspective and a tab, not a record. */
	onNavigate?: (target: Wc3LineageNavTarget) => void;
	/** Opens the workspace's changeset drawer. Only the Workflow tab's empty state uses it. */
	onOpenChangeset?: () => void;
};

/**
 * Target builders, so no tab invents its own perspective/tab id strings. The ids are literals
 * rather than an import of PERSPECTIVES because that would close the cycle
 * workspace -> registry -> tabs -> shared -> workspace. The shell guards an unknown tab id, so a
 * rename degrades to a no-op rather than a crash.
 */
export const lineageNav = {
	product: (productKey: string) => ({perspectiveId: "products", tabId: "outputs", recordId: productKey}),
	pipeline: (pipelineId: string) => ({perspectiveId: "pipelines", tabId: "pipelines", recordId: pipelineId}),
	objectType: (otId: string) => ({perspectiveId: "ontology", tabId: "object-types", recordId: otId}),
	actionType: (atId: string) => ({perspectiveId: "ontology", tabId: "action-types", recordId: atId}),
	linkType: (ltId: string) => ({perspectiveId: "ontology", tabId: "link-types", recordId: ltId}),
	interface: (ifId: string) => ({perspectiveId: "ontology", tabId: "interfaces", recordId: ifId}),
	process: (procId: string) => ({perspectiveId: "processes", tabId: "processes", recordId: procId}),
	// The six PROJECTION_USAGE keys are exactly six perspective ids: command/twin/schedule/workforce/
	// processes/pipelines. That correspondence is load-bearing and is why this builder takes the raw key.
	projection: (key: string) => ({perspectiveId: key}),
} satisfies Record<string, (id: string) => Wc3LineageNavTarget>;

// ─── Layout ──────────────────────────────────────────────────────────────────

/**
 * Content pane for one tab — the same shape as the ontology views' local Pane. No title: the
 * perspective tab bar above is the header.
 *
 * `flush` exists for a pane whose first child brings its own top padding (a DataTable toolbar is
 * `py-4`). None of the three lineage tabs starts with a table, so none of them passes it.
 */
export function Pane({flush, children}: {flush?: boolean; children: React.ReactNode}) {
	return (
		<div
			className={cn(
				"wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-4 wwc:overflow-auto wwc:px-6 wwc:pb-6",
				flush ? "wwc:pt-0" : "wwc:pt-4",
			)}
		>
			{children}
		</div>
	);
}

// ─── Icons ───────────────────────────────────────────────────────────────────

/**
 * Ten icon names used by wc3-lineage-data.ts are absent from wc3-ontology-glyphs.tsx's GLYPHS map
 * and would silently fall back to a generic Box — two of the six projections, the presence_events
 * topic node, both sink kinds and several transform kinds. They are patched here rather than in the
 * glyph map because that file is shared with the ontology views.
 *
 * Every lineage-fixture icon must go through this component; only object-type icons taken off
 * WC3_OBJECT_TYPES may still reach OntologyGlyph directly (via TypeGlyphLabel).
 */
const LINEAGE_GLYPHS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
	sliders: SlidersHorizontal,
	process: Workflow,
	drone: Plane,
	download: Download,
	upload: Upload,
	tag: Tag,
	impact: Radar,
	ruler: Ruler,
	map: Map,
	grid: LayoutGrid,
};

export function LineageGlyph({name, className}: {name: string; className?: string}) {
	const Icon = LINEAGE_GLYPHS[name];
	if (Icon) return <Icon className={className ?? "wwc:h-3.5 wwc:w-3.5 wwc:shrink-0"} />;
	return <OntologyGlyph name={name} className={className} />;
}

// ─── Inline bits ─────────────────────────────────────────────────────────────

export function Mono({children}: {children: React.ReactNode}) {
	return <span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">{children}</span>;
}

/** An object type rendered inline: its glyph plus its display name, or an italic "deleted". */
export function TypeGlyphLabel({type, className}: {type: Wc3ObjectType | undefined; className?: string}) {
	if (!type) return <span className="wwc:text-muted-foreground wwc:italic">deleted</span>;
	return (
		<span className={cn("wwc:flex wwc:items-center wwc:gap-1.5 wwc:whitespace-nowrap", className)}>
			<OntologyGlyph name={type.icon} color={type.color} />
			{type.displayName}
		</span>
	);
}

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

/**
 * Reports a drill-in label to the shell's breadcrumb and clears it on unmount — without the
 * cleanup, switching tabs while drilled in leaves a stale breadcrumb tail.
 *
 * `onDetailChange` is the shell's stable setState; the other two view props are not stable and
 * must never be put in a dependency array.
 */
/**
 * Consume a deep link. When the shell hands the view an `openRecordId` that exists in this tab's
 * records, drill into it and report the arrival as spent.
 *
 * Spent, not remembered: leaving it set would re-open the same record every time the user backed out
 * of it, which is indistinguishable from the drill-in being stuck. An id that matches nothing here is
 * also cleared — the tab that owns that record will have already taken it, or nothing will.
 */
export function useOpenRecord(
	openRecordId: string | null | undefined,
	exists: (id: string) => boolean,
	open: (id: string) => void,
	onConsumed?: () => void,
) {
	// Refs so a caller passing inline closures does not re-fire the effect on every render.
	const existsRef = useRef(exists);
	const openRef = useRef(open);
	const consumedRef = useRef(onConsumed);
	existsRef.current = exists;
	openRef.current = open;
	consumedRef.current = onConsumed;

	useEffect(() => {
		if (!openRecordId) return;
		if (existsRef.current(openRecordId)) openRef.current(openRecordId);
		consumedRef.current?.();
	}, [openRecordId]);
}

export function useDetailLabel(label: string | null, onDetailChange?: (l: string | null) => void) {
	useEffect(() => {
		onDetailChange?.(label);
		return () => onDetailChange?.(null);
	}, [label, onDetailChange]);
}
