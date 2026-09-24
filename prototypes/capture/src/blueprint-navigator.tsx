import {cn} from "@corensystem/coren-utils";
import {ArrowLeft, Maximize2, Minimize2} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@corensystem/coren-ui/breadcrumb";
import {Button} from "@corensystem/coren-ui/button";
import {CanvasNavigator, type CanvasNavigatorNode, type CanvasNavigatorSize} from "@corensystem/coren-ui/canvas-navigator";
import {type LegendTab, TabbedLegend} from "@corensystem/coren-ui/legend";
import {ProgressComparison} from "@corensystem/coren-ui/progress-comparison";
import {VerticalZoomTools} from "@corensystem/coren-ui/vertical-zoom-tools";
import {WeekSelector, type WeekSelectorWeek} from "@corensystem/coren-ui/week-selector";

import {SingleHouseView} from "./house-view";

// ─── Mock blueprint data ───────────────────────────────────────────────────

interface Sheet {
	id: string;
	name: string;
	level: string;
	zone: string;
	floorArea: string;
	rooms: number;
	clashes: number;
	reviewed: number;
	/** Approved (actual) progress %. */
	approved: number;
	/** Planned progress %. */
	planned: number;
	status: "In review" | "Approved" | "Draft";
}

const SHEETS: Sheet[] = [
	{
		id: "l2-a",
		name: "Level 2 — Zone A",
		level: "Level 2",
		zone: "Zone A",
		floorArea: "1,840 m²",
		rooms: 18,
		clashes: 3,
		reviewed: 86,
		approved: 67,
		planned: 71,
		status: "In review",
	},
	{
		id: "l2-b",
		name: "Level 2 — Zone B",
		level: "Level 2",
		zone: "Zone B",
		floorArea: "1,210 m²",
		rooms: 11,
		clashes: 0,
		reviewed: 100,
		approved: 100,
		planned: 100,
		status: "Approved",
	},
	{
		id: "l3-a",
		name: "Level 3 — Zone A",
		level: "Level 3",
		zone: "Zone A",
		floorArea: "1,640 m²",
		rooms: 15,
		clashes: 5,
		reviewed: 42,
		approved: 42,
		planned: 58,
		status: "Draft",
	},
];

// Weeks the schedule spans — feeds the week selector that sits beside the earned-value toolbar.
const WEEKS: WeekSelectorWeek[] = [
	{value: "W109", start: new Date(2026, 5, 12), end: new Date(2026, 5, 18)},
	{value: "W110", start: new Date(2026, 5, 19), end: new Date(2026, 5, 25)},
	{value: "W111", start: new Date(2026, 5, 26), end: new Date(2026, 6, 2)},
	{value: "W112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
	{value: "W113", start: new Date(2026, 6, 10), end: new Date(2026, 6, 16)},
	{value: "W114", start: new Date(2026, 6, 17), end: new Date(2026, 6, 23)},
	{value: "W115", start: new Date(2026, 6, 24), end: new Date(2026, 6, 30)},
];

// "View mode" legend — each tab keys the canvas overlay a different way.
const VIEW_MODE_TABS: LegendTab[] = [
	{
		id: "progress",
		label: "Progress",
		items: [
			{id: "complete", label: "Complete", color: "#16a34a", description: "100% cast"},
			{id: "in-progress", label: "In progress", color: "#2563eb", description: "Active pour"},
			{id: "planned", label: "Planned", color: "#a1a1aa", description: "Not started"},
			{id: "delayed", label: "Delayed", color: "#e11d48", description: "Behind schedule"},
		],
		footnote: "Cast status per villa polygon",
	},
	{
		id: "milestones",
		label: "Milestones",
		items: [
			{id: "foundation", label: "Foundation", color: "#0ea5e9", description: "Jan – Feb"},
			{id: "structure", label: "Structure", color: "#8b5cf6", description: "Mar – May"},
			{id: "mep", label: "MEP", color: "#f59e0b", description: "Jun – Aug"},
			{id: "handover", label: "Handover", color: "#16a34a", description: "Sep"},
		],
		footnote: "Milestone phase per villa polygon",
	},
	{
		id: "trades",
		label: "Trades",
		items: [
			{id: "concrete", label: "Concrete", color: "#64748b", description: "Structural"},
			{id: "steel", label: "Steel", color: "#0891b2", description: "Reinforcement"},
			{id: "electrical", label: "Electrical", color: "#f59e0b", description: "First fix"},
			{id: "plumbing", label: "Plumbing", color: "#2563eb", description: "Rough-in"},
		],
		footnote: "Active trade per villa polygon",
	},
];

// A slight drop shadow for the panels floating over the canvas. Uses an explicit value because the
// app's `shadow-*` scale flattens to `none` here, so the named utilities wouldn't render.
const FLOAT_SHADOW = "wwc:shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

// ─── Isometric neighborhood ─────────────────────────────────────────────────

// Minimal isometric projection: +x runs to the lower-right, +y to the lower-left, +z is up.
const ISO_W = 34; // tile half-width (px)
const ISO_H = 17; // tile half-height (px) — classic 2:1 diamond
const ISO_Z = 24; // one unit of building height (px)

function iso(x: number, y: number, z = 0): [number, number] {
	return [(x - y) * ISO_W, (x + y) * ISO_H - z * ISO_Z];
}
const ptStr = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
const polyStr = (...points: [number, number][]) => points.map(ptStr).join(" ");

interface House {
	id: string;
	name: string;
	gx: number;
	gy: number;
	s: number; // footprint half-size (tile units)
	wall: number; // wall height (units)
	roof: number; // roof height (units)
	palette: number;
}

// A handful of house colour schemes (light wall, side-shaded wall, light + dark roof).
const HOUSE_PALETTES = [
	{wall: "#efece6", side: "#d3cec4", roof: "#c2620f", roofDark: "#97490a"},
	{wall: "#dbeafe", side: "#bcd3f5", roof: "#2563eb", roofDark: "#1d4fc4"},
	{wall: "#dcfce7", side: "#bbe9cc", roof: "#16a34a", roofDark: "#127a39"},
	{wall: "#fef3c7", side: "#f2e0a0", roof: "#ca8a04", roofDark: "#a06d05"},
	{wall: "#f3e8ff", side: "#dcc7f6", roof: "#7c3aed", roofDark: "#6127bf"},
	{wall: "#f2f1ef", side: "#d4d1cb", roof: "#57534e", roofDark: "#403c38"},
];

// Lay ~50 houses on a grid split by two vertical roads and one horizontal road. Built once at
// module load so each house keeps a stable size/colour across re-renders.
const GRID_COLS = 9;
const GRID_ROWS = 7;
const ROAD_COLS = [3, 6];
const ROAD_ROWS = [3];
const LOT = 1.3; // spacing between lot centres (tile units)

const HOUSES: House[] = (() => {
	const list: House[] = [];
	let i = 0;
	for (let r = 0; r < GRID_ROWS; r++) {
		for (let c = 0; c < GRID_COLS; c++) {
			if (ROAD_COLS.includes(c) || ROAD_ROWS.includes(r)) continue;
			// Deterministic pseudo-random so the scene renders identically every time.
			const noise = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
			list.push({
				id: `lot-${r}-${c}`,
				name: `House ${i + 1}`,
				gx: c * LOT,
				gy: r * LOT,
				s: 0.42 + noise * 0.06,
				wall: 0.7 + noise * 0.55,
				roof: 0.42 + (1 - noise) * 0.34,
				palette: (r * GRID_COLS + c) % HOUSE_PALETTES.length,
			});
			i++;
		}
	}
	// Painter's order: back (small gx+gy) first so nearer houses overlap farther ones.
	return list.sort((a, b) => a.gx + a.gy - (b.gx + b.gy));
})();

const HOUSE_BY_ID = new Map(HOUSES.map((h) => [h.id, h]));

// Ground + road geometry, plus the viewBox that frames the whole scene.
const GMAX_X = (GRID_COLS - 1) * LOT;
const GMAX_Y = (GRID_ROWS - 1) * LOT;
const PAD = 1;
const ROAD_HALF = 0.44;

const GROUND = polyStr(iso(-PAD, -PAD), iso(GMAX_X + PAD, -PAD), iso(GMAX_X + PAD, GMAX_Y + PAD), iso(-PAD, GMAX_Y + PAD));

const ROADS: string[] = [
	...ROAD_COLS.map((c) => {
		const x = c * LOT;
		return polyStr(
			iso(x - ROAD_HALF, -PAD),
			iso(x + ROAD_HALF, -PAD),
			iso(x + ROAD_HALF, GMAX_Y + PAD),
			iso(x - ROAD_HALF, GMAX_Y + PAD),
		);
	}),
	...ROAD_ROWS.map((r) => {
		const y = r * LOT;
		return polyStr(
			iso(-PAD, y - ROAD_HALF),
			iso(GMAX_X + PAD, y - ROAD_HALF),
			iso(GMAX_X + PAD, y + ROAD_HALF),
			iso(-PAD, y + ROAD_HALF),
		);
	}),
];

const VIEWBOX = (() => {
	let minX = Infinity,
		minY = Infinity,
		maxX = -Infinity,
		maxY = -Infinity;
	const track = ([x, y]: [number, number]) => {
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);
	};
	for (const corner of [
		iso(-PAD, -PAD),
		iso(GMAX_X + PAD, -PAD),
		iso(GMAX_X + PAD, GMAX_Y + PAD),
		iso(-PAD, GMAX_Y + PAD),
	])
		track(corner);
	for (const h of HOUSES) track(iso(h.gx, h.gy, h.wall + h.roof));
	const m = 26;
	return `${(minX - m).toFixed(1)} ${(minY - m).toFixed(1)} ${(maxX - minX + 2 * m).toFixed(1)} ${(maxY - minY + 2 * m).toFixed(1)}`;
})();

const [, , VB_W, VB_H] = VIEWBOX.split(" ").map(Number);
const SCENE_AR = VB_W / VB_H;

type HouseState = "idle" | "hover" | "selected";

// One isometric house: a shaded box (top + two walls) capped by a hip roof. On hover/select it
// lifts, brightens, and gains an outline; a selected house also carries a small marker.
function HouseShape({
	house,
	state,
	onEnter,
	onLeave,
	onSelect,
}: {
	house: House;
	state: HouseState;
	onEnter: () => void;
	onLeave: () => void;
	onSelect: (point: {x: number; y: number}) => void;
}) {
	const p = HOUSE_PALETTES[house.palette];
	const {gx, gy, s, wall, roof} = house;

	const b = iso(gx + s, gy - s),
		c = iso(gx + s, gy + s),
		d = iso(gx - s, gy + s);
	const aT = iso(gx - s, gy - s, wall),
		bT = iso(gx + s, gy - s, wall),
		cT = iso(gx + s, gy + s, wall),
		dT = iso(gx - s, gy + s, wall);
	const apex = iso(gx, gy, wall + roof);

	const active = state !== "idle";
	const outline = state === "selected" ? "#f97316" : "#38bdf8";

	return (
		<g
			role="button"
			tabIndex={0}
			aria-label={house.name}
			onMouseEnter={onEnter}
			onMouseLeave={onLeave}
			onClick={(event) => {
				// The click point (house centre in screen px) seeds the zoom-in transform origin.
				const rect = event.currentTarget.getBoundingClientRect();
				onSelect({x: rect.left + rect.width / 2, y: rect.top + rect.height / 2});
			}}
			style={{
				cursor: "pointer",
				pointerEvents: "auto",
				transition: "transform 120ms ease, filter 120ms ease",
				transform: active ? "translateY(-7px)" : "none",
				filter: active ? "brightness(1.06) drop-shadow(0 6px 6px rgba(0,0,0,0.28))" : "none",
			}}
			stroke={active ? outline : "#0f172a"}
			strokeWidth={active ? 1.6 : 0.5}
			strokeLinejoin="round"
			strokeOpacity={active ? 1 : 0.35}
		>
			{/* Two visible walls. */}
			<polygon points={polyStr(b, c, cT, bT)} fill={p.wall} />
			<polygon points={polyStr(d, c, cT, dT)} fill={p.side} />
			{/* Hip roof: the two back faces first, then the two facing the viewer. */}
			<polygon points={polyStr(aT, bT, apex)} fill={p.roofDark} />
			<polygon points={polyStr(aT, dT, apex)} fill={p.roofDark} />
			<polygon points={polyStr(bT, cT, apex)} fill={p.roof} />
			<polygon points={polyStr(dT, cT, apex)} fill={p.roofDark} />
			{state === "selected" && (
				<circle cx={apex[0]} cy={apex[1] - 7} r={3.6} fill="#f97316" stroke="#ffffff" strokeWidth={1.3} />
			)}
		</g>
	);
}

// The isometric neighbourhood that replaces the old blueprint sheet: a ground plane, two cross
// roads, and ~50 clickable houses. Hover highlights a house; clicking selects it (click again to
// clear). Selection is lifted to the workspace so the header can reflect the active house.
function NeighborhoodScene({
	selectedId,
	onSelect,
}: {
	selectedId: string | null;
	onSelect: (id: string, point: {x: number; y: number}) => void;
}) {
	const [hovered, setHovered] = useState<string | null>(null);
	return (
		<div className="wwc:w-[82%] wwc:max-w-[64rem]" style={{aspectRatio: SCENE_AR}}>
			{/* pointer-events are none on the scene (see the pan surface) — only houses opt back in. */}
			<svg
				viewBox={VIEWBOX}
				preserveAspectRatio="xMidYMid meet"
				className="wwc:h-full wwc:w-full wwc:overflow-visible"
			>
				<polygon points={GROUND} fill="#e7ebe4" stroke="#cfd6cb" strokeWidth={1} />
				{ROADS.map((points, i) => (
					<polygon key={i} points={points} fill="#b8bcc2" />
				))}
				{HOUSES.map((house) => (
					<HouseShape
						key={house.id}
						house={house}
						state={selectedId === house.id ? "selected" : hovered === house.id ? "hover" : "idle"}
						onEnter={() => setHovered(house.id)}
						onLeave={() => setHovered((h) => (h === house.id ? null : h))}
						onSelect={(point) => onSelect(house.id, point)}
					/>
				))}
			</svg>
		</div>
	);
}

// ─── Page ──────────────────────────────────────────────────────────────────

/**
 * Full-bleed pan/zoom navigator workspace. A grey canvas stage hosts a scalable isometric
 * neighborhood of clickable houses with floating overlays: the sheet navigator + earned-value
 * progress card (top-left), zoom
 * tools (top-right), and a view-mode legend (bottom-right). A thin app bar frames the stage, and the
 * metric bar carries the breadcrumb trail + week selector. Hitting present promotes the workspace to
 * a fixed full-viewport shell with an Exit control.
 */
export function BlueprintNavigator() {
	const [activeSheetIndex, setActiveSheetIndex] = useState(0);
	const [zoom, setZoom] = useState(1);
	const [navSize, setNavSize] = useState<CanvasNavigatorSize>("default");
	const [week, setWeek] = useState("W112");
	const [presentation, setPresentation] = useState(false);
	const [pan, setPan] = useState({x: 0, y: 0});
	const [isPanning, setIsPanning] = useState(false);
	// The house selected on the neighborhood scene (null = none). Drives the header + progress card.
	const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
	const selectedHouseName = selectedHouse ? (HOUSE_BY_ID.get(selectedHouse)?.name ?? null) : null;
	// "map" = the isometric neighborhood; "house" = the single-house 3D view. `phase` (below) runs the
	// zoom-into-the-house transition between them, pivoting on the clicked house.
	const [view, setView] = useState<"map" | "house">("map");
	// A single continuous map→house transition:
	//  • "loading"   — the neighborhood zooms slowly toward the clicked house (map stays opaque) while
	//                  the 3D loads underneath. The slow ease buys loading time without a hard stop.
	//  • "revealing" — once the model has loaded, the zoom finishes AND the map fades out together, so
	//                  it fades *while* zooming rather than zoom→stop→fade.
	const [phase, setPhase] = useState<"idle" | "loading" | "revealing" | "exit-start" | "exit">("idle");
	const [zoomOrigin, setZoomOrigin] = useState<{x: number; y: number} | null>(null);
	const canvasRef = useRef<HTMLDivElement>(null);
	const revealingRef = useRef(false);
	const minHeldRef = useRef(false); // the slow zoom has played long enough to read
	const settledRef = useRef(false); // the model has loaded (or errored)
	const minTimer = useRef<number | undefined>(undefined);
	const safetyTimer = useRef<number | undefined>(undefined);
	const settleTimer = useRef<number | undefined>(undefined);

	// Finish the zoom and fade the map out in one motion, then commit to the house view.
	const beginReveal = () => {
		if (revealingRef.current) return;
		revealingRef.current = true;
		window.clearTimeout(minTimer.current);
		window.clearTimeout(safetyTimer.current);
		setPhase("revealing");
		settleTimer.current = window.setTimeout(() => {
			setView("house");
			setPhase("idle");
			revealingRef.current = false;
		}, 650);
	};

	// Reveal once the slow zoom has read for a beat AND the model has loaded (whichever is later).
	const maybeReveal = () => {
		if (minHeldRef.current && settledRef.current) beginReveal();
	};

	// Clicking a house mounts the 3D view underneath (it starts loading at once) and begins the slow
	// zoom toward it. A 3.5s safety net reveals anyway if the model never reports back.
	const enterHouse = (id: string, point: {x: number; y: number}) => {
		setSelectedHouse(id);
		const rect = canvasRef.current?.getBoundingClientRect();
		setZoomOrigin(rect ? {x: point.x - rect.left, y: point.y - rect.top} : null);
		revealingRef.current = false;
		minHeldRef.current = false;
		settledRef.current = false;
		window.clearTimeout(minTimer.current);
		window.clearTimeout(safetyTimer.current);
		window.clearTimeout(settleTimer.current);
		setPhase("loading");
		minTimer.current = window.setTimeout(() => {
			minHeldRef.current = true;
			maybeReveal();
		}, 420);
		safetyTimer.current = window.setTimeout(beginReveal, 3500);
	};

	// The model finished (ready or errored).
	const handleHouseSettled = () => {
		settledRef.current = true;
		maybeReveal();
	};

	// Mirror of enter: mount the neighborhood zoomed-in over the house and fully transparent, then — on
	// the next tick so the start state paints — zoom it back out and fade it in over the house, pivoting
	// on the same point. The house view stays mounted underneath until the transition settles.
	const exitHouse = () => {
		window.clearTimeout(minTimer.current);
		window.clearTimeout(safetyTimer.current);
		window.clearTimeout(settleTimer.current);
		revealingRef.current = false;
		minHeldRef.current = false;
		settledRef.current = false;
		setView("map");
		setPhase("exit-start");
		safetyTimer.current = window.setTimeout(() => setPhase("exit"), 30);
		settleTimer.current = window.setTimeout(() => {
			setPhase("idle");
			setZoomOrigin(null);
		}, 700);
	};
	// Snapshot of the drag origin + pan offset at pointer-down, so moves compute an absolute offset.
	const panStart = useRef<{pointerX: number; pointerY: number; panX: number; panY: number} | null>(null);

	const sheet = SHEETS[activeSheetIndex];

	// Click-drag anywhere on the canvas backdrop pans the blueprint. Pointer capture keeps the drag
	// alive even if the cursor leaves the surface; overlays sit above and swallow their own clicks.
	const startPan = (event: React.PointerEvent<HTMLDivElement>) => {
		if (event.button !== 0) return;
		panStart.current = {pointerX: event.clientX, pointerY: event.clientY, panX: pan.x, panY: pan.y};
		setIsPanning(true);
		event.currentTarget.setPointerCapture(event.pointerId);
	};
	const movePan = (event: React.PointerEvent<HTMLDivElement>) => {
		const start = panStart.current;
		if (!start) return;
		setPan({x: start.panX + (event.clientX - start.pointerX), y: start.panY + (event.clientY - start.pointerY)});
	};
	const endPan = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!panStart.current) return;
		panStart.current = null;
		setIsPanning(false);
		event.currentTarget.releasePointerCapture(event.pointerId);
	};

	// Wheel over the canvas zooms the blueprint. Uses a non-passive native listener so the page
	// doesn't scroll while zooming (React's onWheel is passive and can't preventDefault).
	useEffect(() => {
		const el = canvasRef.current;
		if (!el) return;
		const onWheel = (event: WheelEvent) => {
			event.preventDefault();
			setZoom((z) => {
				const next = z * (event.deltaY < 0 ? 1.1 : 1 / 1.1);
				return Math.min(4, Math.max(0.25, Number(next.toFixed(3))));
			});
		};
		el.addEventListener("wheel", onWheel, {passive: false});
		return () => el.removeEventListener("wheel", onWheel);
	}, []);

	const navNodes = useMemo<CanvasNavigatorNode[]>(() => {
		const byLevel = new Map<string, CanvasNavigatorNode[]>();
		for (const s of SHEETS) {
			const children = byLevel.get(s.level) ?? [];
			children.push({id: s.id, label: s.zone});
			byLevel.set(s.level, children);
		}
		return Array.from(byLevel, ([level, children]) => ({id: level, label: level, children}));
	}, []);

	// The former KPI strip is now the earned-value stats toolbar (left) with the week selector (right).
	// Header split into thirds: breadcrumbs (left), empty (middle), week selector + full-screen (right).
	const metricBar = (
		<div className="wwc:z-20 wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:gap-3 wwc:overflow-x-auto wwc:border-b wwc:bg-background wwc:px-3">
			<div className="wwc:grid wwc:h-full wwc:min-h-12 wwc:w-full wwc:grid-cols-3 wwc:items-center wwc:gap-4">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1">
					{view === "house" && (
						<Button
							type="button"
							variant="ghost"
							icon
							size="sm"
							aria-label="Back to neighborhood"
							className="wwc:shrink-0"
							onClick={exitHouse}
						>
							<ArrowLeft className="wwc:h-4 wwc:w-4" />
						</Button>
					)}
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink
									href="#"
									onClick={(event) => {
										event.preventDefault();
										if (view === "house") exitHouse();
									}}
								>
									Neighborhood
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink href="#">{sheet.level}</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{selectedHouseName ?? sheet.zone}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				</div>
				<div aria-hidden="true" />
				<div className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-2">
					<WeekSelector
						className="wwc:shrink-0 wwc:border-0 wwc:bg-transparent wwc:px-0 wwc:py-0"
						weeks={WEEKS}
						value={week}
						onValueChange={setWeek}
						visibleCount={4}
					/>
					{!presentation && (
						<Button
							type="button"
							variant="outline"
							icon
							size="sm"
							aria-label="Full screen"
							className="wwc:shrink-0"
							onClick={() => setPresentation(true)}
						>
							<Maximize2 className="wwc:h-4 wwc:w-4" />
						</Button>
					)}
				</div>
			</div>
		</div>
	);

	// Variant #2 layout: the progress comparison stacks above the sheet navigator in a single left
	// column, the zoom tools move to the top-right, and the view-mode legend sits bottom-right.
	const canvas = (
		<div
			ref={canvasRef}
			className="wwc:relative wwc:h-full wwc:w-full wwc:overflow-hidden wwc:bg-zinc-100 dark:wwc:bg-zinc-900"
		>
			{/* Only the scene pans + scales; the grey backdrop and overlays stay put. Transitions are
			    suppressed mid-drag so panning tracks the cursor 1:1. The layer is pointer-events-none
			    (so drags on empty ground fall through to the pan surface) and sits above it at z-10;
			    each house opts back into pointer events so it stays hoverable/clickable. */}
			<div
				className={cn(
					"wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:z-10 wwc:flex wwc:origin-center wwc:items-center wwc:justify-center",
					isPanning || phase !== "idle" ? "" : "wwc:transition-transform wwc:duration-75",
				)}
				style={{
					transform: `translate(${pan.x}px, ${pan.y}px) scale(${
						phase === "revealing" || phase === "exit-start" ? zoom * 3.6 : phase === "loading" ? zoom * 2.6 : zoom
					})`,
					transformOrigin: zoomOrigin ? `${zoomOrigin.x}px ${zoomOrigin.y}px` : "center",
					// Loading: a long, front-loaded ease so the zoom keeps drifting slowly while the model
					// loads. Revealing: finish the zoom over the same window the map fades, so they move
					// together. CSS interpolates from the current scale, so the loading→revealing hand-off
					// is continuous — no stop.
					transition:
						phase === "loading"
							? "transform 3000ms cubic-bezier(0.16, 1, 0.3, 1)"
							: phase === "revealing" || phase === "exit"
								? "transform 650ms cubic-bezier(0.4, 0, 0.2, 1)"
								: undefined,
				}}
			>
				<NeighborhoodScene selectedId={selectedHouse} onSelect={enterHouse} />
			</div>

			{/* Pan surface: transparent, fills the canvas, sits below the z-10 overlays so drags on empty
			    canvas pan the blueprint while panel clicks still land on the panels. */}
			<div
				className={cn("wwc:absolute wwc:inset-0 wwc:z-0", isPanning ? "wwc:cursor-grabbing" : "wwc:cursor-grab")}
				onPointerDown={startPan}
				onPointerMove={movePan}
				onPointerUp={endPan}
				onPointerCancel={endPan}
			/>

			{/* Top-left: progress comparison stacked above the sheet navigator. Both overlays share the
			    canvas navigator's radius (rounded-lg) and sit 8px apart. */}
			<div className="wwc:absolute wwc:left-0 wwc:top-0 wwc:z-10 wwc:flex wwc:max-h-full wwc:w-[19.5rem] wwc:max-w-[75%] wwc:flex-col wwc:gap-2 wwc:overflow-y-auto wwc:p-3">
				<ProgressComparison
					className={cn("wwc:rounded-lg", FLOAT_SHADOW)}
					collapsible
					collapsedSummary
					variant="progress"
					title={selectedHouseName ?? sheet.name}
					subtitle={selectedHouseName ? "Neighborhood | Site" : `Floor | ${sheet.id.toUpperCase()}`}
					status={{label: "In Progress", color: "#2563eb"}}
					primary={{label: "Approved", value: sheet.approved}}
					secondary={{label: "Planned", value: sheet.planned}}
					stats={[
						{label: "PV", value: "$160,604"},
						{label: "BAC", value: "$817,218"},
						{label: "SV", value: "-$27,821", negative: true},
						{label: "EV", value: "$184,262"},
					]}
				/>
				<CanvasNavigator
					className={FLOAT_SHADOW}
					nodes={navNodes}
					searchable
					searchPlaceholder="Search sheets…"
					expandable={false}
					value={sheet.id}
					onSelect={(id) => {
						const i = SHEETS.findIndex((s) => s.id === id);
						if (i >= 0) setActiveSheetIndex(i);
					}}
					size={navSize}
					onSizeChange={setNavSize}
				/>
			</div>

			{/* Top-right: vertical zoom tools */}
			<div className="wwc:absolute wwc:right-3 wwc:top-3 wwc:z-10">
				<VerticalZoomTools
					className={FLOAT_SHADOW}
					zoomLevel={zoom}
					minZoom={0.25}
					maxZoom={4}
					onZoomIn={() => setZoom((z) => Math.min(4, z + 0.25))}
					onZoomOut={() => setZoom((z) => Math.max(0.25, z - 0.25))}
				/>
			</div>

			{/* Bottom-right: view-mode legend */}
			<div className="wwc:absolute wwc:bottom-3 wwc:right-3 wwc:z-10">
				<TabbedLegend
					title="View mode"
					className={FLOAT_SHADOW}
					tabs={VIEW_MODE_TABS}
					shape="circle"
					placement="static"
				/>
			</div>
		</div>
	);

	// Inline workspace shell (replaces the removed CanvasWorkspaceLayout). A flex column with a thin
	// app-bar row, the metric bar, then a relative flex-1 canvas stage hosting the floating overlays.
	// In presentation mode it promotes to a fixed full-viewport shell whose app bar hosts an Exit
	// control; the metric bar stays visible (it carries the primary header content).
	return (
		<div
			className={cn(
				"wwc:flex wwc:min-h-0 wwc:flex-col wwc:overflow-hidden wwc:bg-background wwc:text-foreground",
				presentation ? "wwc:fixed wwc:inset-0 wwc:z-50" : "wwc:relative wwc:h-full wwc:w-full",
			)}
		>
			{/* App Bar: rendered only in presentation mode, where it hosts the Exit control. */}
			{presentation && (
				<div className="wwc:z-20 wwc:flex wwc:h-12 wwc:shrink-0 wwc:items-center wwc:gap-2 wwc:border-b wwc:bg-background wwc:px-3">
					<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-2" />
					<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setPresentation(false)}
							aria-label="Exit presentation mode"
							className="wwc:gap-1.5"
						>
							<Minimize2 className="wwc:h-3.5 wwc:w-3.5" />
							<span className="wwc:text-sm wwc:font-medium">Exit</span>
						</Button>
					</div>
				</div>
			)}

			{/* Metric Bar stays put across both views (map + house) so nothing shifts on transition; it
			    gains a back button + clickable "Neighborhood" crumb while in the house view. */}
			{metricBar}

			{/* Canvas Stage. The house view is mounted underneath as soon as a house is chosen (during the
			    zoom) so its 3D scene starts loading straight away; the neighborhood map sits on top and
			    zooms + fades out during the transition, dissolving into the house level beneath. */}
			<div className="wwc:relative wwc:z-0 wwc:flex wwc:min-h-0 wwc:flex-1">
				{selectedHouseName && (view === "house" || phase !== "idle") && (
					<div className="wwc:absolute wwc:inset-0 wwc:overflow-hidden">
						<SingleHouseView onSettled={handleHouseSettled} />
					</div>
				)}
				{view === "map" && (
					<div
						className="wwc:absolute wwc:inset-0 wwc:z-10 wwc:overflow-hidden"
						// Opaque through "loading" (hides the loading 3D), then fades over the same 650ms the
						// zoom finishes — the cross-fade happens while zooming.
						style={
								phase === "revealing"
									? {opacity: 0, transition: "opacity 650ms ease-out"}
									: phase === "exit-start"
										? {opacity: 0}
										: phase === "exit"
											? {opacity: 1, transition: "opacity 650ms ease-in"}
											: undefined
							}
					>
						{canvas}
					</div>
				)}
			</div>
		</div>
	);
}
