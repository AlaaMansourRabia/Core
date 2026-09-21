// 3D Model Viewer — a layout duplicate of Blueprint Viewer #3 with the canvas swapped for a 3D model
// renderer. When no model is assigned to a house it falls back to a stack of square floor plates (one
// per floor in the view), rendered with dependency-free CSS 3D and drag-to-orbit. Same metric bar,
// canvas navigator, and details panel as Blueprint Viewer #3.
import {ChevronDown, Maximize2, Minimize2, PanelRight, X} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";

import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {BuildingModelPlaceholder} from "@/components/ui/building-model-placeholder";
import {type BuildingFloor, BuildingProgress} from "@/components/ui/building-progress";
import {Button} from "@/components/ui/button";
import {CanvasHeader} from "@/components/ui/canvas-header";
import {CanvasNavigator, type CanvasNavigatorNode, type CanvasNavigatorSize} from "@/components/ui/canvas-navigator";
import {
	type CapturePoint,
	CaptureRouteMinimap,
	captureRouteForFloor,
	FloorPlan,
} from "@/components/ui/capture-route-minimap";
import {CompareBars} from "@/components/ui/compare-bars";
import {CopyButton} from "@/components/ui/copy-button";
import {MilestoneTable} from "@/components/ui/milestone-table";
import {WalkthroughModal} from "@/components/ui/walkthrough-modal";
import {type WeekSelectorWeek} from "@/components/ui/week-selector";

// A slight drop shadow for the panels floating over the canvas (the app's `shadow-*` scale is `none`).
const FLOAT_SHADOW = "wwc:shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const clampPct = (n: number) => Math.max(2, Math.min(100, Math.round(n)));

// A house's stack of floors (ordered top → bottom, base furthest along). Drives the 3D floor stack, the
// per-floor list, and the "Progress by floor" panel — so N floors → N stacked plates.
type Floor = BuildingFloor & {name: string; hasBlueprint: boolean};

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

// Weeks for the header's period selector (matches Blueprint Viewer #3).
const WEEKS: WeekSelectorWeek[] = [
	{value: "W109", start: new Date(2026, 5, 12), end: new Date(2026, 5, 18)},
	{value: "W110", start: new Date(2026, 5, 19), end: new Date(2026, 5, 25)},
	{value: "W111", start: new Date(2026, 5, 26), end: new Date(2026, 6, 2)},
	{value: "W112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
	{value: "W113", start: new Date(2026, 6, 10), end: new Date(2026, 6, 16)},
	{value: "W114", start: new Date(2026, 6, 17), end: new Date(2026, 6, 23)},
	{value: "W115", start: new Date(2026, 6, 24), end: new Date(2026, 6, 30)},
];

type Milestone = {id: string; color: string; actual: string | null; planned: string};
const MILESTONES: Milestone[] = [
	{id: "M35", color: "#7c3aed", actual: "Aug-26", planned: "Sep-26"},
	{id: "M50", color: "#2563eb", actual: "Nov-26", planned: "Dec-26"},
	{id: "M65", color: "#38bdf8", actual: "Jan-27", planned: "Feb-27"},
	{id: "M80", color: "#5eead4", actual: null, planned: "May-27"},
	{id: "M95", color: "#01b04a", actual: null, planned: "Nov-27"},
	{id: "M100", color: "#42ff01", actual: null, planned: "Dec-27"},
];

// The navigator "layers": the compound is split into zones, each holding a set of houses. Floors are
// viewed per house, so the navigator drills zones → houses; selecting a house drives the 3D view.
type House = {id: string; label: string; zoneId: string; zoneLabel: string; approved: number; planned: number};

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
			planned: clampPct(approved + 3 + wiggle(i + 2, 6)),
		};
	}),
);

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

/**
 * 3D model viewer: the Blueprint Viewer #3 layout with the canvas replaced by a 3D renderer. No model
 * is assigned in this demo, so the canvas falls back to a drag-to-orbit stack of square floor plates —
 * one per floor of the active house. The collapsed navigator (compound → zone → house → floor) and the
 * full-height details panel (progress, milestones, Building Progress) are unchanged.
 */
function ModelViewer() {
	const floorsSectionRef = useRef<HTMLDivElement>(null);
	const [floorsOpen, setFloorsOpen] = useState(true);
	const [showPanel, setShowPanel] = useState(true);
	const [fullScreen, setFullScreen] = useState(false);
	const [navSize, setNavSize] = useState<CanvasNavigatorSize>("collapsed");
	const [week, setWeek] = useState("W112");
	const [activeHouse, setActiveHouse] = useState(HOUSES[0].id);
	const activeHouseData = HOUSES.find((h) => h.id === activeHouse) ?? HOUSES[0];
	const floors = useMemo(() => houseFloors(activeHouseData.approved), [activeHouseData.approved]);
	const [activeFloor, setActiveFloor] = useState("gf");
	const activeFloorData = floors.find((f) => f.id === activeFloor);

	// Each floor has its own blueprint: seed the plan + capture walk from the floor's position, so every
	// level reads distinctly. Floors without a captured blueprint show a placeholder (no walk).
	const floorSeed = FLOOR_TEMPLATE.findIndex((t) => t.id === activeFloor) + 1;
	const capturePoints = useMemo(
		() => (activeFloorData?.hasBlueprint ? captureRouteForFloor(floorSeed) : []),
		[activeFloorData?.hasBlueprint, floorSeed],
	);
	// Clicking a capture point opens the Map Compare Layout (with session timeline) for that photo.
	const [openCapture, setOpenCapture] = useState<CapturePoint | null>(null);
	const openIndex = openCapture ? capturePoints.findIndex((p) => p.id === openCapture.id) : -1;

	// Only an explicit floor selection (clicking a layer) should scroll the panel to that row. On first
	// open the panel stays at the top; this flag arms the scroll effect just for user-driven selections.
	const scrollOnSelectRef = useRef(false);

	// Selecting a floor (from the 3D view or the navigator) reveals the details panel, expands the
	// "Progress by floor" section, and scrolls it to the highlighted row (see the effect below).
	const selectFloor = (id: string) => {
		scrollOnSelectRef.current = true;
		setActiveFloor(id);
		setShowPanel(true);
		setFloorsOpen(true);
	};

	// Esc exits full-screen.
	useEffect(() => {
		if (!fullScreen) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setFullScreen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [fullScreen]);

	// Scroll the details panel to the highlighted floor row — but only after an explicit floor selection
	// (the flag armed by `selectFloor`). On first open the panel simply stays scrolled at the top.
	useEffect(() => {
		if (!scrollOnSelectRef.current || !showPanel || !floorsOpen) return;
		scrollOnSelectRef.current = false;
		const row = floorsSectionRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
		row?.scrollIntoView({behavior: "smooth", block: "nearest"});
	}, [activeFloor, showPanel, floorsOpen]);

	return (
		<>
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
						{/* ── Canvas: the 3D building placeholder (no BIM model assigned) + floating overlays. ─── */}
						<div className="wwc:relative wwc:flex-1 wwc:overflow-hidden">
							<BuildingModelPlaceholder
								className="wwc:absolute wwc:inset-0"
								floors={floors}
								activeId={activeFloor}
								onFloorSelect={selectFloor}
								badgeLabel="No model assigned — showing floor plates"
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

							{/* Bottom-right: the capture-route minimap for the active floor's own blueprint. */}
							<CaptureRouteMinimap
								className="wwc:absolute wwc:bottom-3 wwc:right-3 wwc:z-10"
								label={`${activeFloorData?.name ?? "Floor"} — Capture walk`}
								minWidth={180}
								maxWidth={320}
								plan={
									activeFloorData?.hasBlueprint ? (
										<FloorPlan seed={floorSeed} />
									) : (
										<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:px-4 wwc:text-center wwc:text-[11px] wwc:text-muted-foreground">
											No blueprint captured for this level
										</div>
									)
								}
								points={capturePoints}
								activeId={openCapture?.id}
								onPointSelect={setOpenCapture}
							/>
						</div>

						{/* ── Full-height details panel (from the right); closable via its X, reopened via "Show details". ─── */}
						{showPanel && (
							<aside
								className={`wwc:z-20 wwc:flex wwc:h-full wwc:w-72 wwc:shrink-0 wwc:flex-col wwc:border-l wwc:border-border wwc:bg-white dark:wwc:bg-zinc-950 ${FLOAT_SHADOW}`}
							>
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

									{/* Progress by floor: collapsible tapered building-elevation list. */}
									<div ref={floorsSectionRef} className="wwc:flex wwc:min-h-0 wwc:flex-col wwc:gap-2.5 wwc:p-3">
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

			{/* Clicking a capture point opens the walkthrough modal (Map Compare Layout + session timeline). */}
			<WalkthroughModal
				open={openCapture != null}
				onOpenChange={(open) => !open && setOpenCapture(null)}
				title={`${openIndex >= 0 ? `Capture ${openIndex + 1} of ${capturePoints.length}` : "Capture"}${
					openCapture ? ` · ${activeFloorData?.name ?? ""} · ${openCapture.time}` : ""
				}`}
			/>
		</>
	);
}

export function ModelViewerPage() {
	return (
		<div className="wwc:space-y-6">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">3D Model Viewer</h1>
					<CopyButton
						value="3D Model Viewer"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					The Blueprint Viewer #3 layout with the canvas swapped for a 3D model renderer. No model is assigned in this
					demo, so the canvas falls back to a drag-to-orbit stack of square floor plates — one per floor of the active
					house. The navigator (compound → zone → house → floor) and the details panel are unchanged.
				</p>
			</div>

			<div className="wwc:h-[720px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
				<ModelViewer />
			</div>
		</div>
	);
}
