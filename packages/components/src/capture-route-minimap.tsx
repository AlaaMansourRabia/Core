import {Map, Minus} from "lucide-react";
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";

import {Toolbar, ToolbarButton} from "./toolbar";

// ── Capture Route Minimap ─────────────────────────────────────────────────────────────────────────
// A floating, resizable, collapsible mini-viewer that overlays a main view: an overview of a whole
// floor plan with the capture walk drawn over it. As a person walks the floor taking photos, their
// route is a blue path of ordered capture points. Points are positioned as fractions (0–1) of the
// plan, so the route scales with the plan regardless of its own aspect. Clicking a point calls
// `onPointSelect` (e.g. to open a comparison for that capture).

/** One photo/capture point on the walk, positioned as fractions (0–1) of the plan. */
export interface CapturePoint {
	id: string;
	/** Horizontal position, 0 (left) – 1 (right). */
	x: number;
	/** Vertical position, 0 (top) – 1 (bottom). */
	y: number;
	/** Capture time, shown in the point tooltip and (typically) the opened capture. */
	time: string;
}

export interface CaptureRouteMinimapProps {
	/** The whole floor-plan thumbnail. Fills the preview; drawn behind the route. */
	plan: React.ReactNode;
	/** The ordered capture points that make up the walk. */
	points: CapturePoint[];
	/** Id of the currently-open / highlighted point. */
	activeId?: string;
	/** Fires when a capture point is clicked. */
	onPointSelect?: (point: CapturePoint) => void;
	/** Header label above the preview. */
	label?: React.ReactNode;
	/** Smallest / largest width (px) the viewer can be dragged to. Defaults 120 / 480. */
	minWidth?: number;
	maxWidth?: number;
	/** Start collapsed to the map-icon button. Default false. */
	defaultCollapsed?: boolean;
	/** Positioning classes for the floating wrapper (e.g. `absolute bottom-3 right-3`). */
	className?: string;
}

const MIN_W = 120;
const MAX_W = 480;
const clampW = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// Catmull-Rom → cubic bézier, in the 0–100 overlay space, so the route reads as a smooth walked line
// (not a jagged polyline) through the capture points.
function smoothPath(points: CapturePoint[]): string {
	if (points.length < 2) return "";
	const p = points.map((pt) => ({x: pt.x * 100, y: pt.y * 100}));
	let d = `M ${p[0].x} ${p[0].y}`;
	for (let i = 0; i < p.length - 1; i++) {
		const p0 = p[i - 1] ?? p[i];
		const p1 = p[i];
		const p2 = p[i + 1];
		const p3 = p[i + 2] ?? p2;
		const cp1x = p1.x + (p2.x - p0.x) / 6;
		const cp1y = p1.y + (p2.y - p0.y) / 6;
		const cp2x = p2.x - (p3.x - p1.x) / 6;
		const cp2y = p2.y - (p3.y - p1.y) / 6;
		d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
	}
	return d;
}

export function CaptureRouteMinimap({
	plan,
	points,
	activeId,
	onPointSelect,
	label,
	minWidth = MIN_W,
	maxWidth = MAX_W,
	defaultCollapsed = false,
	className,
}: CaptureRouteMinimapProps) {
	const path = smoothPath(points);
	const wrapRef = useRef<HTMLDivElement>(null);
	const [collapsed, setCollapsed] = useState(defaultCollapsed);
	// Width (px) is the single size knob; the plan area keeps its aspect, so height follows. Starts at an
	// eighth of the view it floats over (measured from the parent on mount), clamped to [min, max].
	const [width, setWidth] = useState(140);
	useLayoutEffect(() => {
		const parent = wrapRef.current?.parentElement;
		if (parent) setWidth(clampW(Math.round(parent.clientWidth / 8), minWidth, maxWidth));
	}, [minWidth, maxWidth]);

	// Resize: drag any corner grip to change the width (aspect-locked, so the plan never distorts). Each
	// corner carries a sign for its outward direction; the drag follows whichever axis moved more.
	const resizeStart = useRef<{x: number; y: number; w: number; h: number; sx: number; sy: number} | null>(null);
	const [resizing, setResizing] = useState(false);
	const onResizeMove = useCallback(
		(event: PointerEvent) => {
			const start = resizeStart.current;
			if (!start) return;
			const dw = (event.clientX - start.x) * start.sx;
			const dh = (event.clientY - start.y) * start.sy;
			// Convert the vertical drag to a width delta via the panel's aspect, then take the dominant axis.
			const dwFromH = start.h > 0 ? dh * (start.w / start.h) : 0;
			const delta = Math.abs(dw) >= Math.abs(dwFromH) ? dw : dwFromH;
			setWidth(clampW(start.w + delta, minWidth, maxWidth));
		},
		[minWidth, maxWidth],
	);
	const startResize = (event: React.PointerEvent<HTMLButtonElement>, sx: number, sy: number) => {
		event.preventDefault();
		const rect = wrapRef.current?.getBoundingClientRect();
		resizeStart.current = {
			x: event.clientX,
			y: event.clientY,
			w: rect?.width ?? width,
			h: rect?.height ?? width,
			sx,
			sy,
		};
		setResizing(true);
	};
	useEffect(() => {
		if (!resizing) return;
		const up = () => {
			resizeStart.current = null;
			setResizing(false);
		};
		window.addEventListener("pointermove", onResizeMove);
		window.addEventListener("pointerup", up);
		window.addEventListener("pointercancel", up);
		return () => {
			window.removeEventListener("pointermove", onResizeMove);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointercancel", up);
		};
	}, [resizing, onResizeMove]);

	// The four corner resize handles (outward-direction signs + matching cursors).
	const RESIZE_CORNERS = [
		{key: "tl", pos: "wwc:left-0 wwc:top-0", cursor: "wwc:cursor-nwse-resize", sx: -1, sy: -1},
		{key: "tr", pos: "wwc:right-0 wwc:top-0", cursor: "wwc:cursor-nesw-resize", sx: 1, sy: -1},
		{key: "bl", pos: "wwc:bottom-0 wwc:left-0", cursor: "wwc:cursor-nesw-resize", sx: -1, sy: 1},
		{key: "br", pos: "wwc:bottom-0 wwc:right-0", cursor: "wwc:cursor-nwse-resize", sx: 1, sy: 1},
	] as const;

	// Collapsed → a single map-icon button, styled like the map toolbar's icon pills.
	if (collapsed) {
		return (
			<div ref={wrapRef} className={className}>
				<Toolbar
					orientation="vertical"
					className="wwc:w-10 wwc:border-0 wwc:py-1 wwc:shadow-md wwc:ring-1 wwc:ring-inset wwc:ring-border"
				>
					<ToolbarButton icon label="Show capture route" onClick={() => setCollapsed(false)}>
						<Map className="wwc:h-4 wwc:w-4" />
					</ToolbarButton>
				</Toolbar>
			</div>
		);
	}

	return (
		<div ref={wrapRef} className={className} style={{width}}>
			<div className="wwc:flex wwc:w-full wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background wwc:shadow-md">
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:px-3 wwc:py-2">
					<span className="wwc:min-w-0 wwc:truncate wwc:text-xs wwc:font-semibold wwc:text-foreground">{label}</span>
					<button
						type="button"
						onClick={() => setCollapsed(true)}
						aria-label="Collapse to map button"
						className="wwc:flex wwc:size-5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
					>
						<Minus className="wwc:h-3.5 wwc:w-3.5" />
					</button>
				</div>

				<div className="wwc:relative wwc:aspect-[400/540] wwc:w-full wwc:border-t wwc:border-border wwc:bg-white">
					{/* The floor plan, behind the route. */}
					<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0">{plan}</div>

					{/* The walked route (blue), drawn in a 0–100 overlay space so it tracks the plan. */}
					<svg
						className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full"
						viewBox="0 0 100 100"
						preserveAspectRatio="none"
						aria-hidden="true"
					>
						<path
							d={path}
							fill="none"
							stroke="#2563eb"
							strokeOpacity={0.18}
							strokeWidth={9}
							strokeLinecap="round"
							strokeLinejoin="round"
							vectorEffect="non-scaling-stroke"
						/>
						<path
							d={path}
							fill="none"
							stroke="#2563eb"
							strokeWidth={2.5}
							strokeLinecap="round"
							strokeLinejoin="round"
							vectorEffect="non-scaling-stroke"
						/>
					</svg>

					{/* Capture points: clickable dots. First = start, last = end. */}
					{points.map((point, i) => {
						const isStart = i === 0;
						const isEnd = i === points.length - 1;
						const active = point.id === activeId;
						return (
							<button
								key={point.id}
								type="button"
								onClick={() => onPointSelect?.(point)}
								aria-label={`Photo ${i + 1} of ${points.length} · ${point.time}`}
								className="wwc:group wwc:absolute wwc:-translate-x-1/2 wwc:-translate-y-1/2 wwc:rounded-full wwc:focus-visible:outline-none"
								style={{left: `${point.x * 100}%`, top: `${point.y * 100}%`}}
							>
								<span
									className={`wwc:block wwc:rounded-full wwc:shadow wwc:transition-transform wwc:group-hover:scale-125 wwc:group-hover:ring-2 wwc:group-hover:ring-white wwc:group-focus-visible:scale-125 wwc:group-focus-visible:ring-2 wwc:group-focus-visible:ring-white ${
										isStart || isEnd ? "wwc:size-[7px]" : "wwc:size-1.5"
									} ${active ? "wwc:bg-blue-400 wwc:ring-2 wwc:ring-blue-300" : "wwc:bg-blue-600"}`}
								/>
								{/* Hover/focus tooltip. */}
								<span className="wwc:pointer-events-none wwc:absolute wwc:bottom-full wwc:left-1/2 wwc:mb-1.5 wwc:-translate-x-1/2 wwc:whitespace-nowrap wwc:rounded wwc:bg-foreground wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-medium wwc:text-background wwc:opacity-0 wwc:transition-opacity wwc:group-hover:opacity-100 wwc:group-focus-visible:opacity-100">
									{isStart ? "Start · " : isEnd ? "End · " : `Photo ${i + 1} · `}
									{point.time}
								</span>
							</button>
						);
					})}

					{/* Resize handles: one per corner — drag any to resize the floating viewer. */}
					{RESIZE_CORNERS.map((corner) => (
						<button
							key={corner.key}
							type="button"
							aria-label="Resize"
							onPointerDown={(event) => startResize(event, corner.sx, corner.sy)}
							className={`wwc:absolute wwc:size-4 ${corner.pos} ${corner.cursor} wwc:focus-visible:outline-none`}
						/>
					))}
					{/* A grip glyph in the bottom-right corner as the primary resize affordance. */}
					<div className="wwc:pointer-events-none wwc:absolute wwc:bottom-0.5 wwc:right-0.5 wwc:text-slate-400">
						<svg viewBox="0 0 10 10" className="wwc:size-2.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
							<path d="M9 1 L1 9 M9 5 L5 9" strokeLinecap="round" />
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
}

// ── Per-floor blueprint + capture route ─────────────────────────────────────────────────────────────
// Each floor has its own blueprint: `FloorPlan` varies its partitions and fixtures by `seed`, and
// `captureRouteForFloor` perturbs a base serpentine walk per floor, so every level reads distinctly.

// Deterministic 0–1 pseudo-random from a (seed, index) pair — no wall-clock, stable across renders.
const rand = (seed: number, i: number) => {
	const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
	return x - Math.floor(x);
};
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// The base capture walk: an ordered boustrophedon (serpentine) route across the plan (seed 0).
export const BASE_CAPTURE_ROUTE: CapturePoint[] = [
	{id: "p01", x: 0.15, y: 0.11, time: "10:02"},
	{id: "p02", x: 0.4, y: 0.09, time: "10:05"},
	{id: "p03", x: 0.68, y: 0.12, time: "10:08"},
	{id: "p04", x: 0.85, y: 0.22, time: "10:11"},
	{id: "p05", x: 0.78, y: 0.34, time: "10:14"},
	{id: "p06", x: 0.5, y: 0.33, time: "10:17"},
	{id: "p07", x: 0.22, y: 0.36, time: "10:20"},
	{id: "p08", x: 0.14, y: 0.47, time: "10:23"},
	{id: "p09", x: 0.3, y: 0.55, time: "10:26"},
	{id: "p10", x: 0.55, y: 0.53, time: "10:29"},
	{id: "p11", x: 0.82, y: 0.56, time: "10:32"},
	{id: "p12", x: 0.86, y: 0.67, time: "10:35"},
	{id: "p13", x: 0.6, y: 0.73, time: "10:38"},
	{id: "p14", x: 0.32, y: 0.74, time: "10:41"},
	{id: "p15", x: 0.16, y: 0.83, time: "10:44"},
	{id: "p16", x: 0.42, y: 0.9, time: "10:47"},
	{id: "p17", x: 0.7, y: 0.89, time: "10:50"},
];

/** The capture walk for a floor — the base serpentine, jittered deterministically per `seed`. */
export function captureRouteForFloor(seed: number): CapturePoint[] {
	if (seed === 0) return BASE_CAPTURE_ROUTE;
	return BASE_CAPTURE_ROUTE.map((p, i) => ({
		id: p.id,
		time: p.time,
		x: clamp(p.x + (rand(seed, i) - 0.5) * 0.1, 0.08, 0.92),
		y: clamp(p.y + (rand(seed, i + 50) - 0.5) * 0.06, 0.06, 0.94),
	}));
}

/** A blueprint-style floor plan (thin lines on white), varied by `seed` so each floor is its own. */
export function FloorPlan({seed = 0}: {seed?: number}) {
	// Partition / split positions shift per floor, giving each level a distinct layout.
	const p1 = 170 + Math.round(rand(seed, 1) * 50); // upper partition Y
	const p2 = 320 + Math.round(rand(seed, 2) * 45); // mid partition Y
	const vx = 210 + Math.round(rand(seed, 3) * 70); // vertical split X
	const swap = rand(seed, 4) > 0.5; // mirror the fixtures
	const bx = swap ? 240 : 60; // bed X
	const sx = swap ? 60 : 280; // sofa X
	return (
		<svg
			className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:text-slate-400"
			viewBox="0 0 400 540"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<g fill="none" stroke="currentColor" strokeWidth={3}>
				{/* Outer envelope. */}
				<rect x={24} y={24} width={352} height={492} />
				{/* Upper partition (door gap). */}
				<path d={`M24 ${p1} H226 M286 ${p1} H376`} />
				{/* Vertical split of the top rooms (door gap). */}
				<path d={`M232 24 V120 M232 150 V${p1}`} />
				{/* Mid partition (door gap). */}
				<path d={`M24 ${p2} H150 M210 ${p2} H376`} />
				{/* Vertical split of the lower rooms (door gap). */}
				<path d={`M${vx} ${p2} V430 M${vx} 460 V516`} />
			</g>

			{/* Fixtures / furniture, lighter. */}
			<g fill="none" stroke="currentColor" strokeWidth={2} opacity={0.75}>
				{/* Bathroom (top-right): tub + basin. */}
				<rect x={300} y={40} width={60} height={40} rx={4} />
				<circle cx={330} cy={110} r={12} />
				{/* Kitchen counter (top-left, L-shape). */}
				<path d="M40 150 H120 V120" />
				{/* Stairs (mid-left). */}
				<path d="M40 250 H140 M40 270 H140 M40 290 H140 M40 310 H140" />
				{/* Bed. */}
				<rect x={bx} y={400} width={120} height={80} rx={4} />
				{/* Sofa. */}
				<rect x={sx} y={430} width={80} height={60} rx={6} />
			</g>

			{/* Faint room labels. */}
			<g fill="currentColor" fontSize={13} opacity={0.55}>
				<text x={70} y={70}>
					Kitchen
				</text>
				<text x={300} y={150}>
					Bath
				</text>
				<text x={60} y={360}>
					Living
				</text>
				<text x={280} y={370}>
					Bed 1
				</text>
				<text x={70} y={505}>
					Bed 2
				</text>
			</g>
		</svg>
	);
}
