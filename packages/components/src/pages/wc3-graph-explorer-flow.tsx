import {
	BaseEdge,
	Controls,
	EdgeLabelRenderer,
	Handle,
	type InternalNode,
	type Edge,
	type Node,
	type NodeProps,
	Position,
	ReactFlowProvider,
	getStraightPath,
	useEdgesState,
	useInternalNode,
	useNodesState,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {useCallback, useEffect, useMemo, useState} from "react";
// React Flow ships its own positioning styles; without these the canvas does not lay out at all.

import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {GraphCanvas as Canvas} from "../graph-canvas";
import {
	WC3_LINK_TYPES,
	WC3_OBJECT_TYPES,
	type Wc3LinkType,
	type Wc3ObjectType,
	getObjectType,
	instanceLinkCount,
	linkTypeLabel,
} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";
import {scopeLinkTypes, scopeObjectTypes, type OntologyScope} from "./wc3-ontology-scope";

// The Graph explorer, built on React Flow (@xyflow/react, MIT). Replaced the hand-rolled SVG version
// after the two were compared: same data and the same radial seed layout, but nodes drag, the canvas
// pans and zooms, and there is a minimap. The surface owns the page height so selecting a node cannot
// resize the canvas — the side panel scrolls within itself instead.

/** Shorthand the prototype uses on graph edges: one-to-many → 1:N. */
const shortCardinality = (c: string) =>
	c.replace("one-to-", "1:").replace("many-to-", "N:").replace("many", "N").replace("one", "1");

type OntologyNodeData = {objectType: Wc3ObjectType; dimmed: boolean};

/**
 * A node rendered with Core's own tokens rather than React Flow's default chrome, so the canvas
 * reads as part of the design system. Handles are transparent — edges attach, but no dots show.
 */
function OntologyNode({data, selected}: NodeProps) {
	const {objectType, dimmed} = data as OntologyNodeData;
	return (
		<div
			className={`wwc:flex wwc:w-[168px] wwc:items-center wwc:gap-2 wwc:rounded-lg wwc:border wwc:px-3 wwc:py-2 wwc:transition-opacity ${
				selected
					? "wwc:border-primary wwc:bg-primary/10 wwc:ring-1 wwc:ring-primary"
					: "wwc:border-border wwc:bg-card wwc:hover:border-primary/50"
			} ${dimmed ? "wwc:opacity-25" : ""}`}
		>
			<Handle type="target" position={Position.Top} className="wwc:!bg-transparent wwc:!border-0" />
			<OntologyGlyph name={objectType.icon} color={objectType.color} className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
			<span className="wwc:truncate wwc:text-xs wwc:font-semibold">{objectType.displayName}</span>
			<Handle type="source" position={Position.Bottom} className="wwc:!bg-transparent wwc:!border-0" />
		</div>
	);
}

const NODE_TYPES = {ontology: OntologyNode};

/**
 * Where the straight line from `from` to `to` crosses `from`'s border. Fixed handles force every edge
 * to leave the same point, which is what produces the bezier hooks and the lines cutting over nodes;
 * anchoring on the facing border instead keeps each edge a straight centre-to-centre segment.
 */
function borderPoint(from: InternalNode<Node>, to: InternalNode<Node>) {
	const w = (from.measured.width ?? 0) / 2;
	const h = (from.measured.height ?? 0) / 2;
	const fx = from.internals.positionAbsolute.x + w;
	const fy = from.internals.positionAbsolute.y + h;
	const tx = to.internals.positionAbsolute.x + (to.measured.width ?? 0) / 2;
	const ty = to.internals.positionAbsolute.y + (to.measured.height ?? 0) / 2;

	const dx = tx - fx;
	const dy = ty - fy;
	if (dx === 0 && dy === 0) return {x: fx, y: fy};
	// Scale the direction vector until it touches whichever edge of the box it reaches first.
	const scale = Math.min(w / Math.abs(dx) || Infinity, h / Math.abs(dy) || Infinity);
	return {x: fx + dx * scale, y: fy + dy * scale};
}

/** A straight edge between two node borders, with the label parked at its midpoint. */
function FloatingEdge({
	id,
	source,
	target,
	style,
	data,
}: {
	id: string;
	source: string;
	target: string;
	style?: React.CSSProperties;
	data?: {label?: string};
}) {
	const sourceNode = useInternalNode(source);
	const targetNode = useInternalNode(target);
	if (!sourceNode || !targetNode) return null;

	const s = borderPoint(sourceNode, targetNode);
	const t = borderPoint(targetNode, sourceNode);
	const [path, labelX, labelY] = getStraightPath({sourceX: s.x, sourceY: s.y, targetX: t.x, targetY: t.y});

	return (
		<>
			<BaseEdge id={id} path={path} style={style} />
			{data?.label ? (
				<EdgeLabelRenderer>
					<div
						style={{transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, opacity: style?.opacity}}
						className="wwc:pointer-events-none wwc:absolute wwc:rounded wwc:bg-background/85 wwc:px-1 wwc:text-[10px] wwc:text-muted-foreground"
					>
						{data.label}
					</div>
				</EdgeLabelRenderer>
			) : null}
		</>
	);
}

const EDGE_TYPES = {floating: FloatingEdge};

/** Radial seed layout — a readable starting arrangement that the user can then drag apart. */
function radialLayout(types: Wc3ObjectType[]) {
	const r = 420;
	return Object.fromEntries(
		types.map((o, i) => {
			const angle = (2 * Math.PI * i) / types.length - Math.PI / 2;
			return [o.id, {x: r + r * Math.cos(angle), y: r + r * Math.sin(angle)}];
		}),
	);
}

function GraphCanvas({onSelect, scope}: {onSelect: (id: string | null) => void; scope?: OntologyScope}) {
	// The lint decoy is excluded, as in the prototype — it has no real relationships.
	// Scoping narrows the canvas to one product's slice; omitted, this is the whole ontology.
	const types = useMemo(() => scopeObjectTypes(WC3_OBJECT_TYPES, scope).filter((o) => !o.isLintDecoy), [scope]);
	// Edges come from the SAME derivation the Link types table uses, so the canvas can never draw a
	// relationship the product's own tab does not list.
	const scopedLinks = useMemo(() => scopeLinkTypes(WC3_LINK_TYPES, scope), [scope]);
	const [selected, setSelected] = useState<string | null>(null);
	const {fitView} = useReactFlow();

	const neighbours = useMemo(() => {
		if (!selected) return new Set<string>();
		const set = new Set<string>();
		scopedLinks.forEach((l) => {
			if (l.sideA.objectTypeId === selected) set.add(l.sideB.objectTypeId);
			if (l.sideB.objectTypeId === selected) set.add(l.sideA.objectTypeId);
		});
		return set;
	}, [selected, scopedLinks]);

	const initialNodes: Node[] = useMemo(() => {
		const pos = radialLayout(types);
		return types.map((o) => ({
			id: o.id,
			type: "ontology",
			position: pos[o.id],
			data: {objectType: o, dimmed: false} satisfies OntologyNodeData,
		}));
	}, [types]);

	const initialEdges: Edge[] = useMemo(
		() =>
			scopedLinks
				.filter((l) => types.some((t) => t.id === l.sideA.objectTypeId))
				.filter((l) => types.some((t) => t.id === l.sideB.objectTypeId))
				.map((l) => {
					const links = instanceLinkCount(l.id);
					return {
						id: l.id,
						type: "floating",
						source: l.sideA.objectTypeId,
						target: l.sideB.objectTypeId,
						data: {label: `${l.sideA.displayName} · ${shortCardinality(l.cardinality)}${links ? ` · ${links}` : ""}`},
						style: {stroke: "var(--wwc-color-border)"},
					} satisfies Edge;
				}),
		[types, scopedLinks],
	);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Dim everything outside the selection's neighbourhood, and light up its edges.
	useEffect(() => {
		setNodes((ns) =>
			ns.map((n) => ({
				...n,
				selected: n.id === selected,
				data: {...(n.data as OntologyNodeData), dimmed: !!selected && n.id !== selected && !neighbours.has(n.id)},
			})),
		);
		setEdges((es) =>
			es.map((e) => {
				const lit = !selected || e.source === selected || e.target === selected;
				return {
					...e,
					animated: !!selected && lit,
					style: {stroke: lit ? "var(--wwc-color-primary)" : "var(--wwc-color-border)", opacity: lit ? 1 : 0.15},
				};
			}),
		);
	}, [selected, neighbours, setNodes, setEdges]);

	useEffect(() => onSelect(selected), [selected, onSelect]);

	return (
		<Canvas
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			nodeTypes={NODE_TYPES}
			edgeTypes={EDGE_TYPES}
			onNodeClick={(_, node) => setSelected((cur) => (cur === node.id ? null : node.id))}
			onPaneClick={() => setSelected(null)}
			layout="free"
			showMiniMap
			onFitView={() => fitView({duration: 300})}
			withProvider={false}
		>
			<Controls showInteractive={false} onFitView={() => fitView({duration: 300})} />
		</Canvas>
	);
}

/**
 * `scope` narrows the canvas to one product's slice of the ontology; omit it for the whole graph,
 * which is what the administrator workspace renders. Typed loosely rather than importing
 * OntologyViewProps because wc3-ontology-views.tsx imports THIS file — naming its props type here
 * would close an import cycle.
 */
export function GraphExplorerFlowView({scope}: {scope?: OntologyScope} = {}) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const onSelect = useCallback((id: string | null) => setSelectedId(id), []);

	const selectedType = selectedId ? getObjectType(selectedId) : undefined;
	// Scoped, so the side panel cannot list a relationship the canvas does not draw.
	const selectedLinks: Wc3LinkType[] = useMemo(
		() =>
			selectedId
				? scopeLinkTypes(WC3_LINK_TYPES, scope).filter(
						(l) => l.sideA.objectTypeId === selectedId || l.sideB.objectTypeId === selectedId,
					)
				: [],
		[selectedId, scope],
	);

	return (
		// h-full + min-h-0 all the way down: the canvas keeps the page's height regardless of how much
		// the side panel holds, and the panel scrolls inside itself instead of stretching the row.
		<div className="wwc:grid wwc:min-h-0 wwc:flex-1 wwc:gap-4 wwc:overflow-hidden wwc:px-6 wwc:pb-6 wwc:pt-4 wwc:lg:grid-cols-[minmax(0,1fr)_20rem]">
			<Card className="wwc:min-h-0 wwc:overflow-hidden">
				<ReactFlowProvider>
					<GraphCanvas onSelect={onSelect} scope={scope} />
				</ReactFlowProvider>
			</Card>

			<Card className="wwc:flex wwc:min-h-0 wwc:flex-col wwc:overflow-hidden">
				<CardHeader className="wwc:shrink-0">
					<CardTitle className="wwc:text-sm">{selectedType ? selectedType.displayName : "No selection"}</CardTitle>
				</CardHeader>
				<CardContent className="wwc:min-h-0 wwc:flex-1 wwc:overflow-y-auto">
					{!selectedType ? (
						<p className="wwc:text-sm wwc:text-muted-foreground">
							Click a node to highlight its neighbourhood. Drag nodes to rearrange, scroll to zoom, drag the canvas to
							pan.
						</p>
					) : (
						<div className="wwc:space-y-3">
							<p className="wwc:text-xs wwc:text-muted-foreground">{selectedType.description}</p>
							<div className="wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
								{selectedLinks.length} link type{selectedLinks.length === 1 ? "" : "s"}
							</div>
							<ul className="wwc:space-y-2">
								{selectedLinks.map((l) => {
									const other = getObjectType(
										l.sideA.objectTypeId === selectedId ? l.sideB.objectTypeId : l.sideA.objectTypeId,
									);
									return (
										<li key={l.id} className="wwc:rounded-md wwc:border wwc:border-border wwc:p-2">
											<span className="wwc:text-sm wwc:font-medium">{linkTypeLabel(l)}</span>
											<div className="wwc:mt-1 wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-[11px] wwc:text-muted-foreground">
												<Badge variant="neutralSoft">{l.cardinality}</Badge>
												<span>→ {other?.displayName ?? "deleted"}</span>
											</div>
										</li>
									);
								})}
							</ul>
							<Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>
								Clear selection
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
