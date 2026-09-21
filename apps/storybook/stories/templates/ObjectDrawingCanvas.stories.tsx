import type {DrawingTool} from "@wakecap/core-ui/object-drawing-toolbar";
import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@wakecap/core-ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@wakecap/core-ui/dropdown-menu";
import {ObjectDrawingToolbar} from "@wakecap/core-ui/object-drawing-toolbar";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@wakecap/core-ui/resizable";
import {
	Link2,
	Link2Off,
	PanelLeftClose,
	PanelLeftOpen,
	PanelRightClose,
	PanelRightOpen,
	Trash2,
	Unlink,
} from "lucide-react";
import {useEffect, useRef, useState} from "react";

type PanelImperativeHandle = {collapse: () => void; expand: () => void};

const meta = {
	title: "Templates/Object Drawing Canvas",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"A functional drawing surface driven by the `ObjectDrawingToolbar`. Pick a shape tool (line / circle / rectangle / polygon) and drag on the canvas to draw; use Select to move objects and Pan (or View mode) to move the canvas. The collapsible Layers and Properties panels open and close from the toolbar or by dragging their handle.",
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ── Shape model ───────────────────────────────────────────────────────────────

type Point = [number, number];

interface Style {
	fill: string;
	stroke: string;
	opacity: number;
}

interface ShapeBase extends Style {
	id: string;
	/** Label of the asset this object is linked to; `undefined` when unassigned. */
	assignedTo?: string;
}

interface RectShape extends ShapeBase {
	type: "rectangle";
	x: number;
	y: number;
	w: number;
	h: number;
}
interface EllipseShape extends ShapeBase {
	type: "circle";
	cx: number;
	cy: number;
	rx: number;
	ry: number;
}
interface LineShape extends ShapeBase {
	type: "line";
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}
interface PolyShape extends ShapeBase {
	type: "polygon";
	points: Point[];
}

type Shape = RectShape | EllipseShape | LineShape | PolyShape;

const SHAPE_LABEL: Record<Shape["type"], string> = {
	rectangle: "Rectangle",
	circle: "Ellipse",
	line: "Line",
	polygon: "Polygon",
};

/** Example assets an object can be linked to. */
const ASSIGNABLE = ["Zone A — Level 3", "Tower Crane 02", "Formwork Bay 7", "Rebar Stack North", "Concrete Pour #4"];

// ── Geometry helpers ────────────────────────────────────────────────────────────

function makeShape(id: string, tool: DrawingTool, a: Point, b: Point, snap: boolean, style: Style): Shape | null {
	if (tool === "line") {
		let [x2, y2] = b;
		if (snap) {
			if (Math.abs(x2 - a[0]) >= Math.abs(y2 - a[1])) y2 = a[1];
			else x2 = a[0];
		}
		return {id, type: "line", x1: a[0], y1: a[1], x2, y2, ...style};
	}

	const x = Math.min(a[0], b[0]);
	const y = Math.min(a[1], b[1]);
	let w = Math.abs(b[0] - a[0]);
	let h = Math.abs(b[1] - a[1]);
	if (snap) {
		const side = Math.max(w, h);
		w = side;
		h = side;
	}

	if (tool === "rectangle") return {id, type: "rectangle", x, y, w, h, ...style};

	const cx = x + w / 2;
	const cy = y + h / 2;
	const rx = w / 2;
	const ry = h / 2;

	if (tool === "circle") return {id, type: "circle", cx, cy, rx, ry, ...style};

	if (tool === "polygon") {
		const points: Point[] = [];
		for (let i = 0; i < 5; i++) {
			const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
			points.push([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]);
		}
		return {id, type: "polygon", points, ...style};
	}
	return null;
}

function isMeaningful(s: Shape): boolean {
	if (s.type === "line") return Math.hypot(s.x2 - s.x1, s.y2 - s.y1) > 3;
	if (s.type === "rectangle") return s.w > 3 && s.h > 3;
	if (s.type === "circle") return s.rx > 2 && s.ry > 2;
	return true;
}

function translate(s: Shape, dx: number, dy: number): Shape {
	switch (s.type) {
		case "rectangle":
			return {...s, x: s.x + dx, y: s.y + dy};
		case "circle":
			return {...s, cx: s.cx + dx, cy: s.cy + dy};
		case "line":
			return {...s, x1: s.x1 + dx, y1: s.y1 + dy, x2: s.x2 + dx, y2: s.y2 + dy};
		case "polygon":
			return {...s, points: s.points.map(([px, py]) => [px + dx, py + dy] as Point)};
	}
}

function bbox(s: Shape): {x: number; y: number; w: number; h: number} {
	switch (s.type) {
		case "rectangle":
			return {x: s.x, y: s.y, w: s.w, h: s.h};
		case "circle":
			return {x: s.cx - s.rx, y: s.cy - s.ry, w: s.rx * 2, h: s.ry * 2};
		case "line":
			return {x: Math.min(s.x1, s.x2), y: Math.min(s.y1, s.y2), w: Math.abs(s.x2 - s.x1), h: Math.abs(s.y2 - s.y1)};
		case "polygon": {
			const xs = s.points.map((p) => p[0]);
			const ys = s.points.map((p) => p[1]);
			const minX = Math.min(...xs);
			const minY = Math.min(...ys);
			return {x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY};
		}
	}
}

function ShapeEl({s, onPointerDown}: {s: Shape; onPointerDown?: (e: React.PointerEvent) => void}) {
	const common = {
		fill: s.fill || "none",
		stroke: s.stroke || "none",
		strokeWidth: 2,
		opacity: s.opacity / 100,
		onPointerDown,
		style: {cursor: onPointerDown ? "move" : "default"} as React.CSSProperties,
	};
	switch (s.type) {
		case "rectangle":
			return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={2} {...common} />;
		case "circle":
			return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...common} />;
		case "line":
			return <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} {...common} fill="none" strokeLinecap="round" />;
		case "polygon":
			return <polygon points={s.points.map((p) => p.join(",")).join(" ")} {...common} />;
	}
}

// ── Demo ─────────────────────────────────────────────────────────────────────────

function ObjectDrawingCanvasDemo() {
	const leftRef = useRef<PanelImperativeHandle>(null);
	const rightRef = useRef<PanelImperativeHandle>(null);
	const [leftCollapsed, setLeftCollapsed] = useState(false);
	const [rightCollapsed, setRightCollapsed] = useState(false);
	const toggleLeft = () => (leftCollapsed ? leftRef.current?.expand() : leftRef.current?.collapse());
	const toggleRight = () => (rightCollapsed ? rightRef.current?.expand() : rightRef.current?.collapse());

	const [editing, setEditing] = useState(true);
	const [tool, setTool] = useState<DrawingTool>("rectangle");
	const [fill, setFill] = useState("#2563EB");
	const [stroke, setStroke] = useState("#7C3AED");
	const [opacity, setOpacity] = useState(80);
	const [snap, setSnap] = useState(false);

	const [shapes, setShapes] = useState<Shape[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [preview, setPreview] = useState<Shape | null>(null);
	const [pan, setPan] = useState({x: 0, y: 0});

	const svgRef = useRef<SVGSVGElement>(null);
	const idc = useRef(0);
	const gesture = useRef<
		| null
		| {kind: "draw"; tool: DrawingTool; start: Point}
		| {kind: "pan"; sx: number; sy: number; px: number; py: number}
		| {kind: "move"; id: string; last: Point}
	>(null);

	const live = useRef({editing, tool, snap, fill, stroke, opacity, pan});
	live.current = {editing, tool, snap, fill, stroke, opacity, pan};

	function toWorld(e: PointerEvent | React.PointerEvent): Point {
		const rect = svgRef.current!.getBoundingClientRect();
		const p = live.current.pan;
		return [e.clientX - rect.left - p.x, e.clientY - rect.top - p.y];
	}

	function onSurfacePointerDown(e: React.PointerEvent) {
		if (e.button !== 0) return;
		const {editing: ed, tool: t} = live.current;
		const active: DrawingTool = ed ? t : "pan";
		const world = toWorld(e);
		if (active === "pan") {
			gesture.current = {kind: "pan", sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y};
			return;
		}
		if (active === "select") {
			setSelectedId(null);
			return;
		}
		gesture.current = {kind: "draw", tool: active, start: world};
	}

	function onShapePointerDown(e: React.PointerEvent, id: string) {
		const {editing: ed, tool: t} = live.current;
		if (!ed || t !== "select") return;
		e.stopPropagation();
		setSelectedId(id);
		gesture.current = {kind: "move", id, last: toWorld(e)};
	}

	useEffect(() => {
		function onMove(e: PointerEvent) {
			const g = gesture.current;
			if (!g) return;
			if (g.kind === "pan") {
				setPan({x: g.px + (e.clientX - g.sx), y: g.py + (e.clientY - g.sy)});
			} else if (g.kind === "draw") {
				const {snap: sp, fill: f, stroke: st, opacity: op} = live.current;
				setPreview(makeShape("preview", g.tool, g.start, toWorld(e), sp, {fill: f, stroke: st, opacity: op}));
			} else if (g.kind === "move") {
				const [wx, wy] = toWorld(e);
				const dx = wx - g.last[0];
				const dy = wy - g.last[1];
				g.last = [wx, wy];
				setShapes((prev) => prev.map((s) => (s.id === g.id ? translate(s, dx, dy) : s)));
			}
		}
		function onUp(e: PointerEvent) {
			const g = gesture.current;
			gesture.current = null;
			if (g?.kind === "draw") {
				const {snap: sp, fill: f, stroke: st, opacity: op} = live.current;
				const shape = makeShape(`s${++idc.current}`, g.tool, g.start, toWorld(e), sp, {
					fill: f,
					stroke: st,
					opacity: op,
				});
				setPreview(null);
				if (shape && isMeaningful(shape)) {
					setShapes((prev) => [...prev, shape]);
					setSelectedId(shape.id);
				}
			}
		}
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
		};
	}, []);

	function deleteSelected() {
		if (!selectedId) return;
		setShapes((prev) => prev.filter((s) => s.id !== selectedId));
		setSelectedId(null);
	}

	function assign(target: string) {
		if (!selectedId) return;
		setShapes((prev) => prev.map((s) => (s.id === selectedId ? {...s, assignedTo: target} : s)));
	}

	function unlinkAssignment() {
		if (!selectedId) return;
		setShapes((prev) => prev.map((s) => (s.id === selectedId ? {...s, assignedTo: undefined} : s)));
	}

	const selected = shapes.find((s) => s.id === selectedId) ?? null;
	const cursor = !editing || tool === "pan" ? "grab" : tool === "select" ? "default" : "crosshair";

	// Assign / reassign dropdown, shared by both floating-toolbar states.
	const assignMenu = (triggerLabel: string, triggerVariant: "default" | "outline") => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="sm" variant={triggerVariant}>
					{triggerLabel}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" side="top">
				<DropdownMenuLabel>Assign to</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{ASSIGNABLE.map((a) => (
					<DropdownMenuItem key={a} onClick={() => assign(a)}>
						{a}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return (
		<div className="wwc:flex wwc:h-screen wwc:flex-col wwc:overflow-hidden wwc:bg-background">
			{/* Top bar */}
			<div className="wwc:flex wwc:h-12 wwc:flex-shrink-0 wwc:items-center wwc:gap-2 wwc:border-b wwc:px-2">
				<Button
					variant="ghost"
					icon
					onClick={toggleLeft}
					aria-label={leftCollapsed ? "Expand layers panel" : "Collapse layers panel"}
				>
					{leftCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
				</Button>
				<div className="wwc:min-w-0 wwc:flex-1 wwc:overflow-x-auto">
					<ObjectDrawingToolbar
						defaultEditing={editing}
						onEditingChange={setEditing}
						defaultTool={tool}
						onToolChange={setTool}
						defaultFillColor={fill}
						onFillColorChange={setFill}
						defaultStrokeColor={stroke}
						onStrokeColorChange={setStroke}
						defaultOpacity={opacity}
						onOpacityChange={setOpacity}
						defaultAngleSnap={snap}
						onAngleSnapChange={setSnap}
						onUnlink={unlinkAssignment}
					/>
				</div>
				<Button
					variant="ghost"
					icon
					onClick={toggleRight}
					aria-label={rightCollapsed ? "Expand properties panel" : "Collapse properties panel"}
				>
					{rightCollapsed ? <PanelRightOpen /> : <PanelRightClose />}
				</Button>
			</div>

			{/* Body */}
			<ResizablePanelGroup orientation="horizontal" className="wwc:flex-1">
				<ResizablePanel
					panelRef={leftRef}
					defaultSize={18}
					minSize={"14%"}
					collapsible
					collapsedSize={0}
					onResize={(size) => setLeftCollapsed(size.asPercentage === 0)}
				>
					<div className="wwc:flex wwc:h-full wwc:flex-col wwc:bg-background">
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:border-b wwc:px-4 wwc:py-3">
							<h3 className="wwc:text-sm wwc:font-semibold">Layers</h3>
							<span className="wwc:text-xs wwc:text-muted-foreground">{shapes.length}</span>
						</div>
						<div className="wwc:flex-1 wwc:overflow-y-auto wwc:p-2">
							{shapes.length === 0 ? (
								<p className="wwc:px-2 wwc:py-3 wwc:text-xs wwc:text-muted-foreground">No objects yet.</p>
							) : (
								<ul className="wwc:space-y-0.5">
									{[...shapes].reverse().map((s) => (
										<li key={s.id}>
											<button
												type="button"
												onClick={() => setSelectedId(s.id)}
												className={`wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-md wwc:px-2 wwc:py-1.5 wwc:text-left wwc:text-sm wwc:transition-colors ${
													s.id === selectedId ? "wwc:bg-muted wwc:font-medium" : "wwc:hover:bg-muted/60"
												}`}
											>
												<span
													className="wwc:h-3 wwc:w-3 wwc:shrink-0 wwc:rounded-sm wwc:border"
													style={{
														backgroundColor: s.fill || "transparent",
														borderColor: s.stroke || "#d4d4d8",
													}}
												/>
												<span className="wwc:truncate">{SHAPE_LABEL[s.type]}</span>
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</ResizablePanel>

				<ResizableHandle withHandle />

				<ResizablePanel defaultSize={64} minSize={"30%"}>
					<div className="wwc:relative wwc:h-full wwc:w-full wwc:overflow-hidden wwc:bg-muted/30">
						<svg
							ref={svgRef}
							className="wwc:h-full wwc:w-full wwc:touch-none wwc:select-none"
							style={{cursor}}
							onPointerDown={onSurfacePointerDown}
						>
							<defs>
								<pattern id="odc-grid" width="16" height="16" patternUnits="userSpaceOnUse">
									<circle cx="1" cy="1" r="1" fill="rgba(0,0,0,0.08)" />
								</pattern>
							</defs>
							<g transform={`translate(${pan.x} ${pan.y})`}>
								<rect x={-4000} y={-4000} width={8000} height={8000} fill="url(#odc-grid)" />
								{shapes.map((s) => (
									<ShapeEl key={s.id} s={s} onPointerDown={(e) => onShapePointerDown(e, s.id)} />
								))}
								{preview && <ShapeEl s={preview} />}
								{selected &&
									(() => {
										const b = bbox(selected);
										return (
											<rect
												x={b.x - 4}
												y={b.y - 4}
												width={b.w + 8}
												height={b.h + 8}
												fill="none"
												stroke="#2563EB"
												strokeWidth={1}
												strokeDasharray="4 3"
												pointerEvents="none"
											/>
										);
									})()}
							</g>
						</svg>
						{shapes.length === 0 && !preview && (
							<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center">
								<p className="wwc:text-sm wwc:text-muted-foreground">
									{editing ? "Pick a shape tool and drag on the canvas to draw." : "Viewing — drag to pan the canvas."}
								</p>
							</div>
						)}

						{/* Floating toolbar — pinned bottom-center, shown while an object is selected. */}
						{selected && (
							<div className="wwc:absolute wwc:bottom-5 wwc:left-1/2 wwc:flex wwc:-translate-x-1/2 wwc:items-center wwc:gap-3 wwc:rounded-xl wwc:border wwc:bg-background wwc:px-4 wwc:py-2 wwc:shadow-lg">
								{selected.assignedTo ? (
									<>
										<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm">
											<Link2 className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
											<span className="wwc:text-muted-foreground">Linked to</span>
											<span className="wwc:font-medium">{selected.assignedTo}</span>
										</div>
										<div className="wwc:h-5 wwc:w-px wwc:bg-border" />
										<Button variant="ghost" size="sm" onClick={unlinkAssignment}>
											<Unlink /> Unlink
										</Button>
										{assignMenu("Reassign", "outline")}
									</>
								) : (
									<>
										<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm wwc:text-muted-foreground">
											<Link2Off className="wwc:h-4 wwc:w-4" />
											<span>Not assigned</span>
										</div>
										{assignMenu("Assign", "default")}
									</>
								)}
							</div>
						)}
					</div>
				</ResizablePanel>

				<ResizableHandle withHandle />

				<ResizablePanel
					panelRef={rightRef}
					defaultSize={18}
					minSize={"14%"}
					collapsible
					collapsedSize={0}
					onResize={(size) => setRightCollapsed(size.asPercentage === 0)}
				>
					<div className="wwc:flex wwc:h-full wwc:flex-col wwc:bg-background">
						<div className="wwc:border-b wwc:px-4 wwc:py-3">
							<h3 className="wwc:text-sm wwc:font-semibold">Properties</h3>
						</div>
						<div className="wwc:flex-1 wwc:overflow-y-auto wwc:p-4">
							{selected ? (
								<div className="wwc:space-y-4 wwc:text-sm">
									<div>
										<div className="wwc:text-xs wwc:text-muted-foreground">Type</div>
										<div className="wwc:font-medium">{SHAPE_LABEL[selected.type]}</div>
									</div>
									<div className="wwc:flex wwc:gap-4">
										<div>
											<div className="wwc:text-xs wwc:text-muted-foreground">Fill</div>
											<div className="wwc:mt-1 wwc:flex wwc:items-center wwc:gap-2">
												<span
													className="wwc:h-4 wwc:w-4 wwc:rounded wwc:border"
													style={{backgroundColor: selected.fill || "transparent"}}
												/>
												<span className="wwc:font-mono wwc:text-xs">{selected.fill || "none"}</span>
											</div>
										</div>
										<div>
											<div className="wwc:text-xs wwc:text-muted-foreground">Stroke</div>
											<div className="wwc:mt-1 wwc:flex wwc:items-center wwc:gap-2">
												<span
													className="wwc:h-4 wwc:w-4 wwc:rounded wwc:border"
													style={{backgroundColor: selected.stroke || "transparent"}}
												/>
												<span className="wwc:font-mono wwc:text-xs">{selected.stroke || "none"}</span>
											</div>
										</div>
									</div>
									<div>
										<div className="wwc:text-xs wwc:text-muted-foreground">Opacity</div>
										<div className="wwc:font-medium">{selected.opacity}%</div>
									</div>
									<div>
										<div className="wwc:text-xs wwc:text-muted-foreground">Assigned to</div>
										<div className="wwc:mt-1 wwc:flex wwc:items-center wwc:gap-2 wwc:font-medium">
											{selected.assignedTo ? (
												<>
													<Link2 className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
													{selected.assignedTo}
												</>
											) : (
												<span className="wwc:text-muted-foreground">Not assigned</span>
											)}
										</div>
									</div>
									<Button variant="outline" size="sm" className="wwc:w-full" onClick={deleteSelected}>
										<Trash2 /> Delete object
									</Button>
								</div>
							) : (
								<p className="wwc:text-xs wwc:text-muted-foreground">Select an object to see its properties.</p>
							)}
						</div>
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}

export const Default: Story = {
	render: () => <ObjectDrawingCanvasDemo />,
};
