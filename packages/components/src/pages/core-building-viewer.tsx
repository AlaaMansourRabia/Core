import {cn} from "@core/core-utils";
import {ArrowRight, Maximize2, Minimize2, PanelRight, TrendingDown, X} from "lucide-react";
import {useEffect, useState} from "react";

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
import {FragmentViewer, FragmentViewerProvider} from "../fragment-viewer";
import {ViewerToolbar} from "../viewer-toolbar";
import {WeekSelector, type WeekSelectorWeek} from "../week-selector";

// A slight drop shadow for the panels floating over the canvas (the app's `shadow-*` scale is `none`).
const FLOAT_SHADOW = "wwc:shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

// Floors ordered top → bottom (base is furthest along) — drives the breadcrumb, the hero comparison,
// and the "Progress by floor" list. Mirrors the Blueprint Viewer's fixtures so the two variants read
// as siblings of the same building.
type Floor = BuildingFloor & {name: string};

const BUILDING_FLOORS: Floor[] = [
	{id: "rf", label: "RF", name: "Roof", value: 81},
	{id: "uf", label: "UF", name: "Upper Floor", value: 31},
	{id: "ff", label: "FF", name: "First Floor", value: 61},
	{id: "gf", label: "GF", name: "Ground Floor", value: 41},
	{id: "sub", label: "SUB", name: "Basement", value: 96},
];

const WEEKS: WeekSelectorWeek[] = [
	{value: "W109", start: new Date(2026, 5, 12), end: new Date(2026, 5, 18)},
	{value: "W110", start: new Date(2026, 5, 19), end: new Date(2026, 5, 25)},
	{value: "W111", start: new Date(2026, 5, 26), end: new Date(2026, 6, 2)},
	{value: "W112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
	{value: "W113", start: new Date(2026, 6, 10), end: new Date(2026, 6, 16)},
	{value: "W114", start: new Date(2026, 6, 17), end: new Date(2026, 6, 23)},
	{value: "W115", start: new Date(2026, 6, 24), end: new Date(2026, 6, 30)},
];

export interface BuildingViewerProps {
	/** Fragments (.frag) model URL for the villa/building. Defaults to the bundled UpTown model. */
	src?: string;
	/** Fallback model URL if `src` fails to load. */
	fallbackSrc?: string;
	/**
	 * Worker URL for `@thatopen/fragments`. A bundled library cannot resolve the worker to a runtime
	 * URL, so Vite consumers pass `import workerUrl from "@thatopen/fragments/worker?url"`.
	 */
	workerUrl?: string;
}

/**
 * BuildingViewer — the "Villa Viewer" variation of the Building Viewer template: the villa's real
 * ThatOpen 3D model (`FragmentViewer`) with a floor-progress side panel and week header. The 3D
 * sibling of the Blueprint Viewer (2D SVG floor plans). Based on the Capture app's villa-level page.
 */
export function BuildingViewer({
	src = "/models/villa-vl4.frag",
	fallbackSrc = "/models-bundled/uptown.frag",
	workerUrl,
}: BuildingViewerProps = {}) {
	const [showPanel, setShowPanel] = useState(true);
	const [week, setWeek] = useState("W112");
	const [fullScreen, setFullScreen] = useState(false);
	const [activeFloor, setActiveFloor] = useState("gf");
	const activeFloorData = BUILDING_FLOORS.find((f) => f.id === activeFloor);

	// Esc exits full-screen.
	useEffect(() => {
		if (!fullScreen) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setFullScreen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [fullScreen]);

	return (
		<div
			className={
				fullScreen
					? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:overflow-hidden wwc:bg-background"
					: "wwc:h-full wwc:w-full wwc:overflow-hidden"
			}
		>
			<div className="wwc:flex wwc:h-full wwc:flex-col">
				{/* ── Header: breadcrumbs (left), week selector + full-screen (right) — matches Blueprint Viewer. ─── */}
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
					{/* ── Canvas: the villa's real 3D model + a floating viewer toolbar ─────────────────── */}
					<div className="wwc:relative wwc:flex-1 wwc:overflow-hidden wwc:bg-zinc-100 dark:wwc:bg-zinc-900">
						{workerUrl ? (
							<FragmentViewerProvider>
								<div className="wwc:absolute wwc:inset-0">
									<FragmentViewer
										src={src}
										fallbackSrc={fallbackSrc}
										modelId="villa"
										workerUrl={workerUrl}
										showLogo={false}
									/>
								</div>
								{/* Full-width, zero-height wrapper so the toolbar centres itself and overflows upward (no
								    hit area over the canvas) — mirrors the Site Reality stage toolbar placement. */}
								<div className="wwc:pointer-events-none wwc:absolute wwc:inset-x-0 wwc:bottom-11 wwc:z-10 wwc:flex wwc:h-0 wwc:items-end wwc:justify-center">
									<ViewerToolbar className={cn("wwc:pointer-events-auto wwc:max-w-full", FLOAT_SHADOW)} />
								</div>
							</FragmentViewerProvider>
						) : (
							<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center wwc:p-6 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
								Pass a <code className="wwc:mx-1 wwc:font-mono">workerUrl</code> to load the villa's 3D model.
							</div>
						)}

						{/* Top-right: reopen the details panel when closed. */}
						{!showPanel && (
							<div className="wwc:absolute wwc:right-[14px] wwc:top-[14px] wwc:z-10">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className={cn("wwc:gap-1.5", FLOAT_SHADOW)}
									onClick={() => setShowPanel(true)}
								>
									<PanelRight className="wwc:size-4" />
									Show details
								</Button>
							</div>
						)}
					</div>

					{/* ── Full-height details panel (right); closable via its X, reopened via "Show details". ─── */}
					{showPanel && (
						<aside
							className={cn(
								"wwc:z-20 wwc:flex wwc:h-full wwc:w-72 wwc:shrink-0 wwc:flex-col wwc:border-l wwc:border-border wwc:bg-white dark:wwc:bg-zinc-950",
								FLOAT_SHADOW,
							)}
						>
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

							{/* Hero comparison for the active floor. */}
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
							<div className="wwc:h-px wwc:w-full wwc:bg-border" />

							{/* Progress by floor: the tapered building-elevation list. */}
							<div className="wwc:flex wwc:min-h-0 wwc:flex-col wwc:gap-2 wwc:p-3">
								<span className="wwc:text-[11px] wwc:font-semibold wwc:text-foreground">Progress by floor</span>
								<BuildingProgress
									floors={BUILDING_FLOORS}
									activeId={activeFloor}
									onFloorSelect={setActiveFloor}
									size="compact"
								/>
							</div>
							<div className="wwc:h-px wwc:w-full wwc:bg-border" />

							{/* Walk-through action fills the remaining height. */}
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
