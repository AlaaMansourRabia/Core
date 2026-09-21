// Blueprint Viewer v3 — a self-contained, editable duplicate of the published Blueprint Viewer
// (@core/core-ui/pages/core-blueprint-viewer) for iterating on a v3 design. Edit freely here; it
// does not affect the published component or the #2 demo. Promote to the package later if it sticks.
import {ChevronDown, Maximize2, Minimize2, PanelRight, X} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";

import {BlueprintSegment} from "../blueprint-segment";
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "../breadcrumb";
import {type BuildingFloor, BuildingProgress} from "../building-progress";
import {Button} from "../button";
import {CanvasHeader} from "../canvas-header";
import {CanvasNavigator, type CanvasNavigatorNode, type CanvasNavigatorSize} from "../canvas-navigator";
import {CompareBars} from "../compare-bars";
import {MilestoneTable} from "../milestone-table";
import {type WeekSelectorWeek} from "../week-selector";

// A slight drop shadow for the panels floating over the canvas (the app's `shadow-*` scale is `none`).
const FLOAT_SHADOW = "wwc:shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const clampPct = (n: number) => Math.max(2, Math.min(100, Math.round(n)));

// A house's stack of floors (ordered top → bottom, base furthest along). Drives the multi-blueprint
// split view, per-segment labels, and the "Progress by floor" list — so N floors → N segments.
type Floor = BuildingFloor & {name: string; hasBlueprint: boolean};

// Shared building design: every house is the same mid-rise villa type, so it uses one floor template.
// `base` is the typical completion for a mid-progress house; each house shifts the whole stack by its
// own overall progress, so navigating houses changes every floor's number.
type FloorTemplate = {id: string; label: string; name: string; hasBlueprint: boolean; base: number};
const FLOOR_TEMPLATE: FloorTemplate[] = [
	{id: "rf", label: "RF", name: "Roof", hasBlueprint: true, base: 34},
	{id: "l8", label: "L8", name: "Level 8", hasBlueprint: true, base: 41},
	{id: "l7", label: "L7", name: "Level 7", hasBlueprint: false, base: 47},
	{id: "l6", label: "L6", name: "Level 6", hasBlueprint: true, base: 52},
	{id: "l5", label: "L5", name: "Level 5", hasBlueprint: true, base: 58},
	{id: "l4", label: "L4", name: "Level 4", hasBlueprint: false, base: 63},
	{id: "l3", label: "L3", name: "Level 3", hasBlueprint: true, base: 69},
	{id: "l2", label: "L2", name: "Level 2", hasBlueprint: true, base: 75},
	{id: "l1", label: "L1", name: "Level 1", hasBlueprint: true, base: 81},
	{id: "gf", label: "GF", name: "Ground Floor", hasBlueprint: true, base: 88},
	{id: "b1", label: "B1", name: "Basement", hasBlueprint: true, base: 96},
];

// Derive a house's floor stack by shifting the shared template toward that house's overall %.
function houseFloors(approved: number): Floor[] {
	return FLOOR_TEMPLATE.map((t) => ({
		id: t.id,
		label: t.label,
		name: t.name,
		hasBlueprint: t.hasBlueprint,
		value: clampPct(t.base + (approved - 62)),
	}));
}

// Milestones with their swatch colours (this list is the milestone legend). `actual` is the achieved
// completion date (null = not yet reached); `planned` is the scheduled one.
type Milestone = {id: string; color: string; actual: string | null; planned: string};
const MILESTONES: Milestone[] = [
	{id: "M35", color: "#7c3aed", actual: "Aug-26", planned: "Sep-26"},
	{id: "M50", color: "#2563eb", actual: "Nov-26", planned: "Dec-26"},
	{id: "M65", color: "#38bdf8", actual: "Jan-27", planned: "Feb-27"},
	{id: "M80", color: "#5eead4", actual: null, planned: "May-27"},
	{id: "M95", color: "#01b04a", actual: null, planned: "Nov-27"},
	{id: "M100", color: "#42ff01", actual: null, planned: "Dec-27"},
];

// Weeks the schedule spans — feeds the week selector in the header toolbar.
const WEEKS: WeekSelectorWeek[] = [
	{value: "W109", start: new Date(2026, 5, 12), end: new Date(2026, 5, 18)},
	{value: "W110", start: new Date(2026, 5, 19), end: new Date(2026, 5, 25)},
	{value: "W111", start: new Date(2026, 5, 26), end: new Date(2026, 6, 2)},
	{value: "W112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
	{value: "W113", start: new Date(2026, 6, 10), end: new Date(2026, 6, 16)},
	{value: "W114", start: new Date(2026, 6, 17), end: new Date(2026, 6, 23)},
	{value: "W115", start: new Date(2026, 6, 24), end: new Date(2026, 6, 30)},
];

// Waypoints (in the floor-plan viewBox) that define the walk-through path.
const WALK_PATH = [
	{x: 150, y: 130},
	{x: 150, y: 350},
	{x: 350, y: 350},
	{x: 610, y: 350},
	{x: 850, y: 350},
	{x: 850, y: 500},
];

// A mock architectural floor plan that fills its container (viewBox keeps it aspect-correct).
// `walkPath` overlays a dotted walking route with hoverable / clickable waypoints (entering the
// walkthrough isn't wired up yet — the points just show the affordance).
function FloorPlan({className, walkPath = false}: {className?: string; walkPath?: boolean}) {
	return (
		<svg
			viewBox="0 0 1000 680"
			preserveAspectRatio="xMidYMid meet"
			className={className}
			role="img"
			aria-label="Ground floor plan"
		>
			<rect x="0" y="0" width="1000" height="680" fill="#ffffff" />
			{/* Outer shell */}
			<rect x="60" y="60" width="880" height="560" fill="none" stroke="#3f3f46" strokeWidth="4" />
			<g fill="none" stroke="#52525b" strokeWidth="2">
				{/* Central corridor */}
				<rect x="60" y="320" width="880" height="60" />
				{/* Left offices */}
				<rect x="60" y="60" width="180" height="130" />
				<rect x="60" y="190" width="180" height="130" />
				<rect x="60" y="380" width="180" height="120" />
				<rect x="60" y="500" width="180" height="120" />
				{/* Middle rooms */}
				<rect x="240" y="60" width="220" height="260" />
				<line x1="350" y1="60" x2="350" y2="320" />
				<rect x="240" y="380" width="220" height="240" />
				{/* Meeting / open plan */}
				<rect x="460" y="60" width="300" height="130" />
				<rect x="460" y="190" width="300" height="130" />
				<rect x="460" y="380" width="300" height="240" />
				<line x1="610" y1="380" x2="610" y2="620" />
				{/* Right services */}
				<rect x="760" y="60" width="180" height="260" />
				<line x1="760" y1="150" x2="940" y2="150" />
				<line x1="760" y1="230" x2="940" y2="230" />
				<rect x="760" y="380" width="180" height="240" />
			</g>
			{/* Door swings + fixtures */}
			<g fill="none" stroke="#a1a1aa" strokeWidth="1.5">
				<path d="M150 320 A 30 30 0 0 1 180 350" />
				<path d="M350 320 A 30 30 0 0 1 380 350" />
				<path d="M610 320 A 30 30 0 0 1 640 350" />
				<circle cx="850" cy="480" r="26" />
				<circle cx="330" cy="500" r="26" />
			</g>

			{walkPath && (
				<g>
					{/* Dotted route line connecting the waypoints */}
					<polyline
						points={WALK_PATH.map((p) => `${p.x},${p.y}`).join(" ")}
						fill="none"
						stroke="#2563eb"
						strokeWidth="4"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeDasharray="1 16"
					/>
					{/* Hoverable / clickable waypoints */}
					{WALK_PATH.map((p, i) => (
						<g key={`${p.x}-${p.y}`} className="wwc:group wwc:cursor-pointer">
							<title>Enter walk-through at point {i + 1}</title>
							<circle cx={p.x} cy={p.y} r="26" fill="transparent" />
							<circle
								cx={p.x}
								cy={p.y}
								r="20"
								className="wwc:fill-blue-500/25 wwc:opacity-0 wwc:transition-opacity wwc:group-hover:opacity-100"
							/>
							<circle cx={p.x} cy={p.y} r="9" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
						</g>
					))}
				</g>
			)}
		</svg>
	);
}

// The split view divides the canvas into one section per tab/level — sibling blueprints under the same
// parent. It splits by count: 1 → single, 2/4 → two columns, otherwise three columns; up to six sections
// fill the canvas, and any beyond that keep the six-up size (two rows visible) and scroll.
function SplitBlueprints({
	floors,
	activeId,
	pan,
	isPanning,
	onWalkthrough,
}: {
	floors: Floor[];
	activeId?: string;
	pan: {x: number; y: number};
	isPanning: boolean;
	onWalkthrough?: (floor: Floor) => void;
}) {
	// Every floor gets a segment, in order — even floors with no blueprint (they show a "No blueprint"
	// placeholder instead of a plan).
	const count = floors.length;
	const cols = count <= 1 ? 1 : count === 2 || count === 4 ? 2 : 3;
	const scroll = count > 6;
	const rows = Math.ceil(count / cols);
	return (
		<div
			className={`wwc:absolute wwc:inset-0 wwc:grid ${scroll ? "wwc:overflow-y-auto" : ""}`}
			style={{
				gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
				...(scroll ? {gridAutoRows: "50%"} : {gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`}),
			}}
		>
			{floors.map((floor, i) => (
				// One BlueprintSegment per floor. `bare` drops its card frame so the grid stays seamless
				// (divided by inner border lines only); the plan carries the shared pan transform.
				<BlueprintSegment
					key={floor.id}
					bare
					active={floor.id === activeId}
					className={`${i % cols > 0 ? "wwc:border-l wwc:border-border" : ""} ${
						Math.floor(i / cols) > 0 ? "wwc:border-t wwc:border-border" : ""
					}`}
					label={floor.label}
					value={floor.value}
					// The first (top-left) segment's label drops below the collapsed navigator so it isn't hidden.
					labelClassName={i === 0 ? "wwc:top-[56px]" : undefined}
					plan={
						floor.hasBlueprint ? (
							<div
								className={`wwc:h-full wwc:w-full wwc:origin-center ${isPanning ? "" : "wwc:transition-transform wwc:duration-75"}`}
								style={{transform: `translate(${pan.x}px, ${pan.y}px)`}}
							>
								<FloorPlan className="wwc:h-full wwc:w-full" />
							</div>
						) : undefined
					}
					onWalkthrough={floor.hasBlueprint ? () => onWalkthrough?.(floor) : undefined}
				/>
			))}
		</div>
	);
}

// The navigator "layers": the compound is split into zones, each holding a set of houses. Floors are
// viewed per house (in the grid + the side panel), so the navigator drills zones → houses; selecting
// a house drives the canvas. Each house carries its own approved-vs-planned progress.
type House = {id: string; label: string; zoneId: string; zoneLabel: string; approved: number; planned: number};

// Deterministic pseudo-variation in [-span, span] so per-house numbers vary but stay stable.
function wiggle(i: number, span: number): number {
	return ((i * 37) % (span * 2 + 1)) - span;
}

const ZONE_DEFS: {id: string; label: string; prefix: string; count: number; baseApproved: number}[] = [
	{id: "zone-a", label: "Zone A — Waterfront", prefix: "A", count: 8, baseApproved: 74},
	{id: "zone-b", label: "Zone B — Central", prefix: "B", count: 8, baseApproved: 58},
	{id: "zone-c", label: "Zone C — Parkside", prefix: "C", count: 6, baseApproved: 39},
];

const HOUSES: House[] = ZONE_DEFS.flatMap((z) =>
	Array.from({length: z.count}, (_, i) => {
		const approved = clampPct(z.baseApproved + wiggle(i + 1, 9));
		return {
			id: `house-${z.prefix.toLowerCase()}${String(i + 1).padStart(2, "0")}`,
			label: `HOUSE-${z.prefix}${String(i + 1).padStart(2, "0")}`,
			zoneId: z.id,
			zoneLabel: z.label,
			approved,
			// Usually a little behind schedule (planned > approved); occasionally ahead.
			planned: clampPct(approved + 3 + wiggle(i + 2, 6)),
		};
	}),
);

// The compound is the top of the breadcrumb hierarchy. The navigator mirrors the full path shown in the
// breadcrumb — Compound → Zone → House → Floor. Floor ids are house-scoped so they stay unique.
const COMPOUND = {id: "riverside-compound", label: "Riverside Compound"};
const NAV_NODES: CanvasNavigatorNode[] = [
	{
		id: COMPOUND.id,
		label: COMPOUND.label,
		children: ZONE_DEFS.map((z) => ({
			id: z.id,
			label: z.label,
			children: HOUSES.filter((h) => h.zoneId === z.id).map((h) => ({
				id: h.id,
				label: h.label,
				children: houseFloors(h.approved).map((f) => ({id: `${h.id}::${f.id}`, label: f.name})),
			})),
		})),
	},
];

/** A floor whose per-blueprint walk-through button was pressed. */
export type BlueprintViewer3WalkthroughFloor = {id: string; label: string; name: string; value: number};

export interface BlueprintViewer3Props {
	/** Fired when a blueprint segment's walk-through button is clicked (host opens its walk-through UI). */
	onWalkthrough?: (floor: BlueprintViewer3WalkthroughFloor) => void;
}

/**
 * v3 blueprint viewer: a fixed multi-floor split canvas (pan by drag) with a collapsed canvas navigator
 * (top-left, drills zones → houses), and a scrollable full-height details panel — the active house's
 * progress, milestones table, and a Building Progress floor list that highlights the selected floor.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the BlueprintViewer3 template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function BlueprintViewer3({onWalkthrough}: BlueprintViewer3Props = {}) {
	const canvasRef = useRef<HTMLDivElement>(null);
	const [floorsOpen, setFloorsOpen] = useState(true);
	// The right-side details panel can be closed (and reopened via the "Show details" button).
	const [showPanel, setShowPanel] = useState(true);
	const [week, setWeek] = useState("W112");
	// Full-screen promotes the viewer to a fixed full-viewport overlay (exit with the button or Esc).
	const [fullScreen, setFullScreen] = useState(false);
	// v3: the canvas navigator starts collapsed and drills zones → houses (the layers above floors).
	const [navSize, setNavSize] = useState<CanvasNavigatorSize>("collapsed");
	const [activeHouse, setActiveHouse] = useState(HOUSES[0].id);
	const activeHouseData = HOUSES.find((h) => h.id === activeHouse) ?? HOUSES[0];
	// Every house shares the villa design but has its own progress, so its floor stack is derived here.
	const floors = useMemo(() => houseFloors(activeHouseData.approved), [activeHouseData.approved]);
	// The active floor highlights its grid box + the progress list row (the grid always shows all floors).
	const [activeFloor, setActiveFloor] = useState("gf");
	const activeFloorData = floors.find((f) => f.id === activeFloor);
	const selectFloor = (id: string) => setActiveFloor(id);
	const [pan, setPan] = useState({x: 0, y: 0});
	const [isPanning, setIsPanning] = useState(false);
	// Snapshot of the drag origin + pan offset at pointer-down, so moves compute an absolute offset.
	const panStart = useRef<{pointerX: number; pointerY: number; panX: number; panY: number} | null>(null);

	// Esc exits full-screen.
	useEffect(() => {
		if (!fullScreen) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setFullScreen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [fullScreen]);

	// Click-drag anywhere on the canvas backdrop pans the blueprint. Pointer capture keeps the drag
	// alive even if the cursor leaves the surface; the z-10 overlays sit above and take their own clicks.
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

	return (
		<div
			className={
				fullScreen
					? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:overflow-hidden wwc:bg-background"
					: "wwc:h-full wwc:w-full wwc:overflow-hidden"
			}
		>
			<div className="wwc:flex wwc:h-full wwc:flex-col">
				{/* ── Header: the shared CanvasHeader widget (breadcrumb · week selector + full-screen). ─── */}
				<CanvasHeader
					left={
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href="#">{COMPOUND.label}</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								{/* Collapse the middle levels (zone) into the ellipsis dropdown per the breadcrumb's own rules. */}
								<BreadcrumbItem>
									<BreadcrumbEllipsis items={[{label: activeHouseData.zoneLabel}]} />
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbLink href="#">{activeHouseData.label}</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage>{activeFloorData?.name}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					}
					weekSelector={{weeks: WEEKS, value: week, onValueChange: setWeek, visibleCount: 4}}
					right={
						<Button
							type="button"
							variant="outline"
							icon
							size="sm"
							aria-label={fullScreen ? "Exit full screen" : "Full screen"}
							className="wwc:shrink-0"
							onClick={() => setFullScreen((v) => !v)}
						>
							{fullScreen ? <Minimize2 className="wwc:h-4 wwc:w-4" /> : <Maximize2 className="wwc:h-4 wwc:w-4" />}
						</Button>
					}
				/>

				<div className="wwc:flex wwc:min-h-0 wwc:flex-1">
					{/* ── Canvas ─────────────────────────────────────────── */}
					<div
						ref={canvasRef}
						className="wwc:relative wwc:flex-1 wwc:overflow-hidden wwc:bg-zinc-100 dark:wwc:bg-zinc-900"
					>
						{/* Map layer: the multi-floor split is fixed — the viewer always shows all floors at once.
						    Clicking a floor in the panel highlights that floor's grid box via `activeId`. */}
						<SplitBlueprints
							floors={floors}
							activeId={activeFloor}
							pan={pan}
							isPanning={isPanning}
							onWalkthrough={onWalkthrough}
						/>

						{/* Pan surface: drag the canvas to pan (single or split). Below the z-10 overlays so their clicks land. */}
						<div
							className={`wwc:absolute wwc:inset-0 wwc:z-0 ${isPanning ? "wwc:cursor-grabbing" : "wwc:cursor-grab"}`}
							onPointerDown={startPan}
							onPointerMove={movePan}
							onPointerUp={endPan}
							onPointerCancel={endPan}
						/>

						{/* Top-left: full-hierarchy navigator (compound → zone → house → floor), starts collapsed. */}
						<div className="wwc:absolute wwc:left-[14px] wwc:top-[14px] wwc:z-10 wwc:w-64 wwc:max-w-[60%]">
							<CanvasNavigator
								className={FLOAT_SHADOW}
								nodes={NAV_NODES}
								title={COMPOUND.label}
								searchable
								searchPlaceholder="Search…"
								value={activeHouse}
								onSelect={(id) => {
									// Floor leaves are house-scoped ("<houseId>::<floorId>"); houses are plain ids.
									const sep = id.indexOf("::");
									if (sep >= 0) {
										setActiveHouse(id.slice(0, sep));
										setActiveFloor(id.slice(sep + 2));
									} else if (HOUSES.some((h) => h.id === id)) {
										setActiveHouse(id);
									}
								}}
								size={navSize}
								onSizeChange={setNavSize}
							/>
						</div>

						{/* Top-right: reopen the details panel when it's closed. */}
						<div className="wwc:absolute wwc:right-[14px] wwc:top-[14px] wwc:z-10 wwc:flex wwc:flex-col wwc:items-end wwc:gap-2">
							{!showPanel && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									className={`wwc:gap-1.5 ${FLOAT_SHADOW}`}
									onClick={() => setShowPanel(true)}
								>
									<PanelRight className="wwc:size-4" />
									Show details
								</Button>
							)}
						</div>
					</div>

					{/* ── Full-height details panel (from the right); closable via its X, reopened via "Show details". ─── */}
					{showPanel && (
						<aside
							className={`wwc:z-20 wwc:flex wwc:h-full wwc:w-72 wwc:shrink-0 wwc:flex-col wwc:border-l wwc:border-border wwc:bg-white dark:wwc:bg-zinc-950 ${FLOAT_SHADOW}`}
						>
							{/* Header: project id + close (compact sizing mirrors ProgressComparison) */}
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:p-3">
								<span className="wwc:text-sm wwc:font-bold wwc:text-foreground">{activeHouseData?.label}</span>
								<button
									type="button"
									aria-label="Close panel"
									className="wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground wwc:focus-visible:outline-none"
									onClick={() => setShowPanel(false)}
								>
									<X className="wwc:size-3.5" />
								</button>
							</div>
							<div className="wwc:h-px wwc:w-full wwc:bg-border" />

							{/* Everything below the fixed header scrolls when the content overflows. */}
							<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-y-auto">
								{/* Progress comparison (house-level): approved vs planned — the CompareBars primitive. */}
								<CompareBars
									className="wwc:p-3"
									primary={{label: "Approved", value: activeHouseData.approved}}
									secondary={{label: "Planned", value: activeHouseData.planned}}
								/>
								<div className="wwc:h-px wwc:w-full wwc:bg-border" />

								{/* Milestones: the shared MilestoneTable component. */}
								<div className="wwc:p-3">
									<MilestoneTable milestones={MILESTONES} />
								</div>
								<div className="wwc:h-px wwc:w-full wwc:bg-border" />

								{/* Progress by floor: collapsible tapered building-elevation list (same header as Milestones). */}
								<div className="wwc:flex wwc:min-h-0 wwc:flex-col wwc:gap-2.5 wwc:p-3">
									<button
										type="button"
										aria-expanded={floorsOpen}
										onClick={() => setFloorsOpen((v) => !v)}
										className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:text-left wwc:focus-visible:outline-none"
									>
										<span className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground">Progress by floor</span>
										<ChevronDown
											className={`wwc:size-3.5 wwc:text-muted-foreground wwc:transition-transform ${
												floorsOpen ? "" : "wwc:-rotate-90"
											}`}
										/>
									</button>

									{floorsOpen && (
										<BuildingProgress
											floors={floors}
											activeId={activeFloor}
											onFloorSelect={selectFloor}
											size="compact"
										/>
									)}
								</div>
							</div>
						</aside>
					)}
				</div>
			</div>
		</div>
	);
}
