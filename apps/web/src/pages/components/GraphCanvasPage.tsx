import {Handle, type NodeProps, Position} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {GraphCanvas} from "@/components/ui/graph-canvas";

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

export function GraphCanvasPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">GraphCanvas</h1>
					<CopyButton
						value="GraphCanvas"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Themed node-and-edge canvas: dotted background, controls, optional minimap, and the house viewport defaults
					for a layered DAG.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>
						The <code>layered</code> default: orthogonal <code>smoothstep</code> edges, because bezier curves swoop out
						of their lane and cross each other between the last two columns.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[320px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
						<GraphCanvas nodes={LAYERED_NODES} edges={LAYERED_EDGES} nodeTypes={NODE_TYPES} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Free layout with minimap</CardTitle>
					<CardDescription>
						<code>layout="free"</code> drops the DAG defaults for a radial graph the user navigates, and that graph
						earns a minimap — a fitted DAG does not, since it always frames itself.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[320px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
						<GraphCanvas nodes={RADIAL_NODES} edges={RADIAL_EDGES} nodeTypes={NODE_TYPES} layout="free" showMiniMap />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Needs a resolved height</CardTitle>
					<CardDescription>
						In a container with no resolved height the canvas collapses to a 0px strip. Give it a fixed height, or a{" "}
						<code>min-h-0</code> chain all the way down a flex column.
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	);
}
