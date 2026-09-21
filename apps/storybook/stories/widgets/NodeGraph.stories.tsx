import type {NodeGraphEdge, NodeGraphNode} from "@core/core-ui/node-graph";
import type {Meta, StoryObj} from "storybook/internal/types";

import {Controls, Description, Primary, Stories, Subtitle, Title} from "@storybook/addon-docs/blocks";
import {Badge} from "@core/core-ui/badge";
import {Button} from "@core/core-ui/button";
import {Card} from "@core/core-ui/card";
import {NodeGraph} from "@core/core-ui/node-graph";
import {Database, FileCheck, Filter, GitBranch, Layers, Play, Table2} from "lucide-react";
import {useState} from "react";

import nodeGraphManifest from "../../../../manifests/node-graph.widget.json";
import {ComponentKnowledge} from "../_docs/ComponentKnowledge";
import {WidgetManifestPanel} from "../_docs/WidgetManifestPanel";

function NodeGraphDocsPage() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<ComponentKnowledge />
			<WidgetManifestPanel manifest={nodeGraphManifest} />
			<Primary />
			<Controls />
			<Stories />
		</>
	);
}

const meta = {
	title: "Widgets/Canvas/Node Graph",
	component: NodeGraph,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			page: NodeGraphDocsPage,
			description: {
				component:
					"The functional node graph four Connect journeys had each rebuilt on a raw graph engine — the pipeline builder, the " +
					"process lifecycle, the analysis readiness map and product lineage. Nodes are **described**, not rendered: a caller " +
					"passes label / kind / status / tone and the widget draws the box, which is what keeps four graphs in one visual " +
					"language. It owns the interaction contract too — pan and pointer-centred zoom, the ZoomTools row (zoom in/out, an " +
					"editable percentage, fit and reset), selection by click or keyboard, node movement, optional edge creation, the " +
					"empty/loading/error states, and the inspector handoff. **It needs a container with a resolved height.**",
			},
		},
	},
	decorators: [
		(Story) => (
			<Card className="wwc:h-[460px] wwc:overflow-hidden">
				<Story />
			</Card>
		),
	],
} satisfies Meta<typeof NodeGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Fixtures ────────────────────────────────────────────────────────────────

const PIPELINE_NODES: NodeGraphNode[] = [
	{
		id: "telemetry",
		label: "Site telemetry",
		kind: "Datasource",
		description: "core.raw.telemetry",
		icon: <Database />,
		position: {x: 0, y: 40},
	},
	{
		id: "badges",
		label: "Badge reads",
		kind: "Datasource",
		description: "core.raw.badges",
		icon: <Database />,
		position: {x: 0, y: 180},
	},
	{
		id: "normalise",
		label: "Normalise",
		kind: "Transform",
		status: "Running",
		tone: "accent",
		icon: <Filter />,
		position: {x: 250, y: 110},
	},
	{
		id: "attendance",
		label: "Attendance",
		kind: "Object type",
		status: "Published",
		tone: "success",
		icon: <Table2 />,
		position: {x: 500, y: 40},
	},
	{
		id: "productivity",
		label: "Productivity",
		kind: "Projection",
		status: "Stale",
		tone: "warning",
		icon: <Layers />,
		position: {x: 500, y: 180},
	},
];

const PIPELINE_EDGES: NodeGraphEdge[] = [
	{id: "e1", source: "telemetry", target: "normalise"},
	{id: "e2", source: "badges", target: "normalise"},
	{id: "e3", source: "normalise", target: "attendance", tone: "success"},
	{id: "e4", source: "normalise", target: "productivity", tone: "warning", dashed: true, label: "stale"},
];

const LIFECYCLE_NODES: NodeGraphNode[] = [
	{id: "draft", label: "Draft", kind: "Start", position: {x: 120, y: 0}, icon: <Play />},
	{
		id: "review",
		label: "HSE review",
		kind: "Approval",
		status: "3 waiting",
		tone: "accent",
		position: {x: 120, y: 120},
	},
	{id: "issued", label: "Issued", kind: "Active", status: "On site", tone: "success", position: {x: 0, y: 250}},
	{id: "rejected", label: "Rejected", kind: "Terminal", status: "Ends", tone: "danger", position: {x: 250, y: 250}},
];

const LIFECYCLE_EDGES: NodeGraphEdge[] = [
	{id: "l1", source: "draft", target: "review", label: "submit"},
	{id: "l2", source: "review", target: "issued", label: "approve", tone: "success"},
	{id: "l3", source: "review", target: "rejected", label: "reject", tone: "danger"},
];

// ─── Stories ─────────────────────────────────────────────────────────────────

/** A pipeline: layered DAG, semantic status on every node, tone carried through to the edges. */
export const Default: Story = {
	args: {
		nodes: PIPELINE_NODES,
		edges: PIPELINE_EDGES,
	},
};

/**
 * The journey the widget exists for: pick a node, and the host renders whatever it knows about it in
 * the inspector rail. Selection is controlled here, so the host owns which node is current.
 */
export const WithInspector: Story = {
	args: {nodes: PIPELINE_NODES, edges: PIPELINE_EDGES},
	render: (args) => {
		const [selected, setSelected] = useState<string | null>("normalise");
		const node = args.nodes.find((candidate) => candidate.id === selected);

		return (
			<NodeGraph
				{...args}
				selectedNodeId={selected}
				onSelectNode={setSelected}
				toolbar={<Badge variant="neutralSoft">Pipeline · attendance-v3</Badge>}
				inspector={
					<div className="wwc:space-y-3 wwc:p-4">
						{node ? (
							<>
								<div>
									<p className="wwc:text-sm wwc:font-semibold">{node.label}</p>
									<p className="wwc:text-xs wwc:text-muted-foreground">{node.kind}</p>
								</div>
								<dl className="wwc:space-y-1.5 wwc:text-xs">
									<div className="wwc:flex wwc:justify-between wwc:gap-3">
										<dt className="wwc:text-muted-foreground">Status</dt>
										<dd className="wwc:font-medium">{node.status ?? "—"}</dd>
									</div>
									<div className="wwc:flex wwc:justify-between wwc:gap-3">
										<dt className="wwc:text-muted-foreground">Address</dt>
										<dd className="wwc:font-medium">{node.description ?? "—"}</dd>
									</div>
								</dl>
								<Button variant="outline" size="sm" className="wwc:w-full wwc:gap-1.5">
									<FileCheck />
									Open evidence
								</Button>
							</>
						) : (
							<p className="wwc:text-sm wwc:text-muted-foreground">Select a node to see its evidence.</p>
						)}
					</div>
				}
			/>
		);
	},
};

/** A process lifecycle: `orientation="vertical"` moves the handles to top and bottom. */
export const VerticalLifecycle: Story = {
	args: {
		nodes: LIFECYCLE_NODES,
		edges: LIFECYCLE_EDGES,
		orientation: "vertical",
		toolbar: <Badge variant="neutralSoft">Process · Work permit</Badge>,
	},
};

/** `density="compact"` tightens the node padding and type scale for a graph with more on screen. */
export const Compact: Story = {
	args: {nodes: PIPELINE_NODES, edges: PIPELINE_EDGES, density: "compact"},
};

/** A lineage graph the user navigates rather than reads top-down: `layout="free"` plus the minimap. */
export const FreeLayoutWithMiniMap: Story = {
	args: {
		nodes: PIPELINE_NODES,
		edges: PIPELINE_EDGES,
		layout: "free",
		showMiniMap: true,
		toolbar: <Badge variant="neutralSoft">Lineage · Attendance</Badge>,
	},
};

/**
 * Authoring: `connectable` turns the handles into drag targets and `onConnectNodes` reports the link
 * the user drew. The edge list stays the caller's, so the new edge is added there.
 */
export const EdgeAuthoring: Story = {
	args: {nodes: PIPELINE_NODES, edges: PIPELINE_EDGES},
	render: (args) => {
		const [edges, setEdges] = useState(PIPELINE_EDGES);
		const [nodes, setNodes] = useState(PIPELINE_NODES);

		return (
			<NodeGraph
				{...args}
				nodes={nodes}
				edges={edges}
				connectable
				onConnectNodes={({source, target}) =>
					setEdges((current) =>
						current.some((edge) => edge.source === source && edge.target === target)
							? current
							: [...current, {id: `${source}-${target}`, source, target, tone: "accent"}],
					)
				}
				// Positions the user drags are the host's to keep — persist them and pass them back.
				onNodeMove={(id, position) =>
					setNodes((current) => current.map((node) => (node.id === id ? {...node, position} : node)))
				}
				toolbar={
					<span className="wwc:text-xs wwc:text-muted-foreground">Drag a handle onto another node to wire it</span>
				}
			/>
		);
	},
};

/** A fetch in flight — node-shaped skeletons, and the zoom actions parked until there is a graph. */
export const Loading: Story = {
	args: {nodes: [], loading: true},
};

/** A failed fetch, stated as a failure rather than as an empty graph, with the host's retry. */
export const ErrorState: Story = {
	args: {
		nodes: [],
		error: "The lineage service did not respond.",
		onRetry: () => {},
	},
};

/** Nothing to graph yet — the host supplies the wording and the way out. */
export const EmptyState: Story = {
	args: {
		nodes: [],
		emptyTitle: "No steps in this pipeline",
		emptyDescription: "Add a datasource to start wiring the pipeline.",
		emptyAction: (
			<Button size="sm" className="wwc:gap-1.5">
				<GitBranch />
				Add a step
			</Button>
		),
	},
};
