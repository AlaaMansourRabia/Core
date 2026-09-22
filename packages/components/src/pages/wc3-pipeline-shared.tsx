import type {ReactElement} from "react";

import {cn} from "@core/core-utils";

import {Badge} from "../badge";
import {
	WC3_NODE_KINDS,
	type Wc3NodeKind,
	type Wc3NodeKindCategory,
	type Wc3Pipeline,
	type Wc3PipelineNode,
	type Wc3PipelineRun,
} from "./wc3-lineage-data";
import {LineageGlyph, type Wc3LineageNavTarget, type Wc3FsLinkProps} from "./wc3-lineage-shared";
import {WC3_INSTANCE_COUNTS, getObjectType, instanceCount} from "./wc3-ontology-data";

// The one module the four Pipelines surfaces share — the list/card catalogue, the editable canvas
// and the two side tabs (Palette, Runs). Same rule as wc3-lineage-shared.tsx and
// wc3-product-shared.tsx: it imports nothing from them, so there is no cycle and no helper has to be
// pasted four times.
//
// It owns three things that MUST NOT be restated anywhere else:
//   · every string a user reads when a wire is refused (checkWire),
//   · every row-count constant and the whole row-count model (§ row-count engine),
//   · every mutation — each one is pure, pipeline in → NEW pipeline out, never an in-place write.
//
// What is deliberately NOT here, because it has exactly one consumer: the New-pipeline dialog and
// the list's column defs (list view), the React Flow node/edge components and the run-sweep interval
// (detail), the runs table columns and the palette grid (side views). Keeping single-consumer code
// out is what keeps this module small enough to freeze while three agents build against it.

// ─── Props ───────────────────────────────────────────────────────────────────

export type Wc3PipelineViewProps = {
	/** The LIVE pipeline array, owned by the workspace shell. Never read WC3_PIPELINES in a surface. */
	pipelines: Wc3Pipeline[];
	/** Commit a whole new array. Every mutation goes through this. */
	onPipelinesChange: (next: Wc3Pipeline[]) => void;
	/** Reports the drill-in segment for the shell's breadcrumb. */
	onDetailChange?: (label: string | null) => void;
	/** Cross-perspective navigation. Carries a record id when the arrival names one — see `openRecordId`. */
	onNavigate?: (target: Wc3LineageNavTarget) => void;
} & Wc3FsLinkProps;

// Unlike Wc3ProductViewProps the first two props are REQUIRED and there is no `= {}` default: the
// frozen WC3_PIPELINES fixture cannot be the fallback source of truth for an editable perspective.

// ─── Types ───────────────────────────────────────────────────────────────────

/** The catalogue's table⇄card toggle. One DataTable is mounted either way. */
export type Wc3PipelineViewMode = "table" | "cards";

/** The four port types in the prototype's palette. Wiring is plain equality — there is no subtyping. */
export type Wc3PortType = "Geometry" | "Table" | "Objects" | "Stream";

/** The result of checking one proposed wire. `reason` is rendered verbatim; no surface rewords it. */
export type Wc3WireCheck = {ok: true} | {ok: false; reason: string};

/** What a node emits: the column names of its shape, plus how many rows it produced. */
export type Wc3NodeOutput = {cols: string[]; rows: number};

/** What the New-pipeline dialog hands back. The record is built by {@link createPipeline}. */
export type Wc3PipelineDraft = {name: string; desc: string; icon: string};

/** Everything the list, the canvas header and the palette derive from one pipeline record. */
export type Wc3PipelineFacts = {
	nodeCount: number;
	wireCount: number;
	runCount: number;
	sourceCount: number;
	sourceLabels: string[];
	/** Kind ids, for the list's "Source kind" facet. */
	sourceKinds: string[];
	syncTargets: {nodeId: string; nodeLabel: string; otId: string; displayName: string}[];
	topicSinks: {nodeId: string; topic: string}[];
	/** Distinct port types the graph carries, in {@link WC3_PORT_TYPES} legend order. */
	portTypes: Wc3PortType[];
	/** Node ids with in-degree 0 — more than one means more than one source chain. */
	rootIds: string[];
	lastRun: Wc3PipelineRun | undefined;
	/** Structural HINTS, never errors. `[]` means healthy. */
	healthNotes: string[];
};

/** The transient builder state. UI-only: never committed, never persisted, never undoable. */
export type Wc3PipelineEditState = {
	/** Selected node id. */
	sel: string | null;
	/** `"<nodeId>:<portIndex>"` armed output, or null. */
	wireFrom: string | null;
	/** Last refusal message, shown as a warn banner. */
	wireErr: string | null;
	/** Run sweep. `pipeId` is implicit — the detail is keyed by pipeline. */
	anim: {order: string[]; step: number} | null;
};

export const WC3_PIPELINE_EDIT_INITIAL: Wc3PipelineEditState = {sel: null, wireFrom: null, wireErr: null, anim: null};

// ─── Constants ───────────────────────────────────────────────────────────────

/** Legend order, and the prototype's own order. */
export const WC3_PORT_TYPES: Wc3PortType[] = ["Geometry", "Table", "Objects", "Stream"];

/**
 * Port identity colours, verbatim from the prototype's PORT_COLORS.
 *
 * Hex is legal here and only here. These are FIXTURE IDENTITY colours, the same category as
 * WC3_ICON_COLORS (wc3-ontology-data.ts:8638) which OntologyGlyph applies as an inline
 * `style={{color}}` (wc3-ontology-glyphs.tsx:78) — three of these four literally appear in that
 * array. They are applied INLINE, never as a Tailwind class. The "always var(--wwc-color-*), never
 * hex" rule from wc3-lineage-data-view.tsx:380-391 governs CHROME (edge stroke, node border,
 * background) and still holds everywhere in this perspective.
 */
export const WC3_PORT_COLORS: Record<string, string> = {
	Geometry: "#9333ea",
	Table: "#0d9488",
	Objects: "#3b82f6",
	Stream: "#d97706",
};

/** Palette order — the order the prototype's sidebar groups its kinds in. */
export const WC3_NODE_CATEGORIES: Wc3NodeKindCategory[] = ["Sources", "BHoM", "Transforms", "Sinks"];

/** The "insert an adapter" hint per expected input type. Missing key → "a Geometry source". */
export const WC3_WIRE_SUGGESTION: Record<string, string> = {
	Objects: "Revit→BHoM adapter or a mapper",
	Table: "QTO takeoff",
	Stream: "Zone geofencer",
};

/** The New-pipeline icon picker. Every name resolves through LineageGlyph. */
export const WC3_PIPELINE_ICONS: string[] = [
	"cube",
	"calendar",
	"signal",
	"database",
	"pipeline",
	"layers",
	"globe",
	"folder",
];

/**
 * Seeded params per kind.
 *
 * DOCUMENTED DIVERGENCE: the prototype gives a palette-added node `params:{}` for every kind but
 * `sink_sync`, so a freshly dropped Clash filter shows only a Label field and no parameters at all.
 * Seeding them changes what a new node's inspector shows versus the prototype — deliberately, and
 * stated here rather than discovered later as "the port added fields".
 */
export const WC3_DEFAULT_NODE_PARAMS: Record<string, Record<string, string>> = {
	src_ifc: {source: "new-drop.ifc"},
	src_xer: {source: "export.xer"},
	src_hr: {source: "roster.csv"},
	src_wear: {gateway: "WC-G2 mesh"},
	src_drone: {source: "capture.e57"},
	bhom_revit: {adapter: "BHoM.Revit 6.3"},
	bhom_map: {profile: "wc3-core"},
	tx_uniclass: {table: "Ss"},
	tx_clash: {},
	tx_qto: {unit: "m³"},
	tx_geofence: {radius: "per-zone"},
	tx_rostermap: {dedupe: "badge_id"},
	tx_actmap: {calendar: "6d"},
	sink_sync: {targetOt: "ot_element"},
	sink_topic: {topic: "new_topic"},
};

/** The prototype's two literal equipment rows, EQ-501 / EQ-502. */
export const WC3_EQUIPMENT_ROWS = 2;

/** Workers carrying a `current_zone_id`. NOT derivable from the counts fixture — measured live. */
export const WC3_PRESENCE_WORKERS = 118;

/** Prototype: `6 + S.telemetry.tick`. The port has no telemetry tick, so the 6 stands alone. */
export const WC3_TOPIC_EVENTS = 6;

/** Distinct `element_kind` groups the QTO takeoff rolls up to, per drop rev. */
export const WC3_QTO_GROUPS: Record<number, number> = {1: 14, 2: 15};

/** The two elements the rev-2 IFC drop adds — named in the run summary. */
export const WC3_DROP_REV2_PKS = ["EL-RF-AHU1", "EL-RF-AHU2"];

export const WC3_DROP_REV2_SUMMARY =
	"Received IFC drop rev 2 (falcon-heights-str_r2.ifc) — 2 new rooftop plant elements await the next run";

// ─── Identity / presentation ─────────────────────────────────────────────────

export const nodeKind = (kindId: string): Wc3NodeKind | undefined => WC3_NODE_KINDS[kindId];

export const nodeKindLabel = (kindId: string): string => WC3_NODE_KINDS[kindId]?.label ?? kindId;

/** Inline colour for a port type. An unknown type falls back to the theme's border token. */
export const portColor = (type: string): string => WC3_PORT_COLORS[type] ?? "var(--wwc-color-border)";

/** The fixture's wire encoding: `"<nodeId>:<portIndex>"`. */
export const portRef = (nodeId: string, index: number): string => `${nodeId}:${index}`;

/**
 * Splits on the LAST colon, not the first: node ids are free-form and `uid()` could in principle
 * produce one containing a colon. An unparseable ref yields portIndex 0, which then fails the
 * port-type guard rather than crashing.
 */
export function parsePortRef(ref: string): {nodeId: string; portIndex: number} {
	const cut = ref.lastIndexOf(":");
	if (cut < 0) return {nodeId: ref, portIndex: 0};
	const index = Number.parseInt(ref.slice(cut + 1), 10);
	return {nodeId: ref.slice(0, cut), portIndex: Number.isFinite(index) ? index : 0};
}

/** An 8px port dot in the port's identity colour. The only type affordance the canvas has. */
export function PortDot({type, size = 8}: {type: string; size?: number}): ReactElement {
	return (
		<span
			className="wwc:inline-block wwc:shrink-0 wwc:rounded-full"
			style={{width: size, height: size, background: portColor(type)}}
			title={type}
		/>
	);
}

/**
 * The port-type key. ONE component, used by the Palette tab AND the detail canvas footer, so the
 * legend can never drift between the two.
 */
export function PortLegend({className}: {className?: string}): ReactElement {
	return (
		<div className={cn("wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-3 wwc:gap-y-1 wwc:text-xs", className)}>
			{WC3_PORT_TYPES.map((type) => (
				<span key={type} className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-muted-foreground">
					<PortDot type={type} />
					{type}
				</span>
			))}
		</div>
	);
}

/**
 * A node kind's glyph. MUST route through LineageGlyph — process/drone/download/upload/tag/impact/
 * ruler/map are absent from the ontology GLYPHS map and would silently fall back to a generic Box.
 */
export function NodeKindGlyph({kindId, className}: {kindId: string; className?: string}): ReactElement {
	return <LineageGlyph name={WC3_NODE_KINDS[kindId]?.icon ?? "box"} className={className} />;
}

/** Soft tints so a kind's category reads the same on the palette, the list and the inspector. */
const CATEGORY_VARIANT: Record<string, "infoSoft" | "warningSoft" | "neutralSoft" | "successSoft"> = {
	Sources: "infoSoft",
	BHoM: "warningSoft",
	Transforms: "neutralSoft",
	Sinks: "successSoft",
};

/** The kind's palette category as a badge. An unknown kind id degrades to a neutral "unknown kind". */
export function NodeKindBadge({kindId}: {kindId: string}): ReactElement {
	const kind = WC3_NODE_KINDS[kindId];
	if (!kind) return <Badge variant="neutralSoft">unknown kind</Badge>;
	return <Badge variant={CATEGORY_VARIANT[kind.cat] ?? "neutralSoft"}>{kind.cat}</Badge>;
}

/** A pipeline's own glyph — `pipeline.icon`, through LineageGlyph like every other fixture icon. */
export function PipelineGlyph({pipeline, className}: {pipeline: Wc3Pipeline; className?: string}): ReactElement {
	return <LineageGlyph name={pipeline.icon} className={className} />;
}

// ─── Derivation ──────────────────────────────────────────────────────────────
//
// Every function below is pure and takes a LIVE Wc3Pipeline. None of them reads WC3_PIPELINES:
// a fixture-bound lookup goes stale the instant the session mutates the array.

/** The node id half of a wire endpoint. */
const endNode = (ref: string) => parsePortRef(ref).nodeId;

/**
 * Everything the three surfaces derive from one pipeline.
 *
 * `healthNotes` implements exactly two rules, both structural, both already present in the fixture,
 * and both HINTS rather than errors:
 *   · a node whose kind has outputs that nothing consumes (pipe_bim's QTO takeoff emits Table and
 *     nothing in the whole 15-kind palette accepts Table),
 *   · more than one root, i.e. more than one disconnected source chain (pipe_tel).
 * No other validation exists in the prototype and none may be added here: nothing stops a
 * disconnected node, a source with a wired input, or a chain that never reaches a sink.
 */
export function pipelineFacts(p: Wc3Pipeline): Wc3PipelineFacts {
	const wiredFrom = new Set(p.wires.map((w) => endNode(w.from)));
	const wiredTo = new Set(p.wires.map((w) => endNode(w.to)));

	const sources = p.nodes.filter((n) => WC3_NODE_KINDS[n.kind]?.cat === "Sources");
	const syncTargets = p.nodes
		.filter((n) => n.kind === "sink_sync")
		.map((n) => {
			const otId = n.params.targetOt ?? "";
			return {
				nodeId: n.id,
				nodeLabel: n.label,
				otId,
				// "missing" is the same word the canvas node body uses for a deleted target.
				displayName: getObjectType(otId)?.displayName ?? "missing",
			};
		});
	const topicSinks = p.nodes
		.filter((n) => n.kind === "sink_topic")
		.map((n) => ({nodeId: n.id, topic: n.params.topic || "topic"}));

	const carried = new Set<string>();
	for (const n of p.nodes) {
		const kind = WC3_NODE_KINDS[n.kind];
		if (!kind) continue;
		for (const t of kind.inPorts) carried.add(t);
		for (const t of kind.outPorts) carried.add(t);
	}

	const rootIds = p.nodes.filter((n) => !wiredTo.has(n.id)).map((n) => n.id);

	const healthNotes: string[] = [];
	for (const n of p.nodes) {
		const kind = WC3_NODE_KINDS[n.kind];
		if (!kind || kind.outPorts.length === 0) continue;
		if (wiredFrom.has(n.id)) continue;
		healthNotes.push(`${n.label} output is unconsumed — no node in this pipeline accepts ${kind.outPorts.join("/")}.`);
	}
	if (rootIds.length > 1) {
		healthNotes.push(`${rootIds.length} disconnected source chains — legal, and they run interleaved.`);
	}

	return {
		nodeCount: p.nodes.length,
		wireCount: p.wires.length,
		runCount: p.runs.length,
		sourceCount: sources.length,
		sourceLabels: sources.map((n) => n.label),
		sourceKinds: sources.map((n) => n.kind),
		syncTargets,
		topicSinks,
		portTypes: WC3_PORT_TYPES.filter((t) => carried.has(t)),
		rootIds,
		lastRun: p.runs.length ? p.runs[p.runs.length - 1] : undefined,
		healthNotes,
	};
}

/**
 * The blob the list's "pipeline" column matches on. One column filter, so it behaves identically in
 * table mode and card mode — the toggle only changes what DataTable renders, never what it filters.
 */
export function pipelineSearchText(p: Wc3Pipeline): string {
	return [
		p.name,
		p.id,
		p.desc,
		p.nodes.map((n) => n.label).join(" "),
		p.nodes.map((n) => nodeKindLabel(n.kind)).join(" "),
		pipelineFacts(p)
			.syncTargets.map((s) => s.displayName)
			.join(" "),
	].join(" ");
}

/**
 * Kahn/BFS, seeded with every in-degree-0 node in node order — so pipe_tel's TWO disconnected
 * source chains interleave rather than one running after the other, exactly as the prototype does.
 * A wire naming a node that no longer exists is skipped rather than throwing.
 */
export function topoOrder(p: Wc3Pipeline): string[] {
	const indeg = new Map<string, number>();
	const adj = new Map<string, string[]>();
	for (const n of p.nodes) {
		indeg.set(n.id, 0);
		adj.set(n.id, []);
	}
	for (const w of p.wires) {
		const from = endNode(w.from);
		const to = endNode(w.to);
		const out = adj.get(from);
		if (!out || !indeg.has(to)) continue;
		out.push(to);
		indeg.set(to, (indeg.get(to) ?? 0) + 1);
	}
	const queue = p.nodes.filter((n) => !indeg.get(n.id)).map((n) => n.id);
	const order: string[] = [];
	while (queue.length) {
		const id = queue.shift();
		if (id === undefined) break;
		order.push(id);
		for (const next of adj.get(id) ?? []) {
			const left = (indeg.get(next) ?? 0) - 1;
			indeg.set(next, left);
			if (left === 0) queue.push(next);
		}
	}
	return order;
}

/** Does a path `toNodeId → … → fromNodeId` already exist? BFS forward from the proposed target. */
export function wouldCycle(p: Wc3Pipeline, fromNodeId: string, toNodeId: string): boolean {
	const adj = new Map<string, string[]>();
	for (const n of p.nodes) adj.set(n.id, []);
	for (const w of p.wires) adj.get(endNode(w.from))?.push(endNode(w.to));
	const seen = new Set<string>();
	const queue = [toNodeId];
	while (queue.length) {
		const id = queue.shift();
		if (id === undefined) break;
		if (id === fromNodeId) return true;
		if (seen.has(id)) continue;
		seen.add(id);
		for (const next of adj.get(id) ?? []) queue.push(next);
	}
	return false;
}

/**
 * THE four wiring guards, in this exact order and with these exact strings. This is the single
 * source of truth for every refusal a user can read — no surface may reword one, and the Palette
 * tab's permanent rules panel must quote these rather than paraphrase them.
 *
 * The mismatch sentence keeps the prototype's ungrammatical "a Objects" verbatim. That decision is
 * made once, here.
 *
 * Asymmetry to preserve: an input takes exactly ONE wire, an output fans out unbounded — pipe_bim's
 * `n_map:0` feeds three different nodes.
 */
export function checkWire(p: Wc3Pipeline, from: string, to: string): Wc3WireCheck {
	const src = parsePortRef(from);
	const dst = parsePortRef(to);

	// 1 — a node cannot feed itself. Checked on ids alone, before any lookup.
	if (src.nodeId === dst.nodeId) return {ok: false, reason: "A node cannot feed itself."};

	const fromNode = p.nodes.find((n) => n.id === src.nodeId);
	const toNode = p.nodes.find((n) => n.id === dst.nodeId);
	const outType = fromNode ? WC3_NODE_KINDS[fromNode.kind]?.outPorts[src.portIndex] : undefined;
	const inType = toNode ? WC3_NODE_KINDS[toNode.kind]?.inPorts[dst.portIndex] : undefined;
	// Not a fifth rule: the UI can only offer handles that exist, so this is the type-safety floor
	// for a ref that names a node or a port that has since been deleted.
	if (!fromNode || !toNode || outType === undefined || inType === undefined) {
		return {ok: false, reason: "That port no longer exists — the node or its kind is gone."};
	}

	// 2 — plain string equality. There is no subtyping and no coercion.
	if (outType !== inType) {
		const suggestion = WC3_WIRE_SUGGESTION[inType] ?? "a Geometry source";
		return {
			ok: false,
			reason: `Port type mismatch: ${outType} → ${inType}. “${toNode.label}” expects a ${inType} input — insert an adapter/transform node (e.g. ${suggestion}).`,
		};
	}

	// 3 — one wire per input.
	if (p.wires.some((w) => w.to === to)) {
		return {ok: false, reason: "That input is already wired — delete the existing wire first (click it)."};
	}

	// 4 — pipelines stay acyclic.
	if (wouldCycle(p, src.nodeId, dst.nodeId)) {
		return {ok: false, reason: "That wire would create a cycle — pipelines must stay acyclic."};
	}

	return {ok: true};
}

/**
 * Which pipelines use each node kind — the Palette's "Used in" column. Reads the LIVE array, so a
 * pipeline created this session counts.
 *
 * EVERY kind id gets an entry, empty array included, so a caller never has to `?? []`: 13 of the 15
 * are used by the seeded fixture, `src_drone` and `tx_clash` by nothing.
 */
export function kindsUsedIn(pipelines: Wc3Pipeline[]): Map<string, Wc3Pipeline[]> {
	const out = new Map<string, Wc3Pipeline[]>();
	for (const kindId of Object.keys(WC3_NODE_KINDS)) out.set(kindId, []);
	for (const p of pipelines) {
		const seen = new Set<string>();
		for (const n of p.nodes) {
			if (seen.has(n.kind)) continue;
			seen.add(n.kind);
			const list = out.get(n.kind);
			if (list) list.push(p);
			else out.set(n.kind, [p]);
		}
	}
	return out;
}

/** Kind ids whose ports could legally sit either side of this kind — the Palette's "can connect to". */
export function kindConnectivity(kindId: string): {upstream: string[]; downstream: string[]} {
	const kind = WC3_NODE_KINDS[kindId];
	if (!kind) return {upstream: [], downstream: []};
	const ids = Object.keys(WC3_NODE_KINDS);
	return {
		upstream: ids.filter((id) => id !== kindId && WC3_NODE_KINDS[id]?.outPorts.some((t) => kind.inPorts.includes(t))),
		downstream: ids.filter((id) => id !== kindId && WC3_NODE_KINDS[id]?.inPorts.some((t) => kind.outPorts.includes(t))),
	};
}

// ─── The row-count engine ────────────────────────────────────────────────────
//
// HARD FACT, verified by grepping all of packages/components/src: there is NO instance-row fixture
// in the port. wc3-ontology-data.ts ships WC3_INSTANCE_COUNTS (counts only) and
// WC3_INSTANCE_LINK_SAMPLES; there is no elementDefs(), no instOf(), no row objects anywhere. The
// prototype's PipeNodeInspector "Preview (first 5 of N)" table therefore CANNOT be ported, and rows
// must NOT be synthesised to fill the gap.
//
// The UI surface that replaces it is "Output schema" (the cols as Mono chips) plus
// "<N> rows at drop rev <R>" — the same honest degradation as wc3-action-type-run-dialog.tsx:65-67
// ("No instance rows exist in the fixture — degrade to text rather than fake a picker").

/** Element rows at a drop rev: the seeded 420, plus the two rooftop plant elements rev 2 adds. */
const elementRows = (rev: number): number => (WC3_INSTANCE_COUNTS.ot_element ?? 0) + (rev >= 2 ? 2 : 0);

/** The six real output shapes, from the prototype's `pipeNodeData`. */
export function kindOutputCols(kindId: string): string[] {
	switch (kindId) {
		case "src_ifc":
		case "bhom_revit":
		case "bhom_map":
		case "tx_uniclass":
		case "tx_clash":
			return ["id", "kind", "storey", "uniclass"];
		case "tx_qto":
			return ["kind", "qty_m3"];
		case "src_xer":
		case "tx_actmap":
			return ["activity_id", "name", "wbs"];
		case "src_hr":
		case "tx_rostermap":
			return ["worker_id", "name", "trade"];
		case "src_wear":
		case "tx_geofence":
			return ["worker_id", "zone", "seen_at"];
		case "sink_topic":
			return ["event"];
		case "sink_sync":
			return ["sink"];
		// src_drone is the one kind that produces nothing at all. The Palette says so in words.
		default:
			return [];
	}
}

/**
 * The schema and the row count a node produces — deterministic, and reproducing every number
 * observed live in the prototype at drop rev 1 and rev 2:
 *
 *   src_ifc | bhom_revit | bhom_map  → elements + 2 equipment rows  422 / 424
 *   tx_uniclass                      → elements                     420 / 422
 *   tx_clash                         → elements − 1                 419 / 421
 *   tx_qto                           → element_kind groups            14 / 15
 *   src_xer | tx_actmap              → activities                    85
 *   src_hr  | tx_rostermap           → workers                      145
 *   src_wear| tx_geofence            → workers with a current zone  118
 *   sink_topic                       → 6 events
 *   sink_sync                        → syncRowCount()
 *   src_drone                        → 0
 *
 * DELIBERATE FIX: the prototype badges `sink_topic` as "1 rows" (it returns one summary row) while
 * its own summary line says 6 events. One number is used by both here.
 */
export function nodeOutput(p: Wc3Pipeline, node: Wc3PipelineNode): Wc3NodeOutput {
	const rev = p.dropRev || 1;
	const cols = kindOutputCols(node.kind);
	switch (node.kind) {
		case "src_ifc":
		case "bhom_revit":
		case "bhom_map":
			return {cols, rows: elementRows(rev) + WC3_EQUIPMENT_ROWS};
		case "tx_uniclass":
			return {cols, rows: elementRows(rev)};
		case "tx_clash":
			return {cols, rows: Math.max(0, elementRows(rev) - 1)};
		case "tx_qto":
			return {cols, rows: WC3_QTO_GROUPS[rev] ?? 14};
		case "src_xer":
		case "tx_actmap":
			return {cols, rows: instanceCount("ot_activity")};
		case "src_hr":
		case "tx_rostermap":
			return {cols, rows: instanceCount("ot_worker")};
		case "src_wear":
		case "tx_geofence":
			return {cols, rows: WC3_PRESENCE_WORKERS};
		case "sink_topic":
			return {cols, rows: WC3_TOPIC_EVENTS};
		case "sink_sync":
			return {cols, rows: syncRowCount(p, node)};
		default:
			return {cols, rows: 0};
	}
}

/**
 * Rows a sync sink writes into its target object type.
 *
 * ot_equipment is 2 — the prototype's two literal rows EQ-501 / EQ-502 — NOT
 * WC3_INSTANCE_COUNTS.ot_equipment, which is 18 and counts the whole seeded fleet.
 * A missing or deleted target syncs nothing.
 */
export function syncRowCount(p: Wc3Pipeline, node: Wc3PipelineNode): number {
	const otId = node.params.targetOt ?? "";
	if (!otId || !getObjectType(otId)) return 0;
	if (otId === "ot_element") return elementRows(p.dropRev || 1);
	if (otId === "ot_equipment") return WC3_EQUIPMENT_ROWS;
	return instanceCount(otId);
}

// ─── Mutations ───────────────────────────────────────────────────────────────
//
// Pure, pipeline in → NEW pipeline out. No in-place writes, ever: WC3_PIPELINES is a frozen module
// fixture that the Lineage data view and the Ontology Impact view still read directly, and one
// accidental `pipe.runs.push` would corrupt it for the whole app.

/** Deep enough that nodes, wires, runs and every params/stats record are freshly created. */
export function clonePipeline(p: Wc3Pipeline): Wc3Pipeline {
	return {
		...p,
		nodes: p.nodes.map((n) => ({...n, params: {...n.params}})),
		wires: p.wires.map((w) => ({...w})),
		runs: p.runs.map((r) => ({...r, stats: {...r.stats}, order: [...r.order], summary: [...r.summary]})),
	};
}

/** Commit one edited pipeline back into the shell's live array. */
export function replacePipeline(list: Wc3Pipeline[], next: Wc3Pipeline): Wc3Pipeline[] {
	return list.map((p) => (p.id === next.id ? next : p));
}

export function uid(prefix: string): string {
	return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Wall-clock TIME only, e.g. "11:48:29 AM" — the shape Wc3PipelineRun.at carries. */
export function nowStr(): string {
	return new Date().toLocaleTimeString();
}

/** A pipeline from scratch: no nodes, no wires, no runs, drop rev 1. */
export function createPipeline(draft: Wc3PipelineDraft): Wc3Pipeline {
	return {
		id: uid("pipe"),
		name: draft.name,
		icon: draft.icon,
		desc: draft.desc,
		dropRev: 1,
		nodes: [],
		wires: [],
		runs: [],
	};
}

/**
 * Adds a node of `kindId`, placing it in free space below/right of the existing graph — the
 * prototype's auto-placement, ported expression for expression including its empty-pipeline branch.
 *
 * On an EMPTY pipeline (a state the prototype never renders, because PagePipelines always opens on
 * a seeded pipeline) `rowMaxX` falls back to −160, so the first node lands at x 40, y 40. fitView
 * frames a single node identically wherever it sits.
 */
export function addNode(p: Wc3Pipeline, kindId: string): {pipeline: Wc3Pipeline; nodeId: string} {
	const maxY = Math.max(0, ...p.nodes.map((n) => n.y));
	const rowNodes = p.nodes.filter((n) => n.y >= maxY - 20);
	const rowMaxX = rowNodes.length ? Math.max(...rowNodes.map((n) => n.x)) : -160;
	const wraps = rowMaxX + 200 > 900;
	const x = wraps ? 40 : rowMaxX + 200;
	const rowY = wraps ? maxY + 80 : p.nodes.length ? maxY : 40;
	const y = x === 40 && p.nodes.length ? maxY + 80 : rowY;

	const node: Wc3PipelineNode = {
		id: uid("pn"),
		kind: kindId,
		label: nodeKindLabel(kindId),
		x,
		y,
		params: {...WC3_DEFAULT_NODE_PARAMS[kindId]},
	};
	// Every mutation below follows this shape: clone first, then edit the CLONE's own arrays. The
	// input pipeline is never touched, so the caller can keep rendering the old one.
	const next = clonePipeline(p);
	next.nodes = [...next.nodes, node];
	return {pipeline: next, nodeId: node.id};
}

/** Renames a node or replaces its params. A `params` patch REPLACES the record, it does not merge. */
export function updateNode(
	p: Wc3Pipeline,
	nodeId: string,
	patch: Partial<Pick<Wc3PipelineNode, "label" | "params">>,
): Wc3Pipeline {
	const next = clonePipeline(p);
	next.nodes = next.nodes.map((n) =>
		n.id === nodeId ? {...n, label: patch.label ?? n.label, params: patch.params ? {...patch.params} : n.params} : n,
	);
	return next;
}

/**
 * Commits a dragged position. React Flow owns the position DURING a drag and hands back floats;
 * they are rounded so the fixture's integer pixel grid (x 40-880, y 60-270) stays readable.
 */
export function moveNode(p: Wc3Pipeline, nodeId: string, x: number, y: number): Wc3Pipeline {
	const next = clonePipeline(p);
	next.nodes = next.nodes.map((n) => (n.id === nodeId ? {...n, x: Math.round(x), y: Math.round(y)} : n));
	return next;
}

/** Deletes a node and CASCADES: every wire touching it goes with it. */
export function deleteNode(p: Wc3Pipeline, nodeId: string): Wc3Pipeline {
	const next = clonePipeline(p);
	next.nodes = next.nodes.filter((n) => n.id !== nodeId);
	next.wires = next.wires.filter((w) => endNode(w.from) !== nodeId && endNode(w.to) !== nodeId);
	return next;
}

/** Adds a wire. The caller must have passed {@link checkWire} first — this does not re-check. */
export function addWire(p: Wc3Pipeline, from: string, to: string): Wc3Pipeline {
	const next = clonePipeline(p);
	// uid, not "w<N>": wire ids are only ever unique WITHIN a pipeline (all three fixtures use
	// w1, w2, …), so anything keying wires across pipelines must namespace `${pipelineId}:${wireId}`.
	next.wires = [...next.wires, {id: uid("pw"), from, to}];
	return next;
}

export function deleteWire(p: Wc3Pipeline, wireId: string): Wc3Pipeline {
	const next = clonePipeline(p);
	next.wires = next.wires.filter((w) => w.id !== wireId);
	return next;
}

export function updatePipelineMeta(
	p: Wc3Pipeline,
	patch: Partial<Pick<Wc3Pipeline, "name" | "desc" | "icon">>,
): Wc3Pipeline {
	return {...clonePipeline(p), ...patch};
}

/** The demo's second IFC drop. Gated to pipe_bim BY THE CALLER, through {@link canReceiveDrop}. */
export function receiveDrop(p: Wc3Pipeline): Wc3Pipeline {
	const next = clonePipeline(p);
	next.dropRev = 2;
	return next;
}

export const canReceiveDrop = (p: Wc3Pipeline): boolean => p.id === "pipe_bim" && p.dropRev < 2;

/** Rows a sync sink would write at a hypothetical drop rev — the baseline half of the added/updated model. */
const syncRowsAtRev = (p: Wc3Pipeline, node: Wc3PipelineNode, rev: number) => syncRowCount({...p, dropRev: rev}, node);

/**
 * Executes the pipeline in topological order and records what each node produced.
 *
 * RUNNING A PIPELINE DOES NOT MUTATE THE ONTOLOGY. The prototype's runPipeline calls
 * upsertInstances, which genuinely writes into its instance store and moves the Twin count
 * 420 → 422. The port has no instance store — wc3-ontology-data.ts ships counts and no rows — so
 * this produces a run record and nothing else. `added`/`updated` are MODELLED, not measured:
 *
 *   prevRev = the highest rev among prior runs that included this node (1 when there are none)
 *   added   = max(0, rows at the run's rev − rows at prevRev)
 *   updated = always 0
 *
 * which reproduces the demo beat exactly: run at rev 1 → "0 added, 0 updated"; receive the drop;
 * run at rev 2 → "Element sync: 2 added, 0 updated (EL-RF-AHU1, EL-RF-AHU2)"; run again → 0 added.
 *
 * COPY CONSEQUENCE: no surface may promise instances that "immediately appear in the Twin and the
 * Ontology tables". The change is visible only inside the Pipelines perspective.
 */
export function runPipeline(p: Wc3Pipeline): {pipeline: Wc3Pipeline; run: Wc3PipelineRun} {
	const rev = p.dropRev || 1;
	const order = topoOrder(p);
	const stats: Record<string, number> = {};
	const summary: string[] = [];

	for (const nodeId of order) {
		const node = p.nodes.find((n) => n.id === nodeId);
		if (!node) continue;
		stats[nodeId] = nodeOutput(p, node).rows;

		if (node.kind === "sink_sync") {
			const otId = node.params.targetOt ?? "";
			if (!otId || !getObjectType(otId)) {
				// The prototype's leading space on this line is dropped.
				summary.push(`${node.label}: target object type deleted — skipped`);
				continue;
			}
			const prevRev = p.runs.reduce((best, r) => (r.order.includes(nodeId) ? Math.max(best, r.rev) : best), 1);
			const added = Math.max(0, syncRowsAtRev(p, node, rev) - syncRowsAtRev(p, node, prevRev));
			const pks = otId === "ot_element" ? WC3_DROP_REV2_PKS.slice(0, added) : [];
			summary.push(`${node.label}: ${added} added, 0 updated${pks.length ? ` (${pks.join(", ")})` : ""}`);
		}

		if (node.kind === "sink_topic") {
			summary.push(`${node.label}: ${WC3_TOPIC_EVENTS} events emitted (simulated)`);
		}
	}

	const run: Wc3PipelineRun = {id: uid("prun"), at: nowStr(), rev, stats, order, summary};
	const next = clonePipeline(p);
	// The prototype's capped ring of 12.
	next.runs = [...next.runs, run].slice(-12);
	return {pipeline: next, run};
}
