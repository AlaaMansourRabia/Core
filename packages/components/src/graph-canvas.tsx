import type {ReactFlowProps} from "@xyflow/react";

import {Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider} from "@xyflow/react";
import * as React from "react";
// React Flow's own stylesheet, loaded ONCE from the module that owns the dependency. It survives the
// tsdown build (verified in dist/graph-canvas.mjs), so a caller that renders a GraphCanvas gets it
// without importing anything itself — which is what lets the pages in this repo stop importing it.
import "@xyflow/react/dist/style.css";

// ─── The React Flow surface Core owns ────────────────────────────────────
//
// Everything a canvas page needs from `@xyflow/react` is re-exported here, so a page imports
// Core and nothing else. Nothing is renamed and nothing is wrapped: these ARE React Flow's
// primitives, and pretending otherwise behind Core-sounding aliases would only make the next
// person open two files to find the real documentation. What changes is the DOOR — one module owns
// the dependency, its stylesheet and its version, so a page cannot quietly pick up a second copy of
// React Flow's context or drift onto an API this canvas has not adopted.
//
// The provider, the viewport defaults, the colour mode, the dotted ground and the Controls are NOT
// here: those are the chrome, and the chrome is the component below.

/** A node on the canvas. */
export type {Node, Edge, NodeProps, EdgeProps, Connection, FinalConnectionState} from "@xyflow/react";

/** The engine's report of what changed about a node — a drag, a selection, a removal. */
export type {NodeChange, EdgeChange, Viewport, XYPosition} from "@xyflow/react";

/**
 * `Handle` is a node's connection point; `Position` names the side it sits on. A custom node
 * component renders these itself — React Flow has no way to place them for you.
 */
export {Handle, Position} from "@xyflow/react";

/** Arrowhead shapes for an edge's `markerStart` / `markerEnd`. */
export {MarkerType} from "@xyflow/react";

/**
 * An overlay pinned to a corner of the canvas, above the graph and inside the pan/zoom surface.
 * Render it as a child of {@link GraphCanvas}.
 */
export {Panel} from "@xyflow/react";

/**
 * The controlled node and edge collections, with the change handlers React Flow needs to own drag,
 * selection and removal while the record stays the source of truth between gestures.
 */
export {useNodesState, useEdgesState} from "@xyflow/react";

/**
 * The live canvas instance — `fitView`, zoom, viewport. Only valid inside a {@link GraphCanvas},
 * which supplies the provider it reads.
 */
export {useReactFlow} from "@xyflow/react";

/**
 * The current pan and zoom, re-rendering on every viewport change — what a zoom readout outside the
 * canvas reads. Like {@link useReactFlow}, only valid inside a provider.
 */
export {useViewport} from "@xyflow/react";

/**
 * The canvas context. {@link GraphCanvas} mounts one itself; render this yourself only to put your
 * own chrome — a zoom control, an inspector — beside the canvas and inside the same context, then
 * pass `withProvider={false}` so there is exactly one.
 */
export {ReactFlowProvider} from "@xyflow/react";

/**
 * The node-and-edge surface every Core graph view had grown its own copy of.
 *
 * Four canvases — the process state machine, the pipeline wiring, the data lineage DAG and the
 * ontology graph explorer — each re-typed the same provider, the same dotted background, the same
 * `Controls`, and the same viewport defaults. They had already started to diverge: three passed
 * `fitViewOptions={{padding: 0.12}}` and one did not, so the odd one framed its graph tighter than
 * its siblings for no reason anybody chose.
 *
 * This owns only the chrome and those defaults. Nodes, edges, handlers and `nodeTypes` stay with the
 * caller — every `ReactFlowProps` is forwarded — because that is where the domain lives.
 *
 * The defaults suit a **layered DAG**: `smoothstep` edges, because bezier curves swoop out of their
 * lane and cross each other between the last two columns, while orthogonal segments stay inside the
 * gap between layers and read as wiring. Pass `layout="free"` to drop them — a free-form radial
 * graph wants that, and so does the process state machine, which runs backwards and loops onto
 * itself and is on React Flow's own default bezier for exactly that reason.
 *
 * ```tsx
 * <GraphCanvas nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} onNodeClick={select} />
 * ```
 *
 * **Nodes are the caller's.** React Flow's built-in `default` / `input` / `output` renderers print
 * `data.label` and nothing else, so a canvas with anything more to say ships its own component. Two
 * ways to do that, and the choice is a visual one: register it under a name of your own for a box
 * you style end to end, or under the `default` key to keep the library's node CSS — fill, border,
 * radius, 150px width, centred 12px text, hover and selected shadow — and supply only the content
 * and the handles. The process state machine takes the second route; see `ProcessFlowNode`.
 */

export interface GraphCanvasProps extends Omit<ReactFlowProps, "children"> {
	/**
	 * `"layered"` (default) is a left-to-right or top-down DAG: orthogonal `smoothstep` edges and a
	 * padded `fitView` that frames the whole graph on mount. `"free"` is a radial or force-placed
	 * graph the user navigates — no edge-type default and no fit padding, since there is no lane
	 * structure to respect.
	 */
	layout?: "layered" | "free";
	/** Show the pannable/zoomable minimap. Off by default — see the note on `MiniMap` below. */
	showMiniMap?: boolean;
	/**
	 * Show React Flow's own zoom/fit `Controls`. On by default. Turn it off when the surrounding
	 * chrome already owns those actions — two fit buttons on one canvas is one too many.
	 */
	showControls?: boolean;
	/** Called by the Controls' fit-view button, for a canvas that wants an animated re-fit. */
	onFitView?: () => void;
	/** Rendered inside the canvas, after the chrome — panels, overlays, legends. */
	children?: React.ReactNode;
	/** Wrap in a `ReactFlowProvider`. Set false when the caller already owns one. Default true. */
	withProvider?: boolean;
}

/**
 * The host's colour mode, read from the `dark` class Core toggles on `<html>` and kept in sync as
 * it flips.
 *
 * React Flow scopes its own chrome — node fill and border, edge stroke, the Controls buttons, the
 * MiniMap — under `.react-flow.dark`, and its `colorMode` prop is the only supported way to put that
 * class on the canvas. A canvas whose nodes are React Flow's own (see the note below) would otherwise
 * paint white boxes with near-black borders on a near-black page. SSR-safe: resolves to "light" when
 * there is no `document`.
 */
function useColorMode(): "light" | "dark" {
	const [mode, setMode] = React.useState<"light" | "dark">(() =>
		typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light",
	);
	React.useEffect(() => {
		if (typeof document === "undefined") return;
		const root = document.documentElement;
		const sync = () => setMode(root.classList.contains("dark") ? "dark" : "light");
		sync();
		const observer = new MutationObserver(sync);
		observer.observe(root, {attributes: true, attributeFilter: ["class"]});
		return () => observer.disconnect();
	}, []);
	return mode;
}

/**
 * The canvas ground, lifted from reactflow.dev's own example theme (`xy-theme.css`), which sets
 * `--xy-background-color` to these two values.
 *
 * React Flow's library default is `transparent` in light mode — right for their white docs page, but
 * here it would show the Card underneath and leave the dotted grid sitting on nothing. Setting THEIR
 * variable rather than a `background-color` of our own keeps the library's own rule in charge, and
 * keeps the dots — which read `--xy-background-pattern-dots-color-default`, #91919a light / #555
 * dark — on the ground those greys were picked against.
 */
const XY_EXAMPLE_GROUND = {light: "#f7f9fb", dark: "#101012"} as const;

/**
 * What a SELECTED node looks like.
 *
 * React Flow's own answer is `0 0 0 0.5px #1a192b` — half a pixel of near-black, which on a white
 * node in a quiet graph is readable and on a tinted one is invisible. Clicking a node has to say so.
 *
 * Set as React Flow's OWN variable rather than a rule of ours, so nothing about how a node renders
 * changes: the library still owns when the ring appears, on which element, and at what radius. Its
 * CSS scopes this to the built-in node type names, so it reaches a node registered under `default`
 * (the process state machine's) and leaves a canvas with fully custom node components alone. The
 * same declaration covers `:focus-visible`, so a keyboard user gets the identical ring for free.
 *
 * The ring is the primary token, not a fixed colour, so it follows the theme; the lift underneath it
 * is what separates "picked" from "merely outlined" at a glance.
 */
const XY_NODE_SELECTED_SHADOW = "0 0 0 2px var(--wwc-color-primary), 0 2px 10px -3px rgb(0 0 0 / 0.25)";

/** Themed `@xyflow/react` surface: dotted background, controls, and the house viewport defaults. */
export function GraphCanvas({
	layout = "layered",
	showMiniMap = false,
	showControls = true,
	onFitView,
	withProvider = true,
	className,
	children,
	style,
	...flow
}: GraphCanvasProps) {
	const colorMode = useColorMode();
	const canvas = (
		<ReactFlow
			// A layered DAG gets orthogonal wiring; a free graph keeps React Flow's own default.
			{...(layout === "layered" ? {defaultEdgeOptions: {type: "smoothstep"}, fitViewOptions: {padding: 0.12}} : {})}
			fitView
			minZoom={0.2}
			// Before the spread, so a caller can still pin a canvas to one mode.
			colorMode={colorMode}
			// Attribution stays visible: @xyflow/react is MIT only while the credit is shown.
			proOptions={{hideAttribution: false}}
			className={className}
			// Spread last so a caller can pin its own ground; the library's rule reads this variable.
			style={
				{
					["--xy-background-color"]: XY_EXAMPLE_GROUND[colorMode],
					["--xy-node-boxshadow-selected"]: XY_NODE_SELECTED_SHADOW,
					...style,
				} as React.CSSProperties
			}
			{...flow}
		>
			{/* No colour prop and no className: the dot fill comes from
			    --xy-background-pattern-dots-color-default, never from `currentColor`, so a text-colour
			    class here paints nothing. The default greys are the ones the examples use. */}
			<Background variant={BackgroundVariant.Dots} gap={16} size={1} />
			{showControls ? <Controls showInteractive={false} onFitView={onFitView} /> : null}
			{/* Off by default on purpose: a fitted DAG always frames itself, so a minimap only
			    duplicates what is already on screen and covers the last column. It earns its place on a
			    free-form graph you actually navigate. */}
			{showMiniMap ? <MiniMap pannable zoomable nodeStrokeWidth={2} className="wwc:!bg-card" /> : null}
			{children}
		</ReactFlow>
	);

	return withProvider ? <ReactFlowProvider>{canvas}</ReactFlowProvider> : canvas;
}
