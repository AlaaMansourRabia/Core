import {expect, test} from "vitest";
import {render} from "vitest-browser-react";

import {GraphCanvas} from "./graph-canvas";

const NODES = [
	{id: "a", position: {x: 0, y: 0}, data: {label: "A"}},
	{id: "b", position: {x: 200, y: 0}, data: {label: "B"}},
];
const EDGES = [{id: "a-b", source: "a", target: "b"}];

test("GraphCanvas renders its nodes and the shared chrome", async () => {
	const {container} = await render(
		<div style={{width: 640, height: 400}}>
			<GraphCanvas nodes={NODES} edges={EDGES} />
		</div>,
	);
	expect(container.querySelector(".react-flow")).not.toBeNull();
	// Dotted background and controls come from the widget, not the call site.
	expect(container.querySelector(".react-flow__background")).not.toBeNull();
	expect(container.querySelector(".react-flow__controls")).not.toBeNull();
});

test("GraphCanvas hides the minimap by default and shows it on request", async () => {
	const plain = await render(
		<div style={{width: 640, height: 400}}>
			<GraphCanvas nodes={NODES} edges={EDGES} />
		</div>,
	);
	expect(plain.container.querySelector(".react-flow__minimap")).toBeNull();

	const withMap = await render(
		<div style={{width: 640, height: 400}}>
			<GraphCanvas nodes={NODES} edges={EDGES} showMiniMap />
		</div>,
	);
	expect(withMap.container.querySelector(".react-flow__minimap")).not.toBeNull();
});

test("GraphCanvas keeps the xyflow attribution visible", async () => {
	const {container} = await render(
		<div style={{width: 640, height: 400}}>
			<GraphCanvas nodes={NODES} edges={EDGES} />
		</div>,
	);
	// MIT terms hold only while the credit is shown — this must never be switched off.
	expect(container.querySelector(".react-flow__attribution")).not.toBeNull();
});

test("GraphCanvas renders children inside the canvas", async () => {
	const {container} = await render(
		<div style={{width: 640, height: 400}}>
			<GraphCanvas nodes={NODES} edges={EDGES}>
				<div data-panel>legend</div>
			</GraphCanvas>
		</div>,
	);
	const panel = container.querySelector("[data-panel]");
	expect(panel).not.toBeNull();
	expect(panel?.closest(".react-flow")).not.toBeNull();
});
