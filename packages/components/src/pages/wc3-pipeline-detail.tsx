import type {Connection, Edge, FinalConnectionState, Node, NodeProps} from "@xyflow/react";

import {cn} from "@corensystem/core-utils";
import {Handle, Position, useEdgesState, useNodesState} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {ArrowLeft, ArrowRight, CheckCircle2, Download, Play, Trash2, TriangleAlert, XCircle} from "lucide-react";
import {useCallback, useEffect, useMemo, useState} from "react";
// React Flow ships its own positioning styles; without these the canvas does not lay out at all.

import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {Combobox} from "../combobox";
import {ConfirmDialog} from "../confirm-dialog";
import {Empty} from "../empty";
import {GraphCanvas} from "../graph-canvas";
import {Input} from "../input";
import {Label} from "../label";
import {Textarea} from "../textarea";
import {HoverTooltip} from "../tooltip";
import {WC3_NODE_KINDS, type Wc3NodeKind, type Wc3Pipeline, type Wc3PipelineNode} from "./wc3-lineage-data";
import {LineageGlyph, Mono, type Wc3LineageNavTarget} from "./wc3-lineage-shared";
import {WC3_OBJECT_TYPES, getObjectType} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";
import {
	NodeKindBadge,
	NodeKindGlyph,
	PipelineGlyph,
	PortDot,
	PortLegend,
	WC3_DROP_REV2_SUMMARY,
	WC3_NODE_CATEGORIES,
	WC3_PIPELINE_EDIT_INITIAL,
	WC3_PIPELINE_ICONS,
	addNode,
	addWire,
	canReceiveDrop,
	checkWire,
	deleteNode,
	deleteWire,
	moveNode,
	nodeKind,
	nodeOutput,
	parsePortRef,
	pipelineFacts,
	portColor,
	portRef,
	receiveDrop,
	runPipeline,
	updateNode,
	updatePipelineMeta,
	type Wc3PipelineEditState,
} from "./wc3-pipeline-shared";

// The pipeline builder — the Pipelines list's drill-in, and the ONLY surface in the perspective that
// mutates a pipeline's graph. Every edit routes through a pure helper in wc3-pipeline-shared.tsx and
// is committed with a single `onChange(next)`; nothing here writes a node, a wire or a run in place.
//
// NOT wrapped in Pane — Pane supplies px-6/pt-4 and this page supplies its own gutters, so wrapping
// applies them twice (wc3-product-catalogue-view.tsx:565-570, measured 48px against 24px). The list
// renders this unwrapped as a sibling of its dialog.
//
// TWO DOCUMENTED DIVERGENCES FROM THE PROTOTYPE, both deliberate:
//  1. The inspector has NO "Preview (first 5 of N)" table. There is no instance-row fixture in the
//     port — wc3-ontology-data.ts ships counts and nothing else — so the preview is replaced by an
//     "Output schema" block (the column names) plus the row count, the same honest degradation as
//     wc3-action-type-run-dialog.tsx:65-67. Rows are never synthesised.
//  2. Wiring is a React Flow drag from an output handle to an input handle, not the prototype's
//     click-output-then-click-input. The four guards are identical and their refusal strings come
//     verbatim from checkWire(); only the gesture changed. Dragging a node is likewise real here —
//     the prototype's `cursor:grab` was decorative and only its three nudge buttons moved a node.

type PipelineDetailProps = {
	pipeline: Wc3Pipeline;
	onChange: (next: Wc3Pipeline) => void;
	onBack: () => void;
	onNavigate?: (target: Wc3LineageNavTarget) => void;
};

/** What a node in a run sweep is doing on the current frame. */
type Wc3RunState = "idle" | "running" | "done";

type PipeFlowNodeData = {
	node: Wc3PipelineNode;
	kind: Wc3NodeKind | undefined;
	picked: boolean;
	/** Rows the LAST run recorded for this node, painted from frame one. Undefined before any run. */
	rows: number | undefined;
	runState: Wc3RunState;
	/** Only a sink_sync carries one: its target's display name, or "missing" when the type is gone. */
	syncTarget: string | null;
};

/**
 * The prototype's port geometry: y = 20 + index*18, with a single port nudged 8px down so it sits on
 * the body's centre line. Kept exactly, because it is what makes a two-port node's dots line up with
 * the label rather than the body edge.
 */
const portTop = (index: number, count: number) => 20 + index * 18 + (count === 1 ? 8 : 0);

/** 18 chars then an ellipsis — pipe_tel's "presence_events topic" renders as "presence_events to…". */
const shortLabel = (label: string) => (label.length > 18 ? `${label.slice(0, 18)}…` : label);

/**
 * A node on the canvas. Same visual language as the two read-only canvases (a plain div on Core
 * tokens, never React Flow chrome) with ONE deliberate difference: handles are VISIBLE and carry the
 * port's identity colour. Colour is the only type affordance a wiring UI has, so hiding the handles
 * the way wc3-graph-explorer-flow.tsx and wc3-lineage-data-view.tsx do would make typed ports
 * invisible. Every handle carries an explicit `id` — the "<nodeId>:<portIndex>" wire encoding only
 * round-trips if it does.
 */
function PipelineFlowNode({data}: NodeProps) {
	const {node, kind, picked, rows, runState, syncTarget} = data as unknown as PipeFlowNodeData;
	const inPorts = kind?.inPorts ?? [];
	const outPorts = kind?.outPorts ?? [];

	return (
		<div
			className={cn(
				"wwc:relative wwc:h-[56px] wwc:w-[170px] wwc:rounded-lg wwc:border wwc:bg-card wwc:px-2.5 wwc:py-1.5",
				picked ? "wwc:border-primary wwc:ring-1 wwc:ring-primary" : "wwc:border-border wwc:hover:border-primary/50",
				runState === "running" && "wwc:border-amber-500 wwc:ring-1 wwc:ring-amber-500",
				runState === "done" && "wwc:border-green-600",
			)}
		>
			{inPorts.map((type, index) => (
				<Handle
					key={`in-${type}-${index}`}
					id={String(index)}
					type="target"
					position={Position.Left}
					title={`in: ${type}`}
					style={{
						top: portTop(index, inPorts.length),
						width: 10,
						height: 10,
						background: portColor(type),
						border: "1.5px solid var(--wwc-color-card)",
					}}
				/>
			))}

			<div className="wwc:flex wwc:items-center wwc:gap-1.5">
				<NodeKindGlyph kindId={node.kind} className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
				<span className="wwc:truncate wwc:text-[11px] wwc:font-bold wwc:leading-tight">{shortLabel(node.label)}</span>
			</div>
			<div className="wwc:truncate wwc:text-[9px] wwc:leading-tight wwc:text-muted-foreground">
				{kind?.cat ?? "unknown kind"}
				{syncTarget ? ` → ${syncTarget}` : ""}
			</div>
			{/*
			 * Sourced from the LAST run's stats, never from the sweep's step: the prototype commits the
			 * whole run before the first animation frame, so every count is painted at once and the
			 * animation only sweeps a highlight across nodes that already show their number.
			 */}
			{rows !== undefined && (
				<div className="wwc:text-[9.5px] wwc:font-bold wwc:leading-tight wwc:text-green-600">{rows} rows</div>
			)}

			{outPorts.map((type, index) => (
				<Handle
					key={`out-${type}-${index}`}
					id={String(index)}
					type="source"
					position={Position.Right}
					title={`out: ${type}`}
					style={{
						top: portTop(index, outPorts.length),
						width: 10,
						height: 10,
						background: portColor(type),
						border: "1.5px solid var(--wwc-color-card)",
					}}
				/>
			))}
		</div>
	);
}

// Module-level, never an inline object: a new map identity on every render remounts every node.
const NODE_TYPES = {pipe: PipelineFlowNode};

/** One palette entry — a click adds the kind to the open pipeline, exactly as the prototype's rail. */
function PaletteItem({kindId, onAdd}: {kindId: string; onAdd: (kindId: string) => void}) {
	const kind = WC3_NODE_KINDS[kindId];
	if (!kind) return null;
	const ins = kind.inPorts.length ? kind.inPorts.join(", ") : "—";
	const outs = kind.outPorts.length ? kind.outPorts.join(", ") : "—";
	return (
		<button
			type="button"
			onClick={() => onAdd(kindId)}
			title={`in: ${ins} · out: ${outs}`}
			className="wwc:flex wwc:w-full wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:px-2 wwc:py-1 wwc:text-left wwc:text-xs wwc:hover:bg-accent wwc:hover:text-accent-foreground"
		>
			<NodeKindGlyph kindId={kindId} className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0" />
			<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate">{kind.label}</span>
			<span className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-0.5">
				{[...kind.inPorts, ...kind.outPorts].map((type, index) => (
					<PortDot key={`${type}-${index}`} type={type} />
				))}
			</span>
		</button>
	);
}

/**
 * The node inspector. Mounted with `key={node.id}` so its uncontrolled inputs and its label error
 * reset when the selection moves — the same reason the product detail keys on its record.
 */
function NodeInspector({
	pipeline,
	node,
	onChange,
	onDelete,
}: {
	pipeline: Wc3Pipeline;
	node: Wc3PipelineNode;
	onChange: (next: Wc3Pipeline) => void;
	onDelete: () => void;
}) {
	const [labelErr, setLabelErr] = useState(false);
	const kind = nodeKind(node.kind);
	const output = nodeOutput(pipeline, node);
	const paramKeys = Object.keys(node.params);

	const commitLabel = (value: string) => {
		// Empty is refused inline and NOT committed — the prototype's own rule for this field.
		if (!value.trim()) {
			setLabelErr(true);
			return;
		}
		setLabelErr(false);
		onChange(updateNode(pipeline, node.id, {label: value.trim()}));
	};

	const commitParam = (key: string, value: string) => {
		onChange(updateNode(pipeline, node.id, {params: {...node.params, [key]: value}}));
	};

	return (
		<div className="wwc:space-y-3">
			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
				<NodeKindGlyph kindId={node.kind} className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
				<span className="wwc:text-sm wwc:font-semibold">{node.label}</span>
				<NodeKindBadge kindId={node.kind} />
			</div>
			<div className="wwc:text-[10.5px] wwc:text-muted-foreground">
				in: {kind?.inPorts.length ? kind.inPorts.join(", ") : "—"} · out:{" "}
				{kind?.outPorts.length ? kind.outPorts.join(", ") : "—"}
			</div>

			<div className="wwc:space-y-1.5">
				<Label htmlFor={`pni-lbl-${node.id}`}>Label</Label>
				<Input
					id={`pni-lbl-${node.id}`}
					defaultValue={node.label}
					aria-invalid={labelErr}
					className={cn(labelErr && "wwc:border-destructive")}
					onBlur={(event) => commitLabel(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") event.currentTarget.blur();
					}}
				/>
				{labelErr && <p className="wwc:text-xs wwc:text-destructive">Label required.</p>}
			</div>

			{node.kind === "sink_sync" ? (
				<div className="wwc:space-y-1.5">
					<Label>Target object type</Label>
					{/* The one param that is a picker rather than free text, and the one that changes what a
					    run reports: it feeds syncRowCount() and the node body's "→ <display name>" line. */}
					<Combobox
						options={WC3_OBJECT_TYPES.map((ot) => ({
							value: ot.id,
							label: ot.displayName,
							icon: <OntologyGlyph name={ot.icon} color={ot.color} />,
						}))}
						value={node.params.targetOt ?? ""}
						onValueChange={(value) => commitParam("targetOt", value)}
						placeholder="Select object type…"
						className="wwc:w-full"
					/>
				</div>
			) : paramKeys.length === 0 ? (
				<p className="wwc:text-xs wwc:text-muted-foreground">This kind carries no parameters.</p>
			) : (
				paramKeys.map((key) => (
					<div key={key} className="wwc:space-y-1.5">
						<Label htmlFor={`pni-${node.id}-${key}`} className="wwc:uppercase">
							{key}
						</Label>
						<Input
							id={`pni-${node.id}-${key}`}
							defaultValue={node.params[key]}
							onBlur={(event) => commitParam(key, event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") event.currentTarget.blur();
							}}
						/>
					</div>
				))
			)}

			{/*
			 * Replaces the prototype's "Preview (first 5 of N)" table. There is no instance-row fixture in
			 * this package, so the schema and the count are stated in words rather than filled with
			 * plausible-looking rows that no data backs.
			 */}
			<div className="wwc:space-y-1.5 wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5">
				<div className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
					Output schema
				</div>
				{output.cols.length === 0 ? (
					<p className="wwc:text-xs wwc:text-muted-foreground">
						Produces no rows — this kind emits nothing downstream.
					</p>
				) : (
					<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
						{output.cols.map((col) => (
							<span key={col} className="wwc:rounded wwc:bg-muted wwc:px-1.5 wwc:py-0.5">
								<Mono>{col}</Mono>
							</span>
						))}
					</div>
				)}
				<div className="wwc:text-xs wwc:text-muted-foreground">
					{output.rows} rows at drop rev {pipeline.dropRev || 1}
				</div>
			</div>

			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
				<Button variant="destructive" size="sm" className="wwc:gap-1.5" onClick={onDelete}>
					<Trash2 className="wwc:h-3.5 wwc:w-3.5" />
					Delete node…
				</Button>
				<span className="wwc:text-[10.5px] wwc:text-muted-foreground">
					position x {node.x} · y {node.y}
				</span>
			</div>
		</div>
	);
}

/**
 * Name / description / icon, committed straight onto the record. Keyed on the pipeline id at the call
 * site so its uncontrolled fields re-read when a different pipeline is opened.
 */
function PipelineMetaCard({pipeline, onChange}: {pipeline: Wc3Pipeline; onChange: (next: Wc3Pipeline) => void}) {
	const [nameErr, setNameErr] = useState(false);

	return (
		<div className="wwc:space-y-3">
			<div className="wwc:space-y-1.5">
				<Label htmlFor={`pipe-name-${pipeline.id}`}>Name</Label>
				<Input
					id={`pipe-name-${pipeline.id}`}
					defaultValue={pipeline.name}
					aria-invalid={nameErr}
					className={cn(nameErr && "wwc:border-destructive")}
					onBlur={(event) => {
						const value = event.target.value.trim();
						// Empty name → inline error and NO commit. A nameless pipeline is unfindable in the list.
						if (!value) {
							setNameErr(true);
							return;
						}
						setNameErr(false);
						onChange(updatePipelineMeta(pipeline, {name: value}));
					}}
				/>
				{nameErr && <p className="wwc:text-xs wwc:text-destructive">Name required.</p>}
			</div>

			<div className="wwc:space-y-1.5">
				<Label htmlFor={`pipe-desc-${pipeline.id}`}>Description</Label>
				<Textarea
					id={`pipe-desc-${pipeline.id}`}
					rows={3}
					defaultValue={pipeline.desc}
					onBlur={(event) => onChange(updatePipelineMeta(pipeline, {desc: event.target.value}))}
				/>
			</div>

			<div className="wwc:space-y-1.5">
				<Label>Icon</Label>
				<Combobox
					options={WC3_PIPELINE_ICONS.map((icon) => ({
						value: icon,
						label: icon,
						icon: <LineageGlyph name={icon} />,
					}))}
					value={pipeline.icon}
					onValueChange={(value) => onChange(updatePipelineMeta(pipeline, {icon: value}))}
					placeholder="Select icon…"
					className="wwc:w-full"
				/>
			</div>

			<div className="wwc:text-[10.5px] wwc:text-muted-foreground">
				<Mono>{pipeline.id}</Mono> · edits live for this session only — nothing about a pipeline is persisted.
			</div>
		</div>
	);
}

/** The run log, newest first. `order` and `stats` are surfaced by the Runs tab, not here. */
function RunLog({pipeline, onNavigate}: {pipeline: Wc3Pipeline; onNavigate?: (t: Wc3LineageNavTarget) => void}) {
	if (pipeline.runs.length === 0) {
		return (
			<p className="wwc:text-xs wwc:text-muted-foreground">
				Not run yet — press Run pipeline. A run executes every node in topological order and records what each one
				produced. It writes a run record and nothing else: no instances are created anywhere in the workspace.
			</p>
		);
	}

	return (
		<div className="wwc:space-y-2">
			{pipeline.runs
				.slice()
				.reverse()
				.map((run) => (
					<div key={run.id} className="wwc:space-y-1 wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5">
						<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
							<Badge variant="neutralSoft">run</Badge>
							<span className="wwc:text-[11px] wwc:text-muted-foreground">
								{run.at} · drop rev {run.rev}
							</span>
							<Button
								variant="ghost"
								size="sm"
								className="wwc:ml-auto wwc:h-6 wwc:gap-1 wwc:px-1.5 wwc:text-[11px]"
								onClick={() => onNavigate?.({perspectiveId: "lineage", tabId: "workflow"})}
							>
								lineage
								<ArrowRight className="wwc:h-3 wwc:w-3" />
							</Button>
						</div>
						{run.summary.length === 0 ? (
							<div className="wwc:text-[11px] wwc:text-muted-foreground">no sink effects</div>
						) : (
							run.summary.map((line) => (
								<div key={line} className="wwc:text-[11px]">
									· {line}
								</div>
							))
						)}
					</div>
				))}
		</div>
	);
}

/** A right-rail section. Three short ones stack full-width — no SideMenu, per the house note. */
function RailCard({title, count, children}: {title: string; count?: number; children: React.ReactNode}) {
	return (
		<Card className="wwc:shrink-0">
			<CardHeader className="wwc:p-3">
				<CardTitle className="wwc:text-sm">
					{title}
					{count !== undefined ? <span className="wwc:font-normal wwc:text-muted-foreground"> ({count})</span> : null}
				</CardTitle>
			</CardHeader>
			<CardContent className="wwc:p-3 wwc:pt-0">{children}</CardContent>
		</Card>
	);
}

export function PipelineDetail({pipeline, onChange, onBack, onNavigate}: PipelineDetailProps) {
	// The transient builder state, exactly as UI.pipe sits OUTSIDE the prototype's store: never
	// committed, never persisted, never undoable.
	const [edit, setEdit] = useState<Wc3PipelineEditState>(WC3_PIPELINE_EDIT_INITIAL);
	const [pending, setPending] = useState<{kind: "node" | "wire"; id: string} | null>(null);

	// Cleared whenever the open pipeline changes — including wireErr, which the prototype leaves on
	// screen after switching pipelines. That is a bug we do not port.
	useEffect(() => {
		setEdit(WC3_PIPELINE_EDIT_INITIAL);
		setPending(null);
	}, [pipeline.id]);

	const facts = useMemo(() => pipelineFacts(pipeline), [pipeline]);
	const lastRun = facts.lastRun;
	const selectedNode = edit.sel ? (pipeline.nodes.find((n) => n.id === edit.sel) ?? null) : null;

	// ── Run sweep ─────────────────────────────────────────────────────────────
	// One timer, re-armed per step: 120ms to the first frame then 260ms each, ending at
	// step > order.length + 1. Cleaned up on unmount and on pipeline change (the reset above nulls
	// `anim`, which drops the effect).
	useEffect(() => {
		if (!edit.anim) return;
		const delay = edit.anim.step === 0 ? 120 : 260;
		const timer = setTimeout(() => {
			setEdit((state) => {
				if (!state.anim) return state;
				const step = state.anim.step + 1;
				if (step > state.anim.order.length + 1) return {...state, anim: null};
				return {...state, anim: {...state.anim, step}};
			});
		}, delay);
		return () => clearTimeout(timer);
	}, [edit.anim]);

	// ── Canvas derivation ─────────────────────────────────────────────────────
	// Positions are fed STRAIGHT from n.x/n.y. No layout pass, ever: the fixture is hand-placed
	// (x 40-880, y 60-270) and dagre/elk would flatten pipe_bim's fan-out and pipe_tel's two
	// disconnected roots. fitView plus its padding is the whole normalisation budget, and it frames
	// multiple roots as happily as one.
	const flowNodes: Node[] = useMemo(
		() =>
			pipeline.nodes.map((node) => {
				const index = edit.anim ? edit.anim.order.indexOf(node.id) : -1;
				const step = edit.anim?.step ?? 0;
				const runState: Wc3RunState =
					index < 0 || step === 0 ? "idle" : index === step - 1 ? "running" : index < step - 1 ? "done" : "idle";
				return {
					id: node.id,
					type: "pipe",
					position: {x: node.x, y: node.y},
					data: {
						node,
						kind: nodeKind(node.kind),
						picked: edit.sel === node.id,
						rows: lastRun?.stats[node.id],
						runState,
						syncTarget:
							node.kind === "sink_sync" ? (getObjectType(node.params.targetOt ?? "")?.displayName ?? "missing") : null,
					} satisfies PipeFlowNodeData,
				};
			}),
		[pipeline.nodes, edit.sel, edit.anim, lastRun],
	);

	const flowEdges: Edge[] = useMemo(() => {
		const known = new Set(pipeline.nodes.map((n) => n.id));
		const sweeping = edit.anim ? edit.anim.order[edit.anim.step - 1] : undefined;
		return pipeline.wires
			.map((wire): Edge | null => {
				const from = parsePortRef(wire.from);
				const to = parsePortRef(wire.to);
				// Guarded on both endpoints existing, so a wire left by a half-applied edit draws nothing
				// rather than dangling.
				if (!known.has(from.nodeId) || !known.has(to.nodeId)) return null;
				const pulsing = sweeping !== undefined && sweeping === to.nodeId;
				return {
					id: wire.id,
					source: from.nodeId,
					target: to.nodeId,
					// Both handle ids are mandatory: without them React Flow attaches to the first handle and
					// the "<nodeId>:<portIndex>" encoding stops round-tripping.
					sourceHandle: String(from.portIndex),
					targetHandle: String(to.portIndex),
					animated: pulsing,
					style: {
						stroke: pulsing ? "var(--wwc-color-primary)" : "var(--wwc-color-border)",
						strokeWidth: pulsing ? 2 : 1.5,
					},
				} satisfies Edge;
			})
			.filter((edge): edge is Edge => edge !== null);
	}, [pipeline.nodes, pipeline.wires, edit.anim]);

	const [nodes, setNodes, onNodesChange] = useNodesState<Node>(flowNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(flowEdges);

	// React Flow owns positions DURING a drag; the record owns them between drags. Re-seeding on every
	// derivation change is safe because a drag does not touch `pipeline` until onNodeDragStop commits.
	useEffect(() => setNodes(flowNodes), [flowNodes, setNodes]);
	useEffect(() => setEdges(flowEdges), [flowEdges, setEdges]);

	// ── Editing ───────────────────────────────────────────────────────────────
	const addFromPalette = useCallback(
		(kindId: string) => {
			const {pipeline: next, nodeId} = addNode(pipeline, kindId);
			onChange(next);
			setEdit((state) => ({...state, sel: nodeId, wireFrom: null, wireErr: null}));
		},
		[pipeline, onChange],
	);

	/** The four guards, run once and quoted verbatim. Both React Flow entry points call this. */
	const validate = useCallback(
		(connection: Connection | Edge) => {
			const from = portRef(connection.source, Number(connection.sourceHandle ?? 0));
			const to = portRef(connection.target, Number(connection.targetHandle ?? 0));
			return {from, to, check: checkWire(pipeline, from, to)};
		},
		[pipeline],
	);

	const onConnect = useCallback(
		(connection: Connection) => {
			const {from, to, check} = validate(connection);
			if (!check.ok) {
				setEdit((state) => ({...state, wireFrom: null, wireErr: check.reason}));
				return;
			}
			onChange(addWire(pipeline, from, to));
			setEdit((state) => ({...state, wireFrom: null, wireErr: null}));
		},
		[pipeline, onChange, validate],
	);

	/**
	 * The refusal surface. `isValidConnection` blocks the drop, which means onConnect never fires for a
	 * refused wire and the reason would never be read — so the guards run again here, on the pair the
	 * drag actually ended on, and their message lands in the warn banner verbatim. Handles are resolved
	 * by TYPE, not by drag direction, so dragging input→output refuses for the same reason as
	 * output→input rather than for a spurious one.
	 */
	const onConnectEnd = useCallback(
		(_event: MouseEvent | TouchEvent, state: FinalConnectionState) => {
			const {fromHandle, toHandle} = state;
			if (!fromHandle || !toHandle) {
				setEdit((edited) => ({...edited, wireFrom: null}));
				return;
			}
			const source = fromHandle.type === "source" ? fromHandle : toHandle;
			const target = fromHandle.type === "source" ? toHandle : fromHandle;
			const check = checkWire(
				pipeline,
				portRef(source.nodeId, Number(source.id ?? 0)),
				portRef(target.nodeId, Number(target.id ?? 0)),
			);
			setEdit((edited) => ({...edited, wireFrom: null, wireErr: check.ok ? null : check.reason}));
		},
		[pipeline],
	);

	const confirmPending = () => {
		if (!pending) return;
		if (pending.kind === "node") {
			// Cascades: deleteNode drops every wire touching it, so the canvas can never keep a stub.
			onChange(deleteNode(pipeline, pending.id));
			setEdit((state) => ({...state, sel: state.sel === pending.id ? null : state.sel, wireFrom: null}));
		} else {
			onChange(deleteWire(pipeline, pending.id));
		}
		setPending(null);
	};

	const runNow = () => {
		const {pipeline: next, run} = runPipeline(pipeline);
		onChange(next);
		setEdit((state) => ({...state, wireErr: null, anim: {order: run.order, step: 0}}));
	};

	const pendingNode = pending?.kind === "node" ? pipeline.nodes.find((n) => n.id === pending.id) : undefined;
	const pendingWire = pending?.kind === "wire" ? pipeline.wires.find((w) => w.id === pending.id) : undefined;

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
			{/*
			 * Fixed bar, sized to match PageContentHeader above it (compact density -> min-h-12, px-3) so
			 * the two stacked headers read as one band. The <h1> is legitimate here — the no-in-content-h1
			 * rule is about tab panes, not a drill-in header.
			 */}
			<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-card wwc:px-3">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2.5">
					<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
						<ArrowLeft className="wwc:h-4 wwc:w-4" />
						Back
					</Button>
					<div className="wwc:h-5 wwc:w-px wwc:shrink-0 wwc:bg-border" />
					<PipelineGlyph pipeline={pipeline} className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
					<h1 className="wwc:truncate wwc:text-sm wwc:font-semibold">{pipeline.name}</h1>
					<Badge variant="neutralSoft" className="wwc:font-normal">
						rev {pipeline.dropRev || 1}
					</Badge>
					{facts.healthNotes.length > 0 && (
						// A HINT, never an error: pipe_bim's QTO output has no consumer in the whole palette and
						// pipe_tel ships two roots. Both are legal and both must be visible without escalation.
						<HoverTooltip content={facts.healthNotes.join(" ")}>
							<span>
								<Badge variant="warningSoft" className="wwc:gap-1 wwc:font-normal">
									<TriangleAlert className="wwc:h-3 wwc:w-3" />
									{facts.healthNotes.length} hint{facts.healthNotes.length === 1 ? "" : "s"}
								</Badge>
							</span>
						</HoverTooltip>
					)}
					<span className="wwc:hidden wwc:truncate wwc:text-[11px] wwc:text-muted-foreground wwc:lg:inline">
						{facts.nodeCount} nodes · {facts.wireCount} wires · {facts.runCount} runs
					</span>
				</div>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
					{canReceiveDrop(pipeline) ? (
						<Button variant="outline" size="sm" className="wwc:gap-1.5" onClick={() => onChange(receiveDrop(pipeline))}>
							<Download className="wwc:h-4 wwc:w-4" />
							Receive new IFC drop
						</Button>
					) : pipeline.dropRev >= 2 ? (
						<HoverTooltip content={WC3_DROP_REV2_SUMMARY}>
							<span>
								<Badge variant="successSoft" className="wwc:gap-1 wwc:font-normal">
									<CheckCircle2 className="wwc:h-3 wwc:w-3" />
									Drop rev 2 received
								</Badge>
							</span>
						</HoverTooltip>
					) : null}
					<Button size="sm" className="wwc:gap-1.5" onClick={runNow} disabled={pipeline.nodes.length === 0}>
						<Play className="wwc:h-4 wwc:w-4" />
						Run pipeline
					</Button>
				</div>
			</div>

			{/*
			 * Height strategy (A) from wc3-graph-explorer-flow.tsx:268-276 — the canvas owns the page
			 * height, this page does not scroll, and the right rail scrolls inside itself. No SideMenu:
			 * three short sections stack full-width.
			 */}
			<div className="wwc:grid wwc:min-h-0 wwc:flex-1 wwc:gap-4 wwc:overflow-hidden wwc:px-6 wwc:pb-6 wwc:pt-4 wwc:lg:grid-cols-[minmax(0,1fr)_22rem]">
				<Card className="wwc:flex wwc:min-h-0 wwc:overflow-hidden">
					{/* The canvas palette — the ONLY affordance in the perspective that adds a node, so exactly
					    one surface mutates a pipeline's graph. The Palette TAB is a reference catalogue. */}
					<div className="wwc:flex wwc:w-[200px] wwc:shrink-0 wwc:flex-col wwc:gap-2 wwc:overflow-y-auto wwc:border-r wwc:border-border wwc:p-2">
						<div className="wwc:px-2 wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
							Palette
						</div>
						{WC3_NODE_CATEGORIES.map((category) => (
							<div key={category} className="wwc:space-y-0.5">
								<div className="wwc:px-2 wwc:text-[10px] wwc:font-semibold wwc:text-muted-foreground">{category}</div>
								{Object.keys(WC3_NODE_KINDS)
									.filter((kindId) => WC3_NODE_KINDS[kindId]?.cat === category)
									.map((kindId) => (
										<PaletteItem key={kindId} kindId={kindId} onAdd={addFromPalette} />
									))}
							</div>
						))}
					</div>

					<div className="wwc:flex wwc:min-w-0 wwc:min-h-0 wwc:flex-1 wwc:flex-col">
						{edit.wireErr && (
							<div className="wwc:flex wwc:shrink-0 wwc:items-start wwc:gap-2 wwc:border-b wwc:border-amber-600/30 wwc:bg-amber-500/5 wwc:p-3 wwc:text-sm">
								<XCircle className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-amber-600" />
								{/* Verbatim from checkWire(). No surface rewords a refusal. */}
								<span>
									<b>Wire refused:</b> {edit.wireErr}
								</span>
							</div>
						)}

						<div className="wwc:min-h-0 wwc:flex-1">
							{pipeline.nodes.length === 0 ? (
								// A state the prototype never renders — it always opens on a seeded pipeline. A
								// pipeline created from scratch lands here, and the palette is the only way forward.
								<Empty
									title="Empty canvas"
									description="This pipeline has no nodes yet. Pick a source from the palette on the left, then wire its output port to the input port of a transform or a sink."
								/>
							) : (
								<GraphCanvas
									nodes={nodes}
									edges={edges}
									onNodesChange={onNodesChange}
									onEdgesChange={onEdgesChange}
									nodeTypes={NODE_TYPES}
									onConnect={onConnect}
									// Refuses an illegal wire during the drag itself, so the guards are the connection
									// rule rather than an after-the-fact rejection.
									isValidConnection={(connection) => validate(connection).check.ok}
									onConnectStart={(_, params) => {
										const nodeId = params.nodeId;
										if (params.handleType !== "source" || !nodeId) return;
										setEdit((state) => ({
											...state,
											wireErr: null,
											wireFrom: portRef(nodeId, Number(params.handleId ?? 0)),
										}));
									}}
									onConnectEnd={onConnectEnd}
									onNodeClick={(_, node) =>
										setEdit((state) => ({
											...state,
											sel: state.sel === node.id ? null : node.id,
											wireFrom: null,
										}))
									}
									// React Flow owns the position during the drag; ONE commit lands on drag end.
									onNodeDragStop={(_, node) => onChange(moveNode(pipeline, node.id, node.position.x, node.position.y))}
									onEdgeClick={(_, edge) => setPending({kind: "wire", id: edge.id})}
									onPaneClick={() => setEdit((state) => ({...state, sel: null, wireFrom: null, wireErr: null}))}
								/>
							)}
						</div>

						<div className="wwc:flex wwc:shrink-0 wwc:flex-wrap wwc:items-center wwc:gap-x-4 wwc:gap-y-1 wwc:border-t wwc:border-border wwc:px-3 wwc:py-2">
							{/* One component, shared with the Palette tab, so the key can never drift. */}
							<PortLegend />
							<span className="wwc:text-xs wwc:text-muted-foreground">
								Drag an output port to an input port to wire. Click a wire to delete it.
							</span>
						</div>
					</div>
				</Card>

				<div className="wwc:flex wwc:min-h-0 wwc:flex-col wwc:gap-4 wwc:overflow-y-auto">
					<RailCard title="Node inspector">
						{selectedNode ? (
							<NodeInspector
								key={selectedNode.id}
								pipeline={pipeline}
								node={selectedNode}
								onChange={onChange}
								onDelete={() => setPending({kind: "node", id: selectedNode.id})}
							/>
						) : (
							<p className="wwc:text-xs wwc:text-muted-foreground">
								Select a node to edit its label and parameters, read the schema it outputs, or delete it. Drag an output
								port to an input port to wire two nodes.
							</p>
						)}
					</RailCard>

					<RailCard title="Pipeline">
						<PipelineMetaCard key={pipeline.id} pipeline={pipeline} onChange={onChange} />
					</RailCard>

					<RailCard title="Run log" count={pipeline.runs.length}>
						<RunLog pipeline={pipeline} onNavigate={onNavigate} />
					</RailCard>
				</div>
			</div>

			<ConfirmDialog
				open={pending?.kind === "node"}
				onOpenChange={(next) => {
					if (!next) setPending(null);
				}}
				title="Delete node"
				description={`Delete node “${pendingNode?.label ?? ""}” and its wires?`}
				confirmLabel="Delete"
				destructive
				onConfirm={confirmPending}
			/>
			<ConfirmDialog
				open={pending?.kind === "wire"}
				onOpenChange={(next) => {
					if (!next) setPending(null);
				}}
				title="Delete wire"
				description={`Remove the wire ${pendingWire?.from ?? ""} → ${pendingWire?.to ?? ""}? You can re-draw it from the ports.`}
				confirmLabel="Delete wire"
				destructive
				onConfirm={confirmPending}
			/>
		</div>
	);
}
