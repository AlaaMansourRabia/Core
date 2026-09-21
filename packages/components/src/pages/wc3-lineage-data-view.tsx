import {cn} from "@wakecap/core-utils";
import {Handle, Position, type Edge, type Node, type NodeProps, useEdgesState, useNodesState} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {ArrowRight, Box, Pencil} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
// React Flow ships its own positioning styles; without these the canvas does not lay out at all.

import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {GraphCanvas} from "../graph-canvas";
import {HoverTooltip} from "../tooltip";
import {
	WC3_NODE_KINDS,
	WC3_PIPELINES,
	WC3_PROJECTION_USAGE,
	appliedInstalls,
	getLineageProduct,
	lineageSources,
	productTypeMeta,
	syncedObjectTypeIds,
	typesFromProduct,
} from "./wc3-lineage-data";
import {LineageGlyph, Mono, Pane, TypeGlyphLabel, lineageNav, type LineageViewProps} from "./wc3-lineage-shared";
import {WC3_OBJECT_TYPES, getObjectType, instanceCount} from "./wc3-ontology-data";

// Tab "data" of the Lineage perspective — the datasource → pipeline → object type → projection DAG,
// ported from the prototype's m7-lineage.js `LineageData`.
//
// The prototype draws NO wires: it is five columns of cards that fade on selection, so the viewer has
// to infer which node feeds which. This renders the same five layers on React Flow instead, with the
// edges drawn, so the path is visible before anything is clicked. The selection model is unchanged —
// `isConnected` below is still the prototype's rule set, and it now dims edges as well as nodes.
//
// Two edge kinds, because two different relationships are in play:
//   solid  — data flow:   datasource → pipeline → object type → consuming projection
//   dashed — provenance:  which product install put an object type in the store (not a flow step)

// ─── Selection model ─────────────────────────────────────────────────────────

type NodeKind = "prod" | "src" | "pipe" | "ot" | "proj";
type Selection = {kind: NodeKind; id: string};

/** The pseudo-node for the presence_events stream. It is not an object type and resolves to nothing. */
const TOPIC_ID = "__topic__";

/** Object types a pipeline syncs into — the join every connection rule is expressed in terms of. */
function sinkTargets(pipelineId: string): string[] {
	const pipeline = WC3_PIPELINES.find((p) => p.id === pipelineId);
	if (!pipeline) return [];
	return pipeline.nodes.filter((n) => n.kind === "sink_sync" && n.params.targetOt).map((n) => n.params.targetOt);
}

/** A source node's id is the composite "<pipelineId>:<nodeId>". */
const pipelineOfSource = (sourceId: string) => sourceId.split(":")[0] ?? "";

const projectionUses = (key: string) => WC3_PROJECTION_USAGE[key]?.uses ?? [];

const installedProductKey = (otId: string) => getObjectType(otId)?.installedBy?.productKey;

/**
 * The prototype's `connected(kind, id)`, reproduced rule for rule. Order matters: the product branch
 * runs FIRST and short-circuits, which is why selecting a product lights only pipelines and object
 * types (the Datasources and Consuming projections columns go fully dim), and why selecting a
 * datasource or a projection dims the whole Products column.
 */
function isConnected(sel: Selection | null, kind: NodeKind, id: string): boolean {
	if (!sel) return true;
	if (sel.kind === kind && sel.id === id) return true;

	// ── Product branch: one side is a product, and only object types and pipelines can reach it.
	if (sel.kind === "prod" || kind === "prod") {
		const productKey = sel.kind === "prod" ? sel.id : id;
		const other: Selection = sel.kind === "prod" ? {kind, id} : sel;
		if (other.kind === "ot") return installedProductKey(other.id) === productKey;
		if (other.kind === "pipe") return sinkTargets(other.id).some((t) => installedProductKey(t) === productKey);
		return false;
	}

	if (sel.kind === "pipe") {
		const targets = sinkTargets(sel.id);
		if (kind === "src") return id.startsWith(`${sel.id}:`);
		if (kind === "ot") return targets.includes(id);
		if (kind === "proj") return projectionUses(id).some((t) => targets.includes(t));
		return false;
	}

	if (sel.kind === "ot") {
		if (kind === "pipe") return sinkTargets(id).includes(sel.id);
		if (kind === "src") return sinkTargets(pipelineOfSource(id)).includes(sel.id);
		if (kind === "proj") return projectionUses(id).includes(sel.id);
		return false;
	}

	if (sel.kind === "proj") {
		const uses = projectionUses(sel.id);
		if (kind === "ot") return uses.includes(id);
		if (kind === "pipe") return sinkTargets(id).some((t) => uses.includes(t));
		if (kind === "src") return sinkTargets(pipelineOfSource(id)).some((t) => uses.includes(t));
		return false;
	}

	if (sel.kind === "src") {
		const pipelineId = pipelineOfSource(sel.id);
		const targets = sinkTargets(pipelineId);
		if (kind === "pipe") return id === pipelineId;
		if (kind === "ot") return targets.includes(id);
		if (kind === "proj") return projectionUses(id).some((t) => targets.includes(t));
		return false;
	}

	return false;
}

// ─── Canvas ──────────────────────────────────────────────────────────────────

type LineageNode = {
	/** React key — an id can repeat across columns, so it carries its kind. */
	key: string;
	kind: NodeKind;
	id: string;
	icon: string;
	label: string;
	sub: string;
	/** Omitted for the presence_events topic, the one node with no destination. */
	open?: () => void;
};

type FlowNodeData = {node: LineageNode; dimmed: boolean; picked: boolean};

/** Layer geometry. One column per node kind, in flow order, left to right. */
const COLUMN_GAP = 300;
const ROW_GAP = 104;
const HEADING_Y = -56;

const COLUMNS = [
	{field: "products", kind: "prod", heading: "Products (provenance)"},
	{field: "sources", kind: "src", heading: "Datasources / drops"},
	{field: "pipelines", kind: "pipe", heading: "Pipelines"},
	{field: "objectTypes", kind: "ot", heading: "Object types synced"},
	{field: "projections", kind: "proj", heading: "Consuming projections"},
] as const;

/** Node ids carry their kind: an id can repeat across columns (a pipeline and its source share one). */
const flowId = (kind: NodeKind, id: string) => `${kind}:${id}`;
const parseFlowId = (flowNodeId: string): Selection => {
	const at = flowNodeId.indexOf(":");
	return {kind: flowNodeId.slice(0, at) as NodeKind, id: flowNodeId.slice(at + 1)};
};

/**
 * A node on the canvas. Same visual language as the ontology graph explorer's node, so the two
 * canvases read as one system. Handles are transparent — edges attach, but no dots show.
 */
function LineageFlowNode({data}: NodeProps) {
	const {node, dimmed, picked} = data as unknown as FlowNodeData;
	return (
		<div
			className={cn(
				"wwc:w-[224px] wwc:rounded-lg wwc:border wwc:bg-card wwc:px-3 wwc:py-2 wwc:transition-opacity",
				picked ? "wwc:border-primary wwc:ring-1 wwc:ring-primary" : "wwc:border-border wwc:hover:border-primary/50",
				dimmed && "wwc:opacity-25",
			)}
		>
			<Handle type="target" position={Position.Left} className="wwc:!border-0 wwc:!bg-transparent" />
			<div className="wwc:flex wwc:items-start wwc:gap-1.5 wwc:text-xs wwc:font-semibold">
				<LineageGlyph name={node.icon} />
				<span className="wwc:min-w-0 wwc:break-words">{node.label}</span>
			</div>
			<div className="wwc:mt-0.5 wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:min-w-0 wwc:break-words wwc:text-[10px] wwc:text-muted-foreground">{node.sub}</span>
				{node.open && (
					// nodrag keeps React Flow from starting a drag on the button; stopPropagation keeps the
					// click from also toggling the selection, since the whole node is the select target.
					<Button
						variant="ghost"
						size="sm"
						className="wwc:nodrag wwc:ml-auto wwc:h-5 wwc:shrink-0 wwc:gap-0.5 wwc:px-1 wwc:text-[10px]"
						onClick={(event) => {
							event.stopPropagation();
							node.open?.();
						}}
					>
						Open
						<ArrowRight className="wwc:h-3 wwc:w-3" />
					</Button>
				)}
			</div>
			<Handle type="source" position={Position.Right} className="wwc:!border-0 wwc:!bg-transparent" />
		</div>
	);
}

/** A column heading, parked above its column so it pans and zooms with the layer it labels. */
function LineageHeadingNode({data}: NodeProps) {
	const {label} = data as unknown as {label: string};
	return (
		<div className="wwc:w-[224px] wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
			{label}
		</div>
	);
}

const FLOW_NODE_TYPES = {lineage: LineageFlowNode, heading: LineageHeadingNode};

function ProvenanceCard({onNavigate}: Pick<LineageViewProps, "onNavigate">) {
	const withProvenance = WC3_OBJECT_TYPES.filter((o) => o.installedBy);
	const without = WC3_OBJECT_TYPES.filter((o) => !o.installedBy);
	const rows = appliedInstalls()
		.map((install) => ({install, types: typesFromProduct(install.productKey)}))
		.filter((r) => r.types.length > 0);

	return (
		<Card>
			<CardHeader className="wwc:p-4">
				<CardTitle className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5 wwc:text-sm">
					<Box className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
					Product provenance
					<span className="wwc:font-normal wwc:text-muted-foreground">
						which product install put each object type in the store — {withProvenance.length} of{" "}
						{WC3_OBJECT_TYPES.length} object types carry provenance
					</span>
				</CardTitle>
			</CardHeader>
			{/* The count rides on the DOM so the prototype's own assertion still has something to read. */}
			<CardContent className="wwc:space-y-2 wwc:p-4 wwc:pt-0" data-lineage-provenance={withProvenance.length}>
				{rows.length === 0 ? (
					<div className="wwc:text-xs wwc:text-muted-foreground">
						No applied product install has put a type in this store.
					</div>
				) : (
					rows.map(({install, types}) => {
						const product = getLineageProduct(install.productKey);
						const meta = productTypeMeta(product?.productType ?? "");
						return (
							<div key={install.id} className="wwc:space-y-2 wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5">
								<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
									<LineageGlyph name={meta.icon} />
									<span className="wwc:text-xs wwc:font-semibold">{product?.displayName ?? install.productKey}</span>
									<Mono>
										{install.productKey} {install.version}
									</Mono>
									<Badge variant="neutralSoft" className="wwc:font-normal">
										{install.environment}
										{install.baseline ? " · baseline" : ""}
									</Badge>
									<Button
										variant="ghost"
										size="sm"
										className="wwc:ml-auto wwc:shrink-0"
										onClick={() => onNavigate?.(lineageNav.product(install.productKey))}
									>
										Open product
									</Button>
								</div>
								<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
									{types.map((type) => (
										<HoverTooltip
											key={type.id}
											content={`installed by ${type.installedBy?.productKey} ${type.installedBy?.version} (install ${type.installedBy?.installId})`}
										>
											<button
												type="button"
												data-prov-type={type.apiName}
												onClick={() => onNavigate?.(lineageNav.objectType(type.id))}
												className="wwc:rounded-md wwc:border wwc:border-border wwc:px-1.5 wwc:py-0.5 wwc:text-[11px] wwc:hover:bg-accent wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
											>
												<TypeGlyphLabel type={type} />
											</button>
										</HoverTooltip>
									))}
								</div>
							</div>
						);
					})
				)}
				{without.length > 0 && (
					<div className="wwc:flex wwc:items-start wwc:gap-1.5 wwc:text-[11px] wwc:text-muted-foreground">
						<Pencil className="wwc:mt-0.5 wwc:h-3.5 wwc:w-3.5 wwc:shrink-0" />
						<span>
							{without.length} object type(s) carry no product provenance — they were authored directly in this
							workspace (
							{without
								.slice(0, 6)
								.map((o) => o.displayName)
								.join(", ")}
							).
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ─── View ────────────────────────────────────────────────────────────────────

type ColumnMap = Record<string, LineageNode[]>;

/**
 * The wires. Solid edges are the data flow between adjacent layers; the dashed product → object type
 * edge is provenance, which skips the middle layers because it is not a flow step. Every edge is
 * guarded on the target actually being on the canvas, so a pipeline that syncs a type outside the
 * synced column simply draws no wire rather than dangling.
 */
function buildEdges(columns: ColumnMap): Edge[] {
	const edges: Edge[] = [];
	const has = (field: string, id: string) => (columns[field] ?? []).some((n) => n.id === id);

	// datasource → its pipeline (the source id is "<pipelineId>:<nodeId>")
	for (const source of columns.sources ?? []) {
		const pipelineId = pipelineOfSource(source.id);
		if (has("pipelines", pipelineId)) {
			edges.push({id: `e:src:${source.id}`, source: flowId("src", source.id), target: flowId("pipe", pipelineId)});
		}
	}

	// pipeline → every object type it syncs, plus the stream topic when it has one
	for (const pipeline of columns.pipelines ?? []) {
		for (const target of sinkTargets(pipeline.id)) {
			if (has("objectTypes", target)) {
				edges.push({
					id: `e:pipe:${pipeline.id}:${target}`,
					source: flowId("pipe", pipeline.id),
					target: flowId("ot", target),
				});
			}
		}
		const emitsTopic = WC3_PIPELINES.find((p) => p.id === pipeline.id)?.nodes.some((n) => n.kind === "sink_topic");
		if (emitsTopic && has("objectTypes", TOPIC_ID)) {
			edges.push({
				id: `e:pipe:${pipeline.id}:topic`,
				source: flowId("pipe", pipeline.id),
				target: flowId("ot", TOPIC_ID),
			});
		}
	}

	// object type → each projection that consumes it
	for (const projection of columns.projections ?? []) {
		for (const used of projectionUses(projection.id)) {
			if (has("objectTypes", used)) {
				edges.push({
					id: `e:proj:${projection.id}:${used}`,
					source: flowId("ot", used),
					target: flowId("proj", projection.id),
				});
			}
		}
	}

	// product ⇢ object type it installed (provenance, not flow)
	for (const type of columns.objectTypes ?? []) {
		const productKey = installedProductKey(type.id);
		if (productKey && has("products", productKey)) {
			edges.push({
				id: `e:prod:${productKey}:${type.id}`,
				source: flowId("prod", productKey),
				target: flowId("ot", type.id),
				data: {provenance: true},
			});
		}
	}

	return edges;
}

/** Edge paint. Dimming an edge as well as its endpoints is what makes the selected slice readable. */
function edgeStyle(edge: Edge, sel: Selection | null) {
	const provenance = !!(edge.data as {provenance?: boolean} | undefined)?.provenance;
	const ends = [edge.source, edge.target].map(parseFlowId);
	const active = !sel || ends.every((end) => isConnected(sel, end.kind, end.id));
	return {
		strokeDasharray: provenance ? "4 3" : undefined,
		stroke: active && sel ? "var(--wwc-color-primary)" : "var(--wwc-color-border)",
		strokeWidth: active && sel ? 1.5 : 1,
		opacity: active ? 1 : 0.12,
	};
}

export function LineageDataView({onNavigate}: LineageViewProps = {}) {
	const [sel, setSel] = useState<Selection | null>(null);

	// The five columns are pure derivations of the fixture — nothing here depends on the selection.
	const columns = useMemo(() => {
		const products: LineageNode[] = appliedInstalls().map((install) => {
			const product = getLineageProduct(install.productKey);
			return {
				key: install.id,
				kind: "prod",
				id: install.productKey,
				icon: productTypeMeta(product?.productType ?? "").icon,
				label: product?.displayName ?? install.productKey,
				sub: `${install.addedObjectTypes.length} object types · ${install.environment}${install.baseline ? " · baseline" : ""}`,
				open: () => onNavigate?.(lineageNav.product(install.productKey)),
			};
		});

		const sources: LineageNode[] = lineageSources().map((source) => ({
			key: source.id,
			kind: "src",
			id: source.id,
			icon: WC3_NODE_KINDS[source.node.kind]?.icon ?? "database",
			label: source.name,
			sub: source.pipeline.name,
			open: () => onNavigate?.(lineageNav.pipeline(source.pipeline.id)),
		}));

		const pipelines: LineageNode[] = WC3_PIPELINES.map((pipeline) => ({
			key: pipeline.id,
			kind: "pipe",
			id: pipeline.id,
			icon: pipeline.icon,
			label: pipeline.name,
			sub: `${pipeline.nodes.length} nodes · ${pipeline.runs.length} run(s)`,
			open: () => onNavigate?.(lineageNav.pipeline(pipeline.id)),
		}));

		const objectTypes: LineageNode[] = syncedObjectTypeIds().map((otId) => {
			const type = getObjectType(otId);
			return {
				key: otId,
				kind: "ot",
				id: otId,
				icon: type?.icon ?? "box",
				label: type?.displayName ?? otId,
				sub: `${instanceCount(otId)} instances`,
				open: () => onNavigate?.(lineageNav.objectType(otId)),
			};
		});
		// Appended unconditionally, and the only node with no "Open": the presence_events stream is a
		// Kafka-style topic, not an object type, so it resolves to nothing and connects to nothing.
		objectTypes.push({
			key: TOPIC_ID,
			kind: "ot",
			id: TOPIC_ID,
			icon: "upload",
			label: "presence_events topic",
			sub: "stream — feeds live occupancy",
		});

		const projections: LineageNode[] = Object.entries(WC3_PROJECTION_USAGE).map(([key, usage]) => ({
			key,
			kind: "proj",
			id: key,
			icon: usage.icon,
			label: usage.label,
			sub: `${usage.uses.length} types consumed`,
			open: () => onNavigate?.(lineageNav.projection(key)),
		}));

		return {products, sources, pipelines, objectTypes, projections};
	}, [onNavigate]);

	const toggle = (node: LineageNode) =>
		setSel((current) =>
			current && current.kind === node.kind && current.id === node.id ? null : {kind: node.kind, id: node.id},
		);

	// Positions are computed once from the derivation; React Flow then owns them so nodes stay where the
	// user drags them. Selection only ever rewrites `data`, never `position`.
	const initialNodes = useMemo<Node[]>(() => {
		const built: Node[] = [];
		COLUMNS.forEach((column, columnIndex) => {
			const x = columnIndex * COLUMN_GAP;
			built.push({
				id: `head:${column.kind}`,
				type: "heading",
				position: {x, y: HEADING_Y},
				data: {label: column.heading},
				draggable: false,
				selectable: false,
				connectable: false,
			});
			(columns as ColumnMap)[column.field]?.forEach((node, rowIndex) => {
				built.push({
					id: flowId(node.kind, node.id),
					type: "lineage",
					position: {x, y: rowIndex * ROW_GAP},
					data: {node, dimmed: false, picked: false} satisfies FlowNodeData as unknown as Record<string, unknown>,
				});
			});
		});
		return built;
	}, [columns]);

	const initialEdges = useMemo(() => buildEdges(columns as ColumnMap), [columns]);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Repaint on selection. Node positions and the user's drags survive because only `data` is rewritten.
	useEffect(() => {
		setNodes((current) =>
			current.map((node) => {
				if (node.type !== "lineage") return node;
				const data = node.data as unknown as FlowNodeData;
				const picked = !!sel && sel.kind === data.node.kind && sel.id === data.node.id;
				const dimmed = !!sel && !isConnected(sel, data.node.kind, data.node.id);
				if (picked === data.picked && dimmed === data.dimmed) return node;
				return {...node, data: {...data, picked, dimmed} as unknown as Record<string, unknown>};
			}),
		);
		setEdges((current) => current.map((edge) => ({...edge, style: edgeStyle(edge, sel)})));
	}, [sel, setNodes, setEdges]);

	return (
		<Pane>
			<p className="wwc:text-xs wwc:text-muted-foreground">
				Click any node to highlight its connected slice (product → datasource → pipeline → object type → consuming
				projection). Click again to clear. Drag to rearrange, scroll to zoom.
			</p>

			{/* Fixed height: this pane scrolls (the provenance card sits below), so a flex-1 canvas would
			    collapse to nothing. fitView frames the whole DAG on mount regardless of the layer sizes. */}
			<Card className="wwc:h-[560px] wwc:shrink-0 wwc:overflow-hidden">
				<GraphCanvas
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					nodeTypes={FLOW_NODE_TYPES}
					onNodeClick={(_event, node) => {
						if (node.type !== "lineage") return;
						toggle((node.data as unknown as FlowNodeData).node);
					}}
					onPaneClick={() => setSel(null)}
				/>
			</Card>

			{/* Never dimmed: the provenance card answers a different question than the selection does. */}
			<ProvenanceCard onNavigate={onNavigate} />
		</Pane>
	);
}
