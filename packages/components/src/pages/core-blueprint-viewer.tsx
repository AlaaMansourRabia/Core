import {ArrowRight, LayoutGrid, Maximize2, Minimize2, PanelRight, TrendingDown, Video, X} from "lucide-react";
import {useEffect, useRef, useState} from "react";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "../breadcrumb";
import {type BuildingFloor, BuildingProgress} from "../building-progress";
import {Button} from "../button";
import {CanvasNavigator, type CanvasNavigatorNode, type CanvasNavigatorSize} from "../canvas-navigator";
import {Toggle} from "../toggle";
import {Toolbar, ToolbarButton} from "../toolbar";
import {HoverTooltip, TooltipProvider} from "../tooltip";
import {VerticalZoomTools} from "../vertical-zoom-tools";
import {WeekSelector, type WeekSelectorWeek} from "../week-selector";

// A slight drop shadow for the panels floating over the canvas (the app's `shadow-*` scale is `none`).
const FLOAT_SHADOW = "wwc:shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

// Floors ordered top → bottom (base is furthest along). This single list drives the top-center tabs,
// the multi-blueprint split view, and the "Progress by floor" list — so N floors → N tabs.
type Floor = BuildingFloor & {name: string};

const BUILDING_FLOORS: Floor[] = [
	{id: "rf", label: "RF", name: "Roof", value: 81},
	{id: "uf", label: "UF", name: "Upper Floor", value: 31},
	{id: "ff", label: "FF", name: "First Floor", value: 61},
	{id: "gf", label: "GF", name: "Ground Floor", value: 41},
	{id: "sub", label: "SUB", name: "Basement", value: 96},
];

const FLOOR_TABS = BUILDING_FLOORS.map((f) => ({value: f.id, label: f.label}));

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
	levels,
	zoom,
	pan,
	isPanning,
}: {
	levels: typeof FLOOR_TABS;
	zoom: number;
	pan: {x: number; y: number};
	isPanning: boolean;
}) {
	const count = levels.length;
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
			{levels.map((lvl, i) => (
				// Sections are divided by inner border lines only, so the canvas keeps no outer outline.
				<div
					key={lvl.value}
					className={`wwc:relative wwc:overflow-hidden ${i % cols > 0 ? "wwc:border-l wwc:border-border" : ""} ${
						Math.floor(i / cols) > 0 ? "wwc:border-t wwc:border-border" : ""
					}`}
				>
					<div
						className={`wwc:h-full wwc:w-full wwc:origin-center ${isPanning ? "" : "wwc:transition-transform wwc:duration-75"}`}
						style={{transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`}}
					>
						<FloorPlan className="wwc:h-full wwc:w-full" />
					</div>
					<span
						className={`wwc:absolute wwc:left-3 wwc:top-3 wwc:rounded-md wwc:bg-white/90 wwc:px-2 wwc:py-1 wwc:text-[11px] wwc:font-semibold wwc:text-foreground dark:wwc:bg-zinc-900/90 ${FLOAT_SHADOW}`}
					>
						{lvl.label}
					</span>
				</div>
			))}
		</div>
	);
}

// Floors as a searchable navigator tree — one branch per building, each floor a leaf.
const NAV_NODES: CanvasNavigatorNode[] = [
	{
		id: "house-12-f0",
		label: "HOUSE-12-F0",
		children: BUILDING_FLOORS.map((f) => ({id: f.id, label: f.name})),
	},
];

/**
 * Single-blueprint viewer at the lowest hierarchy level: a pan/zoom SVG floor-plan canvas with a
 * searchable floor navigator (top-left), a "Show Multiple" split view (top-center), zoom tools
 * (top-right), and a full-height Building Progress side panel.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the BlueprintViewer template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function BlueprintViewer() {
	const [zoom, setZoom] = useState(1);
	const canvasRef = useRef<HTMLDivElement>(null);
	const [showMultiple, setShowMultiple] = useState(false);
	// The right-side details panel can be closed (and reopened via the "Show details" button).
	const [showPanel, setShowPanel] = useState(true);
	const [week, setWeek] = useState("W112");
	// Full-screen promotes the viewer to a fixed full-viewport overlay (exit with the button or Esc).
	const [fullScreen, setFullScreen] = useState(false);
	const [navSize, setNavSize] = useState<CanvasNavigatorSize>("default");
	// The navigator and the panel's floor list share one selection.
	const [activeFloor, setActiveFloor] = useState("gf");
	const activeFloorData = BUILDING_FLOORS.find((f) => f.id === activeFloor);
	// Picking a floor (from the navigator or the progress list) selects it and drops back to single view.
	const selectFloor = (id: string) => {
		setActiveFloor(id);
		setShowMultiple(false);
	};
	const [pan, setPan] = useState({x: 0, y: 0});
	const [isPanning, setIsPanning] = useState(false);
	// Snapshot of the drag origin + pan offset at pointer-down, so moves compute an absolute offset.
	const panStart = useRef<{pointerX: number; pointerY: number; panX: number; panY: number} | null>(null);

	// Wheel over the canvas zooms the blueprint (non-passive so the page doesn't scroll).
	useEffect(() => {
		const el = canvasRef.current;
		if (!el) return;
		const onWheel = (event: WheelEvent) => {
			event.preventDefault();
			setZoom((z) => Math.min(4, Math.max(0.25, Number((z * (event.deltaY < 0 ? 1.1 : 1 / 1.1)).toFixed(3)))));
		};
		el.addEventListener("wheel", onWheel, {passive: false});
		return () => el.removeEventListener("wheel", onWheel);
	}, []);

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
				{/* ── Header toolbar: breadcrumbs (left), week selector + full-screen (right). Matches the
				    Blueprint Navigator #2 metric bar exactly: min-h-12 + border-b = 49px, px-3, bg-background. ─── */}
				<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:border-b wwc:border-border wwc:bg-background wwc:px-3">
					<div className="wwc:grid wwc:h-full wwc:min-h-12 wwc:w-full wwc:grid-cols-3 wwc:items-center wwc:gap-4">
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href="#">Villa 1</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbLink href="#">HOUSE-12-F0</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage>{activeFloorData?.name}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
						<div aria-hidden="true" />
						<div className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-2">
							<WeekSelector
								className="wwc:shrink-0 wwc:border-0 wwc:bg-transparent wwc:px-0 wwc:py-0"
								weeks={WEEKS}
								value={week}
								onValueChange={setWeek}
								visibleCount={4}
							/>
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
						</div>
					</div>
				</div>

				<div className="wwc:flex wwc:min-h-0 wwc:flex-1">
					{/* ── Canvas ─────────────────────────────────────────── */}
					<div
						ref={canvasRef}
						className="wwc:relative wwc:flex-1 wwc:overflow-hidden wwc:bg-zinc-100 dark:wwc:bg-zinc-900"
					>
						{/* Map layer: the multi-floor split or a single blueprint — both pan + zoom together. */}
						{showMultiple ? (
							<SplitBlueprints levels={FLOOR_TABS} zoom={zoom} pan={pan} isPanning={isPanning} />
						) : (
							<div className="wwc:absolute wwc:inset-0">
								<div
									className={`wwc:h-full wwc:w-full wwc:origin-center ${isPanning ? "" : "wwc:transition-transform wwc:duration-75"}`}
									style={{transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`}}
								>
									<FloorPlan className="wwc:h-full wwc:w-full" />
								</div>
							</div>
						)}

						{/* Pan surface: drag the canvas to pan (single or split). Below the z-10 overlays so their clicks land. */}
						<div
							className={`wwc:absolute wwc:inset-0 wwc:z-0 ${isPanning ? "wwc:cursor-grabbing" : "wwc:cursor-grab"}`}
							onPointerDown={startPan}
							onPointerMove={movePan}
							onPointerUp={endPan}
							onPointerCancel={endPan}
						/>

						{/* Top-left: searchable floor navigator */}
						<div className="wwc:absolute wwc:left-[14px] wwc:top-[14px] wwc:z-10 wwc:w-64 wwc:max-w-[60%]">
							<CanvasNavigator
								className={FLOAT_SHADOW}
								nodes={NAV_NODES}
								searchable
								searchPlaceholder="Search floors…"
								expandable={false}
								value={activeFloor}
								onSelect={selectFloor}
								size={navSize}
								onSizeChange={setNavSize}
							/>
						</div>

						{/* Top-center: Show Multiple toggle — only when the details panel is closed (the panel hosts
						    its own "Show multiple floors" button while open). */}
						{!showPanel && (
							<div className="wwc:absolute wwc:left-1/2 wwc:top-[14px] wwc:z-20 wwc:-translate-x-1/2">
								<Toggle
									variant="outline"
									size="sm"
									pressed={showMultiple}
									onPressedChange={setShowMultiple}
									aria-label="Show multiple floors"
									className={`wwc:gap-1.5 wwc:bg-background ${FLOAT_SHADOW}`}
								>
									<LayoutGrid className="wwc:size-4" />
									Show Multiple
								</Toggle>
							</div>
						)}

						{/* Top-right: reopen the details panel (when closed) above the zoom tools — which nudge down
						    to make room — and a walk-through (video) button below them. */}
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
							<VerticalZoomTools
								className={FLOAT_SHADOW}
								zoomLevel={zoom}
								minZoom={0.25}
								maxZoom={4}
								onZoomIn={() => setZoom((z) => Math.min(4, z + 0.25))}
								onZoomOut={() => setZoom((z) => Math.max(0.25, z - 0.25))}
							/>
							{/* Walk-through lives in the panel while it's open; when closed, this takes over. Built from the
							    same Toolbar + ToolbarButton as the map toolbars, so it matches the zoom tools' radius + tooltip. */}
							{!showPanel && (
								<TooltipProvider delayDuration={200}>
									<Toolbar
										orientation="vertical"
										aria-label="Walk-through"
										className={`wwc:w-10 wwc:py-1 ${FLOAT_SHADOW}`}
									>
										<HoverTooltip content="View walk-through" side="left">
											<ToolbarButton icon label="View walk-through">
												<Video className="wwc:h-4 wwc:w-4" />
											</ToolbarButton>
										</HoverTooltip>
									</Toolbar>
								</TooltipProvider>
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
								<span className="wwc:text-sm wwc:font-bold wwc:text-foreground">HOUSE-12-F0</span>
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

							{/* Hero comparison (hidden when showing multiple blueprints — there's no single active floor). */}
							{!showMultiple && (
								<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:p-3">
									<span className="wwc:text-[11px] wwc:text-muted-foreground">{activeFloorData?.name}</span>
									<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
										<span className="wwc:text-xl wwc:font-bold wwc:leading-none wwc:text-foreground">67%</span>
										<div className="wwc:flex wwc:items-center wwc:gap-0.5 wwc:rounded wwc:bg-destructive/10 wwc:px-1.5 wwc:py-0.5 wwc:text-destructive">
											<TrendingDown className="wwc:size-3" />
											<span className="wwc:text-[11px] wwc:font-semibold">-4%</span>
											<span className="wwc:text-[11px]">variance</span>
										</div>
										<span className="wwc:text-xl wwc:font-bold wwc:leading-none wwc:text-zinc-500">71%</span>
									</div>
									<div className="wwc:flex wwc:items-center wwc:justify-between">
										<div className="wwc:flex wwc:items-center wwc:gap-1.5">
											<span className="wwc:size-1.5 wwc:rounded-sm wwc:bg-foreground" />
											<span className="wwc:text-[10px] wwc:text-foreground">Approved</span>
										</div>
										<div className="wwc:flex wwc:items-center wwc:gap-1.5">
											<span className="wwc:size-1.5 wwc:rounded-sm wwc:bg-zinc-500" />
											<span className="wwc:text-[10px] wwc:text-zinc-500">Planned</span>
										</div>
									</div>
									<div className="wwc:flex wwc:flex-col wwc:gap-0.5 wwc:py-0.5">
										<div className="wwc:h-2 wwc:w-full wwc:overflow-hidden wwc:rounded-sm wwc:bg-muted">
											<div className="wwc:h-full wwc:rounded-sm wwc:bg-foreground" style={{width: "67%"}} />
										</div>
										<div className="wwc:h-2 wwc:w-full wwc:overflow-hidden wwc:rounded-sm wwc:bg-muted">
											<div className="wwc:h-full wwc:rounded-sm wwc:bg-zinc-500/40" style={{width: "71%"}} />
										</div>
									</div>
								</div>
							)}
							{!showMultiple && <div className="wwc:h-px wwc:w-full wwc:bg-border" />}

							{/* Progress by floor: tapered building-elevation list + the multi-blueprint toggle */}
							<div className="wwc:flex wwc:min-h-0 wwc:flex-col wwc:gap-2 wwc:p-3">
								<span className="wwc:text-[11px] wwc:font-semibold wwc:text-foreground">Progress by floor</span>
								<BuildingProgress
									floors={BUILDING_FLOORS}
									activeId={showMultiple ? undefined : activeFloor}
									onFloorSelect={selectFloor}
									size="compact"
								/>
								<Toggle
									variant="outline"
									pressed={showMultiple}
									onPressedChange={setShowMultiple}
									aria-label="Show multiple floors"
									className="wwc:mt-1 wwc:w-full wwc:gap-1.5 wwc:text-[13px]"
								>
									<LayoutGrid className="wwc:size-4" />
									Show multiple floors
								</Toggle>
							</div>
							<div className="wwc:h-px wwc:w-full wwc:bg-border" />

							{/* Walk-through action fills the remaining height */}
							<div className="wwc:flex-1 wwc:p-3">
								<button
									type="button"
									className="wwc:flex wwc:h-9 wwc:w-full wwc:items-center wwc:justify-center wwc:gap-1.5 wwc:rounded-lg wwc:bg-foreground wwc:text-[13px] wwc:font-semibold wwc:text-background wwc:transition-opacity wwc:hover:opacity-90 wwc:focus-visible:outline-none"
								>
									View Walk-through
									<ArrowRight className="wwc:size-3.5" />
								</button>
							</div>
						</aside>
					)}
				</div>
			</div>
		</div>
	);
}
