import type {Meta, StoryObj} from "storybook/internal/types";

import {Card} from "@corensystem/core-ui/card";
import {GraphCanvas} from "@corensystem/core-ui/graph-canvas";
import {Handle, type NodeProps, Position} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const LAYERED_NODES = [
	{id: "src", position: {x: 0, y: 60}, data: {label: "Datasource"}, type: "demo"},
	{id: "pipe", position: {x: 200, y: 60}, data: {label: "Pipeline"}, type: "demo"},
	{id: "ot", position: {x: 400, y: 10}, data: {label: "Object type"}, type: "demo"},
	{id: "proj", position: {x: 400, y: 120}, data: {label: "Projection"}, type: "demo"},
];
const LAYERED_EDGES = [
	{id: "e1", source: "src", target: "pipe"},
	{id: "e2", source: "pipe", target: "ot"},
	{id: "e3", source: "pipe", target: "proj"},
];

const RADIAL_NODES = [
	{id: "c", position: {x: 200, y: 100}, data: {label: "Permit"}, type: "demo"},
	{id: "n", position: {x: 200, y: 0}, data: {label: "Worker"}, type: "demo"},
	{id: "e", position: {x: 360, y: 110}, data: {label: "Site"}, type: "demo"},
	{id: "w", position: {x: 40, y: 110}, data: {label: "Observation"}, type: "demo"},
];
const RADIAL_EDGES = [
	{id: "r1", source: "c", target: "n"},
	{id: "r2", source: "c", target: "e"},
	{id: "r3", source: "c", target: "w"},
];

/**
 * A minimal node renderer. React Flow's built-in node chrome is zeroed by the library's CSS reset,
 * so every caller ships its own — these demos are no exception.
 */
function DemoNode({data}: NodeProps) {
	return (
		<div className="wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:px-3 wwc:py-2 wwc:text-xs wwc:font-medium wwc:text-card-foreground wwc:shadow-sm">
			<Handle type="target" position={Position.Left} className="wwc:!border-0 wwc:!bg-muted-foreground" />
			{String(data.label)}
			<Handle type="source" position={Position.Right} className="wwc:!border-0 wwc:!bg-muted-foreground" />
		</div>
	);
}

const NODE_TYPES = {demo: DemoNode};

const meta = {
	title: "Widgets/Canvas/Graph Canvas",
	component: GraphCanvas,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"The node-and-edge surface four Core graph views had each re-typed — the process state machine, the pipeline wiring, the data lineage DAG and the ontology graph explorer. They had already started to diverge: three passed `fitViewOptions={{padding: 0.12}}` and one did not, so the odd one framed its graph tighter than its siblings for no reason anybody chose. This owns only the chrome and those defaults; nodes, edges, handlers and `nodeTypes` stay with the caller, since every `ReactFlowProps` is forwarded. **It needs a container with a resolved height** — in a container with none it collapses to a 0px strip.",
			},
		},
	},
} satisfies Meta<typeof GraphCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The `layered` default: orthogonal `smoothstep` edges, because bezier curves swoop out of their
 * lane and cross each other between the last two columns.
 */
export const Default: Story = {
	render: () => (
		<Card className="wwc:h-[360px] wwc:overflow-hidden">
			<GraphCanvas nodes={LAYERED_NODES} edges={LAYERED_EDGES} nodeTypes={NODE_TYPES} />
		</Card>
	),
};

/** `layout="free"` drops the DAG defaults for a radial graph the user navigates, and earns a minimap. */
export const FreeWithMiniMap: Story = {
	render: () => (
		<Card className="wwc:h-[360px] wwc:overflow-hidden">
			<GraphCanvas nodes={RADIAL_NODES} edges={RADIAL_EDGES} nodeTypes={NODE_TYPES} layout="free" showMiniMap />
		</Card>
	),
};
