import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {NodeGraph, type NodeGraphEdge, type NodeGraphNode} from "./node-graph";

const NODES: NodeGraphNode[] = [
	{id: "src", label: "Site telemetry", kind: "Datasource", position: {x: 0, y: 0}},
	{id: "clean", label: "Normalise", kind: "Transform", status: "Failed", tone: "danger", position: {x: 240, y: 0}},
];
const EDGES: NodeGraphEdge[] = [{id: "e1", source: "src", target: "clean"}];

function Frame({children}: {children: React.ReactNode}) {
	return <div style={{width: 720, height: 420}}>{children}</div>;
}

test("NodeGraph draws the nodes it is given, chrome and all", async () => {
	const {container} = await render(
		<Frame>
			<NodeGraph nodes={NODES} edges={EDGES} />
		</Frame>,
	);

	await expect.element(page.getByText("Site telemetry")).toBeInTheDocument();
	await expect.element(page.getByText("Datasource")).toBeInTheDocument();
	await expect.element(page.getByText("Failed")).toBeInTheDocument();
	expect(container.querySelectorAll(".react-flow__node").length).toBe(2);
	expect(container.querySelectorAll(".react-flow__edge").length).toBe(1);
	// The engine's own Controls are off — the zoom row owns those actions.
	expect(container.querySelector(".react-flow__controls")).toBeNull();
});

test("NodeGraph carries the zoom contract: in, out, an editable percentage, fit and reset", async () => {
	await render(
		<Frame>
			<NodeGraph nodes={NODES} edges={EDGES} />
		</Frame>,
	);

	await expect.element(page.getByRole("button", {name: "Zoom in"})).toBeInTheDocument();
	await expect.element(page.getByRole("button", {name: "Zoom out"})).toBeInTheDocument();
	await expect.element(page.getByRole("textbox", {name: "Zoom percentage"})).toBeInTheDocument();
	await expect.element(page.getByRole("button", {name: "Fit to view"})).toBeInTheDocument();
	await expect.element(page.getByRole("button", {name: "Reset"})).toBeInTheDocument();
});

// The library stylesheet is not loaded in browser tests, so the canvas has no resolved height and a
// node's on-screen box is not a dependable pointer target. These two drive the node element itself —
// what is under test is the engine's click/keydown -> onSelectNode contract, not hit testing.
test("NodeGraph reports the node the user picks and hands back its record", async () => {
	const onSelectNode = vi.fn();
	const {container} = await render(
		<Frame>
			<NodeGraph nodes={NODES} edges={EDGES} onSelectNode={onSelectNode} />
		</Frame>,
	);

	container.querySelector<HTMLElement>("[data-id='clean']")?.click();
	expect(onSelectNode).toHaveBeenCalledWith("clean", NODES[1]);
});

test("NodeGraph selects from the keyboard, so a node is reachable without a pointer", async () => {
	const onSelectNode = vi.fn();
	const {container} = await render(
		<Frame>
			<NodeGraph nodes={NODES} edges={EDGES} onSelectNode={onSelectNode} />
		</Frame>,
	);

	const node = container.querySelector<HTMLElement>("[data-id='src']");
	// The engine makes the node itself the focusable element; Enter on it is the selection gesture.
	expect(node?.tabIndex).toBe(0);
	node?.focus();
	node?.dispatchEvent(new KeyboardEvent("keydown", {key: "Enter", bubbles: true}));
	expect(onSelectNode).toHaveBeenCalledWith("src", NODES[0]);
});

test("NodeGraph honours a controlled selection", async () => {
	const {container} = await render(
		<Frame>
			<NodeGraph nodes={NODES} edges={EDGES} selectedNodeId="src" />
		</Frame>,
	);

	const selected = container.querySelectorAll(".react-flow__node.selected");
	expect(selected.length).toBe(1);
	expect(selected[0]?.getAttribute("data-id")).toBe("src");
});

test("NodeGraph shows a loading treatment instead of an empty canvas", async () => {
	const {container} = await render(
		<Frame>
			<NodeGraph nodes={[]} loading />
		</Frame>,
	);

	expect(container.querySelector("[data-testid='node-graph-loading']")).not.toBeNull();
	expect(container.querySelector(".react-flow")).toBeNull();
});

test("NodeGraph states a failed load and offers the host's retry", async () => {
	const onRetry = vi.fn();
	await render(
		<Frame>
			<NodeGraph nodes={[]} error="Lineage service unreachable." onRetry={onRetry} />
		</Frame>,
	);

	await expect.element(page.getByText("Lineage service unreachable.")).toBeInTheDocument();
	await page.getByRole("button", {name: "Retry"}).click();
	expect(onRetry).toHaveBeenCalledTimes(1);
});

test("NodeGraph shows the caller's empty state and parks the zoom actions", async () => {
	await render(
		<Frame>
			<NodeGraph nodes={[]} emptyTitle="No steps yet" emptyDescription="Add a step to start the pipeline." />
		</Frame>,
	);

	await expect.element(page.getByText("No steps yet")).toBeInTheDocument();
	await expect.element(page.getByRole("button", {name: "Reset"})).toBeDisabled();
	await expect.element(page.getByRole("button", {name: "Zoom in"})).toBeDisabled();
});

test("NodeGraph renders the inspector handoff beside the canvas", async () => {
	await render(
		<Frame>
			<NodeGraph nodes={NODES} edges={EDGES} inspector={<p>Evidence for Normalise</p>} />
		</Frame>,
	);

	await expect.element(page.getByText("Evidence for Normalise")).toBeInTheDocument();
});

test("NodeGraph makes every node keyboard-focusable", async () => {
	const {container} = await render(
		<Frame>
			<NodeGraph nodes={NODES} edges={EDGES} />
		</Frame>,
	);

	const nodeEls = [...container.querySelectorAll<HTMLElement>(".react-flow__node")];
	expect(nodeEls.length).toBe(2);
	expect(nodeEls.every((el) => el.tabIndex === 0)).toBe(true);
	expect(nodeEls.every((el) => (el.getAttribute("aria-label") ?? "").length > 0)).toBe(true);
});
