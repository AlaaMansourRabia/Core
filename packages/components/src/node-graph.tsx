import {cn} from "@corensystem/coren-utils";
import {Network, RotateCcw, TriangleAlert} from "lucide-react";
import * as React from "react";

import {Badge} from "./badge";
import {Button} from "./button";
import {Empty} from "./empty";
import type {Connection, Edge, Node, NodeChange, NodeProps} from "./graph-canvas";
import {GraphCanvas, Handle, Position, ReactFlowProvider, useReactFlow, useViewport} from "./graph-canvas";
import {Skeleton} from "./skeleton";
import {ZoomTools} from "./zoom-tools";

// NodeGraph — the functional node/edge surface four Connect journeys had each rebuilt on a raw graph
// engine: the pipeline builder, the process lifecycle, the analysis readiness graph and product
// lineage. GraphCanvas below it owns the React Flow chrome; this owns the CONTRACT — typed nodes and
// edges, the zoom controls, selection, movement, the empty/loading/error states and the inspector
// handoff — so a consumer never types an engine's props and never imports the engine.
//
// The engine is an implementation detail on purpose. Nodes are described, not rendered: a caller
// passes label/kind/status/tone and the widget draws the box, which is what keeps four graphs in one
// visual language instead of four.

// ─── Vocabulary ──────────────────────────────────────────────────────────────

/**
 * The status a node or edge carries, named for what it MEANS rather than for a colour, and mapped
 * here onto the same tokens Badge uses — so a "failed" node and a "failed" badge are the same red.
 */
export type NodeGraphTone = "neutral" | "accent" | "success" | "warning" | "danger";

/** Row height and type scale. `comfortable` (default) reads at a glance; `compact` fits more graph. */
export type NodeGraphDensity = "comfortable" | "compact";

/** Which sides a node's connection points sit on. Left/right suits a DAG, top/bottom a lifecycle. */
export type NodeGraphOrientation = "horizontal" | "vertical";

export interface NodeGraphNode<TData = unknown> {
	id: string;
	/** The node's name — the one line that always renders. */
	label: string;
	/** Secondary line under the label, e.g. a dataset path or an owner. */
	description?: string;
	/** What kind of thing this is — "Transform", "Object type", "Approval". Rendered as a quiet badge. */
	kind?: string;
	/** Runtime status — "Running", "Failed", "Published". Rendered as a badge in the node's tone. */
	status?: string;
	/** Semantic tone for the status badge and the node's border. Default `neutral`. */
	tone?: NodeGraphTone;
	/** A leading glyph, typically a lucide icon at 14px. */
	icon?: React.ReactNode;
	/** Canvas coordinates. The widget owns positions between renders; see `onNodeMove`. */
	position: {x: number; y: number};
	/** Overrides the graph-wide orientation for this node. */
	orientation?: NodeGraphOrientation;
	/** Overrides the graph-wide `selectable` for this node. */
	selectable?: boolean;
	/** Overrides the graph-wide `movable` for this node. */
	draggable?: boolean;
	/** Overrides the graph-wide `connectable` for this node. */
	connectable?: boolean;
	/** Rendered inside the node under the description — a metric, a progress bar, a pair of chips. */
	footer?: React.ReactNode;
	/** The caller's own payload, handed back untouched by every callback. */
	data?: TData;
}

export interface NodeGraphEdge<TData = unknown> {
	id: string;
	source: string;
	target: string;
	/** Rendered on the edge — a branch condition, a cardinality, a transform name. */
	label?: string;
	/** Semantic tone for the stroke. Default `neutral`. */
	tone?: NodeGraphTone;
	/** Dashed stroke — the house idiom for a planned, inferred, or inactive link. */
	dashed?: boolean;
	/** Marching-ants animation, for a link with something flowing through it right now. */
	animated?: boolean;
	/** The caller's own payload, handed back untouched by every callback. */
	data?: TData;
}

/** Pan and zoom, for a host that persists the framing or drives it from elsewhere. */
export interface NodeGraphViewport {
	x: number;
	y: number;
	zoom: number;
}

export interface NodeGraphProps<TNode = unknown, TEdge = unknown> {
	nodes: NodeGraphNode<TNode>[];
	edges?: NodeGraphEdge<TEdge>[];

	/** `layered` (default) wires a DAG with orthogonal edges; `free` suits a radial or hand-placed graph. */
	layout?: "layered" | "free";
	/** Graph-wide connection sides. Default `horizontal`. */
	orientation?: NodeGraphOrientation;
	/** Row height and type scale. Default `comfortable`. */
	density?: NodeGraphDensity;

	/** Controlled selection. Pass `null` for "nothing selected"; omit it entirely to stay uncontrolled. */
	selectedNodeId?: string | null;
	/** Initial selection when uncontrolled. */
	defaultSelectedNodeId?: string | null;
	/** Fires on click, on keyboard Enter/Space, and with `null` when the selection is cleared. */
	onSelectNode?: (nodeId: string | null, node?: NodeGraphNode<TNode>) => void;
	/** Turn off node selection for the whole graph. Default true. */
	selectable?: boolean;

	/** Let nodes be dragged. Default true. */
	movable?: boolean;
	/** Fires once a drag settles, with the node's new canvas position — persist it and pass it back. */
	onNodeMove?: (nodeId: string, position: {x: number; y: number}, node: NodeGraphNode<TNode>) => void;

	/** Let the user draw new edges from a node's handles. Default false. */
	connectable?: boolean;
	/** Fires when the user completes a connection. The caller owns the edge list, so add it there. */
	onConnectNodes?: (connection: {source: string; target: string}) => void;

	/** Controlled viewport. With it, the canvas stops framing itself and the host owns pan/zoom. */
	viewport?: NodeGraphViewport;
	/** Initial viewport when uncontrolled. Omit it and the graph frames itself on mount. */
	defaultViewport?: NodeGraphViewport;
	onViewportChange?: (viewport: NodeGraphViewport) => void;

	/** The fetch is in flight — the graph shows its loading treatment instead of an empty canvas. */
	loading?: boolean;
	/** The fetch failed. `true` uses the default wording; a string states the host's own message. */
	error?: boolean | string;
	/** Renders a Retry action on the error state. */
	onRetry?: () => void;
	/** Title on the empty state, when there are no nodes. */
	emptyTitle?: string;
	/** Description on the empty state. */
	emptyDescription?: string;
	/** An action on the empty state, e.g. "Add a step". */
	emptyAction?: React.ReactNode;

	/**
	 * The inspector / evidence handoff: whatever the host renders for the current selection. Sits in a
	 * right rail on desktop and stacks under the canvas at narrow widths.
	 */
	inspector?: React.ReactNode;
	/** Width of the inspector rail on desktop. Default 320. */
	inspectorWidth?: number;
	/** Chrome on the left of the zoom row — a ContextToolbar, a filter, a legend. */
	toolbar?: React.ReactNode;
	/** Hide the zoom row entirely, for a host that owns its own canvas chrome. */
	showZoomTools?: boolean;
	/** Show the pannable minimap. Off by default; earns its place on a graph you navigate. */
	showMiniMap?: boolean;

	/** Names the canvas for assistive technology. Default "Node graph". */
	"aria-label"?: string;
	className?: string;
	style?: React.CSSProperties;
}

// ─── Tone mapping ────────────────────────────────────────────────────────────

const TONE_BORDER: Record<NodeGraphTone, string> = {
	neutral: "wwc:border-border",
	accent: "wwc:border-primary/50",
	success: "wwc:border-green-600/40",
	warning: "wwc:border-amber-600/40",
	danger: "wwc:border-red-600/40",
};

const TONE_BADGE = {
	neutral: "neutralSoft",
	accent: "default",
	success: "successSoft",
	warning: "warningSoft",
	danger: "dangerSoft",
} as const;

/**
 * Edge strokes, as the tokens themselves rather than as classes: React Flow paints the path with
 * `--xy-edge-stroke`, so a `stroke-*` utility on the edge group never reaches it. `style.stroke` does.
 */
const TONE_STROKE: Record<NodeGraphTone, string> = {
	neutral: "var(--wwc-color-muted-foreground)",
	accent: "var(--wwc-color-primary)",
	success: "var(--wwc-color-success)",
	warning: "var(--wwc-color-warning)",
	danger: "var(--wwc-color-destructive)",
};

/**
 * The zoom bounds, given to the canvas AND to the readout above it. They have to be the same numbers:
 * React Flow's own default ceiling is 2, so a readout that believed in 4 would keep "zoom in" live and
 * accept a typed 400% that the canvas then silently clamped.
 */
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;

/**
 * Classes for React Flow's own node wrapper — the element it makes focusable. The focus ring has to
 * live here, not on the card inside, because the card is not the element the browser focuses.
 */
const NODE_WRAPPER_CLASS =
	"wwc:rounded-lg wwc:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring wwc:focus-visible:ring-offset-2 wwc:focus-visible:ring-offset-background";

// ─── The node ────────────────────────────────────────────────────────────────

/** What the widget hands its own node renderer. Not part of the public API. */
interface NodeCardData extends Record<string, unknown> {
	node: NodeGraphNode;
	density: NodeGraphDensity;
	orientation: NodeGraphOrientation;
}

const HANDLE_CLASS = "wwc:!h-2 wwc:!w-2 wwc:!border-0 wwc:!bg-muted-foreground";

/** The house node: kind + status over a label, a description, and the caller's footer. */
function NodeGraphNodeCard({data, selected, isConnectable}: NodeProps) {
	const {node, density, orientation} = data as unknown as NodeCardData;
	const tone = node.tone ?? "neutral";
	const compact = density === "compact";
	const sides =
		(node.orientation ?? orientation) === "vertical"
			? {target: Position.Top, source: Position.Bottom}
			: {target: Position.Left, source: Position.Right};

	return (
		<div
			className={cn(
				"wwc:flex wwc:w-[190px] wwc:flex-col wwc:rounded-lg wwc:border wwc:bg-card wwc:text-card-foreground wwc:shadow-sm",
				compact ? "wwc:gap-1 wwc:px-2.5 wwc:py-1.5" : "wwc:gap-1.5 wwc:px-3 wwc:py-2.5",
				TONE_BORDER[tone],
				// Selection has to be visible on a tinted node as well as a plain one, so it is a ring
				// rather than a border swap.
				selected && "wwc:ring-2 wwc:ring-primary wwc:ring-offset-1 wwc:ring-offset-background",
			)}
		>
			<Handle type="target" position={sides.target} isConnectable={isConnectable} className={HANDLE_CLASS} />

			{node.kind || node.status ? (
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-1.5">
					{node.kind ? (
						<span className="wwc:truncate wwc:text-[10px] wwc:font-medium wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
							{node.kind}
						</span>
					) : (
						<span />
					)}
					{node.status ? (
						<Badge variant={TONE_BADGE[tone]} className="wwc:h-4 wwc:shrink-0 wwc:px-1.5 wwc:text-[10px]">
							{node.status}
						</Badge>
					) : null}
				</div>
			) : null}

			<div className="wwc:flex wwc:items-start wwc:gap-1.5">
				{node.icon ? (
					<span className="wwc:mt-0.5 wwc:shrink-0 wwc:text-muted-foreground wwc:[&_svg]:size-3.5">{node.icon}</span>
				) : null}
				<div className="wwc:min-w-0 wwc:flex-1">
					<p className={cn("wwc:truncate wwc:font-medium", compact ? "wwc:text-[11px]" : "wwc:text-xs")}>
						{node.label}
					</p>
					{node.description ? (
						<p className="wwc:truncate wwc:text-[10px] wwc:text-muted-foreground">{node.description}</p>
					) : null}
				</div>
			</div>

			{node.footer ? <div className="wwc:text-[10px] wwc:text-muted-foreground">{node.footer}</div> : null}

			<Handle type="source" position={sides.source} isConnectable={isConnectable} className={HANDLE_CLASS} />
		</div>
	);
}

const NODE_TYPES = {core: NodeGraphNodeCard};

// ─── States ──────────────────────────────────────────────────────────────────

/** Loading: node-shaped skeletons, so the canvas does not resize as the real graph arrives. */
function GraphSkeleton() {
	return (
		<div
			className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:gap-8 wwc:p-8"
			data-testid="node-graph-loading"
		>
			{[0, 1, 2].map((column) => (
				<div key={column} className="wwc:flex wwc:flex-col wwc:gap-4">
					{[0, 1].map((row) => (
						<Skeleton key={row} className="wwc:h-16 wwc:w-[190px] wwc:rounded-lg" />
					))}
				</div>
			))}
			<span className="wwc:sr-only">Loading the graph…</span>
		</div>
	);
}

// ─── The widget ──────────────────────────────────────────────────────────────

function NodeGraphInner<TNode, TEdge>({
	nodes,
	edges = [],
	layout = "layered",
	orientation = "horizontal",
	density = "comfortable",
	selectedNodeId,
	defaultSelectedNodeId = null,
	onSelectNode,
	selectable = true,
	movable = true,
	onNodeMove,
	connectable = false,
	onConnectNodes,
	viewport,
	defaultViewport,
	onViewportChange,
	loading = false,
	error = false,
	onRetry,
	emptyTitle = "Nothing to graph yet",
	emptyDescription,
	emptyAction,
	inspector,
	inspectorWidth = 320,
	toolbar,
	showZoomTools = true,
	showMiniMap = false,
	"aria-label": ariaLabel = "Node graph",
	className,
	style,
}: NodeGraphProps<TNode, TEdge>) {
	const flow = useReactFlow();
	const {zoom} = useViewport();

	const [internalSelected, setInternalSelected] = React.useState<string | null>(defaultSelectedNodeId);
	const activeId = selectedNodeId === undefined ? internalSelected : selectedNodeId;

	// Positions the user has dragged but the host has not yet persisted. Cleared the moment the
	// incoming positions change, so a re-layout from the host always wins over a stale drag.
	const [dragged, setDragged] = React.useState<Record<string, {x: number; y: number}>>({});
	const positionsKey = nodes.map((node) => `${node.id}:${node.position.x},${node.position.y}`).join("|");
	React.useEffect(() => {
		setDragged((current) => (Object.keys(current).length === 0 ? current : {}));
	}, [positionsKey]);

	const nodeById = React.useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

	const flowNodes = React.useMemo<Node[]>(
		() =>
			nodes.map((node) => ({
				id: node.id,
				type: "core",
				position: dragged[node.id] ?? node.position,
				selected: node.id === activeId,
				selectable: node.selectable ?? selectable,
				draggable: node.draggable ?? movable,
				connectable: node.connectable ?? connectable,
				className: NODE_WRAPPER_CLASS,
				ariaLabel: [node.kind, node.label, node.status].filter(Boolean).join(", "),
				data: {node, density, orientation} satisfies NodeCardData,
			})),
		[nodes, dragged, activeId, selectable, movable, connectable, density, orientation],
	);

	const flowEdges = React.useMemo<Edge[]>(
		() =>
			edges.map((edge) => ({
				id: edge.id,
				source: edge.source,
				target: edge.target,
				label: edge.label,
				animated: edge.animated,
				style: {
					stroke: TONE_STROKE[edge.tone ?? "neutral"],
					strokeWidth: 1.5,
					strokeDasharray: edge.dashed ? "6 4" : undefined,
				},
			})),
		[edges],
	);

	// One handler for both interactions the engine reports back: a drag in progress, and a selection
	// made by click or by keyboard. Everything else about the node list stays derived from props.
	const handleNodesChange = React.useCallback(
		(changes: NodeChange[]) => {
			for (const change of changes) {
				if (change.type === "position" && change.position) {
					const {id, position} = change;
					setDragged((current) => ({...current, [id]: position}));
				} else if (change.type === "select") {
					const next = change.selected ? change.id : null;
					// A deselect for a node that is no longer the selected one is the engine tidying up
					// after a swap; it must not clear the selection that replaced it.
					if (!change.selected && activeId !== change.id) continue;
					if (next === activeId) continue;
					if (selectedNodeId === undefined) setInternalSelected(next);
					onSelectNode?.(next, next ? nodeById.get(next) : undefined);
				}
			}
		},
		[activeId, selectedNodeId, onSelectNode, nodeById],
	);

	const zoomIn = React.useCallback(() => flow.zoomIn({duration: 150}), [flow]);
	const zoomOut = React.useCallback(() => flow.zoomOut({duration: 150}), [flow]);
	const fit = React.useCallback(() => flow.fitView({padding: 0.12, duration: 200}), [flow]);
	const zoomTo = React.useCallback((level: number) => flow.zoomTo(level, {duration: 150}), [flow]);
	/** Reset is not Fit: it returns the graph to 100%, centred — the scale the nodes were drawn for. */
	const reset = React.useCallback(() => {
		if (defaultViewport) {
			flow.setViewport(defaultViewport, {duration: 200});
			return;
		}
		const bounds = flow.getNodesBounds(flow.getNodes());
		flow.setCenter(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, {zoom: 1, duration: 200});
	}, [flow, defaultViewport]);

	const state = loading ? "loading" : error ? "error" : nodes.length === 0 ? "empty" : "ready";

	return (
		<div
			className={cn("wwc:flex wwc:h-full wwc:min-h-0 wwc:w-full wwc:flex-col wwc:overflow-hidden", className)}
			style={style}
		>
			{showZoomTools || toolbar ? (
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-2 wwc:border-b wwc:px-2 wwc:py-1">
					<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1.5">{toolbar}</div>
					{showZoomTools ? (
						<div className="wwc:flex wwc:shrink-0 wwc:items-center">
							<ZoomTools
								variant="bare"
								zoomLevel={zoom}
								minZoom={MIN_ZOOM}
								maxZoom={MAX_ZOOM}
								onZoomIn={zoomIn}
								onZoomOut={zoomOut}
								onFit={fit}
								onZoomChange={zoomTo}
								// Every action needs the canvas to have something to act on.
								{...(state === "ready" ? {} : {canZoomIn: false, canZoomOut: false})}
							/>
							<Button
								variant="ghost"
								size="sm"
								className="wwc:h-9 wwc:gap-1.5 wwc:px-2 wwc:text-muted-foreground wwc:hover:text-foreground"
								onClick={reset}
								disabled={state !== "ready"}
							>
								<RotateCcw />
								Reset
							</Button>
						</div>
					) : null}
				</div>
			) : null}

			{/* Rail on desktop, stacked block below 1024px — at 820px a 320px rail would leave the graph
			    too little room, and the inspector is content, not a sidebar. */}
			<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:lg:flex-row">
				<div className="wwc:relative wwc:min-h-0 wwc:min-w-0 wwc:flex-1">
					{state === "ready" ? (
						<GraphCanvas
							withProvider={false}
							showControls={false}
							showMiniMap={showMiniMap}
							layout={layout}
							nodes={flowNodes}
							edges={flowEdges}
							minZoom={MIN_ZOOM}
							maxZoom={MAX_ZOOM}
							nodeTypes={NODE_TYPES}
							onNodesChange={handleNodesChange}
							onNodeDragStop={(_event, node) => {
								const source = nodeById.get(node.id);
								if (source) onNodeMove?.(node.id, node.position, source);
							}}
							nodesConnectable={connectable}
							onConnect={(connection: Connection) => {
								if (connection.source && connection.target) {
									onConnectNodes?.({source: connection.source, target: connection.target});
								}
							}}
							onPaneClick={() => {
								if (activeId === null) return;
								if (selectedNodeId === undefined) setInternalSelected(null);
								onSelectNode?.(null, undefined);
							}}
							// A controlled viewport takes the framing away from the canvas entirely.
							{...(viewport ? {viewport, fitView: false} : defaultViewport ? {defaultViewport, fitView: false} : {})}
							onViewportChange={onViewportChange}
							aria-label={ariaLabel}
						/>
					) : state === "loading" ? (
						<GraphSkeleton />
					) : state === "error" ? (
						<Empty
							icon={<TriangleAlert className="wwc:h-8 wwc:w-8" />}
							title="Couldn't load the graph"
							description={typeof error === "string" ? error : "The graph could not be loaded."}
							action={
								onRetry ? (
									<Button variant="outline" size="sm" onClick={onRetry}>
										Retry
									</Button>
								) : undefined
							}
						/>
					) : (
						<Empty
							icon={<Network className="wwc:h-8 wwc:w-8" />}
							title={emptyTitle}
							description={emptyDescription}
							action={emptyAction}
						/>
					)}
				</div>

				{inspector ? (
					<aside
						className="wwc:min-h-0 wwc:shrink-0 wwc:overflow-auto wwc:border-t wwc:lg:border-t-0 wwc:lg:border-l"
						style={{width: "100%", maxWidth: "100%", flexBasis: inspectorWidth}}
					>
						{inspector}
					</aside>
				) : null}
			</div>
		</div>
	);
}

/**
 * A functional node graph — pipeline wiring, a process lifecycle, an analysis readiness map, a
 * lineage DAG — described as typed nodes and edges rather than drawn.
 *
 * The widget owns the interaction contract: pan, pointer-centred zoom with the ZoomTools row (zoom
 * in/out, an editable percentage, fit and reset), selection by click or keyboard, node movement,
 * optional edge creation, the empty/loading/error states, and the inspector handoff for whatever the
 * host shows about the current selection.
 *
 * It needs a container with a resolved height; in one with none it collapses to a 0px strip.
 *
 * ```tsx
 * <NodeGraph
 *   nodes={[{id: "src", label: "Site telemetry", kind: "Datasource", position: {x: 0, y: 0}}]}
 *   edges={[{id: "e1", source: "src", target: "clean"}]}
 *   selectedNodeId={selected}
 *   onSelectNode={setSelected}
 *   inspector={selected ? <Evidence id={selected} /> : null}
 * />
 * ```
 */
export function NodeGraph<TNode = unknown, TEdge = unknown>(props: NodeGraphProps<TNode, TEdge>) {
	// The zoom row and the inspector live outside the canvas element but inside its context, so the
	// provider is mounted here and the canvas is told not to mount a second one.
	return (
		<ReactFlowProvider>
			<NodeGraphInner {...props} />
		</ReactFlowProvider>
	);
}
