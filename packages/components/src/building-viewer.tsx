import {cn} from "@corensystem/core-utils";
import {
	Box,
	Hand,
	Home,
	Layers,
	LayoutGrid,
	Minus,
	Plane,
	Plus,
	Rotate3d,
	Satellite,
	Scan,
	SlidersHorizontal,
	Tag,
	X,
} from "lucide-react";
/**
 * BuildingViewer — the CONTROLLED map/canvas region of CaptureUiEnhanced.
 *
 * Extracted verbatim (JSX + logic) from `pages/capture-ui-enhanced.tsx` (map wrapper 3026–3274 minus the
 * top-centre SiteToolbar, plus the Layers overlay 3646–3767 and the `RealityMeshCanvas` child 488–745).
 * It owns NO shared/business state — every value it renders arrives as a prop and every change it wants is
 * requested through an `on*` callback (the host runs the navigation reducer). Its only local state is the
 * Layers-overlay open flag and the canvas child's own DOM/interaction state.
 *
 * ============================ INTERACTIONS THIS WIDGET OWNS ============================
 *  3D reality canvas (RealityMeshCanvas — internal, canvas-only child):
 *   • Footprint CLICK → `onSelectVilla(plot)`  (host resolves villaByPlot, hops zone, openVilla)
 *   • Footprint HOVER → local `hoverCode` → hover chip (code · zone · batch · %)  [local only]
 *   • 3D-tools toolbar: Zoom in / Zoom out / Reset view / Satellite (top-down) → imperative viewer calls
 *   • 3D-tools Pan / Orbit → local `navMode` + `viewer.setInteractionMode(...)`  [local only]
 *   • Camera reactions: `selectedPlot` change → fitVilla; entering Reality w/o selection → resetView;
 *     a villa pre-selected in Plan is carried in via `selectedPlot`
 *   • Lazy `import("./footprint-viewer")` → `createFootprintViewer`; the created API is surfaced through
 *     `onViewerReady(api)` (host stores it in realityViewerRef; ST reads isZoomedIn there, not here)
 *   • Layer syncing: mesh/model visibility, model opacity, labels, colour mode all pushed to the viewer
 *     from the corresponding props via effects
 *  2D SiteImageViewer (plan / satellite branch):
 *   • Polygon CLICK → leaf: `onSelectVilla(id)` · parent (isParent): `onDrillDown(id)`
 *   • Internal SPA/Construction legend toggle → `onMapModeChange(m)`
 *  Layers overlay (belongs to the viewer, not the reports sheet):
 *   • Layers button → toggle local `layersOpen`; overlay X → close it  [local only]
 *   • 3D body switches/slider → `onMesh3dOnChange` / `onModel3dOnChange` / `onModel3dOpacityChange`
 *     / `onProgressColoursChange` / `onShowLabelsChange`
 *   • 2D body switches → `onShowPolygonsChange` / `onShowLabelsChange` (+ read-only Satellite/Drone rows)
 *
 * ============================= ANIMATIONS THIS WIDGET OWNS =============================
 *   • Map wrapper parallax: `translateY(-reportScrollY)` while `chromeHidden` (reportsOpen)  ← reportScrollY
 *   • 3D layer wrapper: `transition-all duration-500 ease-in-out` + `scale-[0.95] rounded-[25.26px]
 *     overflow-hidden` (mapScaledOut) + `blur-sm` (mapBlurred), `hidden` when `mode!=="3d"`
 *   • Plan-image backdrop `<img>`: per-frame opacity/blur/scale driven by the camera (`onBackdrop`, willChange)
 *   • Static radial vignette
 *   • Centre spinner while `showSpinner` (mapPhase==="out" || mapLoading)
 *   • Jump toast enter/leave: `animate-in fade-in slide-in-from-top-4` / `animate-out fade-out
 *     slide-out-to-top-4 fill-mode-forwards`, `duration-300 ease-out` (host owns the timers → jumpToastLeaving)
 *   • Chrome fade: `chromeFade` (opacity 500 + pointer-events-none while reportsOpen) on toast + Layers control
 *   • Layers control follow: `transition-[left] duration-300 ease-in-out` driven by `layersOffsetLeft`
 */
import {useEffect, useRef, useState} from "react";

import {Button} from "./button";
import type {FootprintViewer} from "./footprint-viewer";
import {type MapMode, SiteImageViewer, styleForVilla, type Villa as SiteVilla} from "./site-image-viewer";
import {Slider} from "./slider";
import {Spinner} from "./spinner";
import {Switch} from "./switch";
import {Toolbar, ToolbarButton, ToolbarSeparator} from "./toolbar";
import {HoverTooltip, TooltipProvider} from "./tooltip";

export type {MapMode};

/** Structural mirror of the host's (non-exported) `SatelliteBasemap`. */
export type BuildingViewerSatelliteBasemap = {
	backgroundUrl: string;
	villas: SiteVilla[];
	imageWidth: number;
	imageHeight: number;
};

type ViewId = "villa" | "batch";
type ViewMode = "plan" | "satellite" | "3d";
type LevelId = "block" | "batch" | "zone" | "phase";

export type {ViewId, ViewMode, LevelId};

/**
 * The 3D view — the headless projected-footprints viewer (`createFootprintViewer`): the DroneDeploy
 * reality-capture mesh (Cesium 3D Tiles) with every villa's ground footprint painted DOWN onto the mesh
 * surface, coloured by construction progress (no IFC fragment). Mounts the WebGL canvas into a container and
 * disposes on unmount. Assets are served from the app's public dir (`/footprints.json`, `/house-progress.json`,
 * `/house-progress-IMA.json`, `/worker.mjs`, `/reality-mesh/…`). Villa code (`${model}-${plot}`) is the
 * identity; hover surfaces its zone + batch via `getVillaRecord`. Canvas-only: three/@thatopen are reached
 * solely through the lazy `import("./footprint-viewer")`; the created API is opaque and surfaced via `onReady`.
 */
function RealityMeshCanvas({
	active,
	meshOn,
	meshOpacity,
	modelOn,
	modelOpacity,
	progressColours,
	mapMode,
	showLabels,
	selectedPlot,
	visiblePlots,
	onSelectVilla,
	onReady,
}: {
	/** True while the Reality view is the visible mode — used to reset the camera to the open pose on entry. */
	active: boolean;
	meshOn: boolean;
	meshOpacity: number;
	modelOn: boolean;
	modelOpacity: number;
	progressColours: boolean;
	/** Legend colour mode — SPA milestone ramp ("progress") vs variance ("variance"). */
	mapMode: MapMode;
	showLabels: boolean;
	/** Plot number of the villa selected in the left rail — jumps the 3D camera to it. */
	selectedPlot?: string;
	/** Search/filter whitelist (plot numbers): only these footprints paint; `null`/undefined = show all. */
	visiblePlots?: string[] | null;
	/** Fired with the plot number when a villa is clicked in the 3D scene (opens its details). */
	onSelectVilla?: (plot: string) => void;
	/** Receives the live viewer so the page can read its zoom/selection when switching modes. */
	onReady?: (api: FootprintViewer) => void;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const bgRef = useRef<HTMLImageElement>(null); // plan-image backdrop; styled per-frame from the camera
	const viewerRef = useRef<FootprintViewer | null>(null);
	const plotToCode = useRef<Map<string, string>>(new Map());
	// Always call the latest handler from the viewer's (create-once) onSelect callback.
	const onSelectRef = useRef(onSelectVilla);
	onSelectRef.current = onSelectVilla;
	const onReadyRef = useRef(onReady);
	onReadyRef.current = onReady;
	// Latest selected plot, read inside the create-once viewer callback so a villa selected in Plan (before the
	// viewer even exists) carries into Reality the first time it's opened.
	const selectedPlotRef = useRef(selectedPlot);
	selectedPlotRef.current = selectedPlot;
	// Latest filter whitelist, read inside the create-once viewer callback so a filter that's already active when
	// Reality first mounts is applied on load (not just on later changes).
	const visiblePlotsRef = useRef(visiblePlots);
	visiblePlotsRef.current = visiblePlots;
	// Resolve plot numbers to the viewer's `${model}-${plot}` codes (dropping any that aren't in the scene).
	const plotsToCodes = (plots: string[]) =>
		plots.map((p) => plotToCode.current.get(p)).filter((c): c is string => Boolean(c));
	const [error, setError] = useState(false);
	// Villa code under the cursor (for the hover chip that surfaces zone + batch).
	const [hoverCode, setHoverCode] = useState<string | null>(null);
	// Left-drag interaction mode for the 3D tools (orbit vs pan).

	// Recolour every footprint for the active legend mode (SPA vs variance) using the same resolver the 2D map
	// and legend use, so the 3D colours stay in lockstep with them. Reads each villa's actual/planned straight
	// off the viewer's merged progress records (both zones), so no extra fetch is needed. Only takes effect
	// while progress colours are on (otherwise the footprints keep the viewer's default milestone colours).
	const applyColours = () => {
		const v = viewerRef.current;
		if (!v || !progressColours) return;
		const map: Record<string, string> = {};
		for (const code of v.getVillaCodes()) {
			const r = v.getVillaRecord(code);
			if (!r) continue;
			map[code] = styleForVilla(
				{linkedLbsItemId: 1, approvedProgressPercent: r.actual ?? null, plannedProgressPercent: r.planned ?? null},
				mapMode,
			).fill;
		}
		v.setVillaColours(map);
	};

	useEffect(() => {
		const container = ref.current;
		if (!container) return;
		let disposed = false;
		// Dynamically import the footprint viewer so its @thatopen/three deps only load when 3D actually mounts.
		import("./footprint-viewer")
			.then(({createFootprintViewer}) =>
				createFootprintViewer(container, {
					meshOpacity,
					projectionStrength: modelOpacity,
					colorMode: progressColours ? "progress" : "off",
					// Transparent canvas so the plan-image backdrop (rendered as a DOM <img> below) shows behind the mesh.
					transparent: true,
					// Clicking a footprint in the 3D scene → open its details (keyed by plot number).
					onSelect: (code) => {
						if (code) onSelectRef.current?.(code.split("-").pop() ?? code);
					},
					// Hovering a footprint surfaces its villa code + zone + batch (via the chip below).
					onHover: (code) => setHoverCode(code),
					// Drive the plan-image backdrop from the camera: fade + blur as you zoom in, scale with the model.
					onBackdrop: ({opacity, blurPx, scale}) => {
						const el = bgRef.current;
						if (!el) return;
						el.style.opacity = String(opacity);
						el.style.filter = `blur(${blurPx}px)`;
						el.style.transform = `scale(${scale})`;
					},
				}),
			)
			.then((v) => {
				if (disposed) {
					v.dispose();
					return;
				}
				viewerRef.current = v;
				onReadyRef.current?.(v); // let the page read zoom/selection when switching modes
				// Dev aid for tuning the open camera pose: orbit to the view you want, then run
				// `window.__realityViewer.getCameraPose()` in the console and share the numbers to bake them in.
				(window as unknown as {__realityViewer?: unknown}).__realityViewer = v;
				v.setMeshVisible(meshOn);
				v.setModelVisible(modelOn);
				// Index villa plot numbers → footprint codes so a left-rail click can jump to the exact villa.
				for (const code of v.getVillaCodes()) plotToCode.current.set(code.split("-").pop() ?? code, code);
				applyColours();
				// Carry a villa selected in Plan into Reality on first open (the viewer didn't exist when it was picked).
				const preCode = selectedPlotRef.current ? (plotToCode.current.get(selectedPlotRef.current) ?? null) : null;
				if (preCode) {
					v.selectVilla(preCode);
					void v.fitVilla(preCode);
				}
				// Apply any search/filter that's already active when Reality first mounts.
				const preVisible = visiblePlotsRef.current;
				if (preVisible) v.setVisibleVillas(plotsToCodes(preVisible));
			})
			.catch((err) => {
				console.error("Footprint viewer failed to start:", err);
				setError(true);
			});
		return () => {
			disposed = true;
			viewerRef.current?.dispose();
			viewerRef.current = null;
		};
		// Created once; live changes are pushed through the effects below.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	// Push Layers-panel changes to the viewer.
	useEffect(() => void viewerRef.current?.setMeshVisible(meshOn), [meshOn]);
	useEffect(() => void viewerRef.current?.setMeshOpacity(meshOpacity), [meshOpacity]);
	useEffect(() => void viewerRef.current?.setModelVisible(modelOn), [modelOn]);
	useEffect(() => void viewerRef.current?.setModelOpacity(modelOpacity), [modelOpacity]);
	useEffect(() => void viewerRef.current?.setLabelsVisible(showLabels), [showLabels]);
	// Push the search/filter whitelist to the viewer so 3D shows the same subset as the 2D map + rail. Keyed on
	// the joined plot list so a new-but-equal array doesn't churn the texture redraw; `null` clears the filter.
	const visibleKey = visiblePlots ? visiblePlots.join("|") : null;
	useEffect(() => {
		const v = viewerRef.current;
		if (!v) return;
		v.setVisibleVillas(visiblePlots ? plotsToCodes(visiblePlots) : null);
		// visiblePlots is captured via visibleKey (its stable string form) to avoid array-identity re-runs.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visibleKey]);
	useEffect(() => {
		viewerRef.current?.setColourMode(progressColours ? "progress" : "material");
		applyColours();
		// applyColours reads mapMode/progressColours refs; re-run when either changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [progressColours, mapMode]);
	// Keep the viewer's selection in sync with the rail (resolve the plot number to the 3D code) and frame it.
	// Clearing the selection (closing the villa) deselects — the whitelist clears and the camera eases back.
	useEffect(() => {
		const v = viewerRef.current;
		if (!v) return;
		const code = selectedPlot ? (plotToCode.current.get(selectedPlot) ?? null) : null;
		// Only push the selection in when it differs from the viewer's own. A 3D scene click already selected the
		// villa internally (and reported it up via onSelect), so this avoids a select → openVilla → effect → select
		// loop while still framing the villa.
		if (v.getSelectedVilla() !== code) void v.selectVilla(code);
		if (code) void v.fitVilla(code);
		// Re-run on `active` too: switching Plan → Reality must re-apply + frame the current selection.
	}, [selectedPlot, active]);
	// The viewer stays mounted when you leave Reality (so the mesh never re-streams), so re-opening it would
	// otherwise keep wherever the camera was last orbited. Reset to the canonical open pose whenever Reality
	// becomes the active view — unless a specific villa is framed (then honour that selection instead).
	useEffect(() => {
		// CAMERA-TUNER: while the dev sliders are on they own the pose, so skip the auto-reset on entering Reality.
		if (active && !selectedPlot) void viewerRef.current?.resetView();
		// Only re-run on entering Reality; selectedPlot is intentionally not a dep.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [active]);
	// Hovered villa's record → the code · zone · batch · progress chip (read straight off the viewer).
	const hoverRec = hoverCode && viewerRef.current ? viewerRef.current.getVillaRecord(hoverCode) : null;
	return (
		<div className="wwc:absolute wwc:inset-0 wwc:size-full">
			{/* Plan-image backdrop behind the (transparent) 3D canvas — same image + object-cover fit as the Plan
          view. Its opacity/blur/scale are driven per-frame from the camera (see onBackdrop): blurred at rest,
          fading + blurring more as you zoom in (gone by ~30%), scaling with the model, and fading on tilt/rotate. */}
			<img
				ref={bgRef}
				src="/phase-blueprint.webp"
				alt=""
				className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:size-full wwc:object-cover"
				style={{
					opacity: 1,
					filter: "blur(4px)",
					transform: "scale(1)",
					transformOrigin: "center",
					willChange: "opacity, filter, transform",
				}}
			/>
			<div ref={ref} className="wwc:absolute wwc:inset-0 wwc:size-full" />
			{/* Soft vignette around the outer edge of the view. */}
			<div
				className="wwc:pointer-events-none wwc:absolute wwc:inset-0"
				style={{background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)"}}
			/>
			{/* NOTE: the 3D-tools toolbar is rendered by BuildingViewer OUTSIDE this canvas (which lives in the
          scaled/blurred map wrapper), so the map transition never pulls it. See the sibling in BuildingViewer. */}
			{hoverRec ? (
				<div className="wwc:pointer-events-none wwc:absolute wwc:left-1/2 wwc:top-3 wwc:z-10 wwc:flex wwc:-translate-x-1/2 wwc:items-center wwc:gap-2 wwc:rounded-md wwc:bg-black/80 wwc:px-2.5 wwc:py-1 wwc:text-xs wwc:font-medium wwc:text-white wwc:shadow-lg wwc:backdrop-blur-sm">
					<span className="wwc:font-semibold">{hoverRec.code}</span>
					<span className="wwc:text-white/60">Zone {hoverRec.zone ?? "—"}</span>
					<span className="wwc:text-white/60">Batch {hoverRec.batch ?? "—"}</span>
					{hoverRec.actual != null ? <span className="wwc:text-white/60">{hoverRec.actual}%</span> : null}
				</div>
			) : null}
			{error ? (
				<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center wwc:bg-zinc-900 wwc:text-sm wwc:text-white/60">
					3D model unavailable
				</div>
			) : null}
		</div>
	);
}

/** The plan-view map data the host resolves from zoneVilla / levelView. */
export type BuildingViewerMapData = {
	villas: SiteVilla[];
	/**
	 * Optional block-hull polygons for this location (same pixel space as `villas`). When set on the villa
	 * (leaf) view, the plan shows block-name labels while fully zoomed out and swaps to villa chips once zoomed
	 * in past 10% — matching the 3D reality view's Block → Villa label hand-off. Omit on parent grouping levels.
	 */
	blocks?: SiteVilla[];
	backgroundUrl: string;
	imageWidth: number;
	imageHeight: number;
	/** Stable React key the host computes: isParent ? level : `villa-${currentLocation}`. */
	contentKey: string;
};

export type BuildingViewerProps = {
	// ---- view axes (read-only) ----
	mode: ViewMode;
	view: ViewId;
	level: LevelId;
	currentLocation: string;
	/** view === "batch" && level !== "batch" — parent view draws grouping polygons + drills down. */
	isParent: boolean;

	// ---- data the map draws ----
	map: BuildingViewerMapData;
	satelliteBasemap: BuildingViewerSatelliteBasemap | null;

	// ---- selection (read-only; host owns) ----
	/** SiteImageViewer highlight: detailOpen && !isParent ? selectedId : undefined. */
	selectedVillaId?: string;
	/** 3D camera target: detailOpen && selectedId ? selectedNumber : undefined. */
	selectedPlot?: string;
	/** Search/filter whitelist (plot numbers): the 3D view paints only these footprints; `null` = show all. */
	visiblePlots?: string[] | null;

	// ---- colour mode ----
	mapMode: MapMode;

	// ---- 3D layer state ----
	mesh3dOn: boolean;
	mesh3dOpacity: number; // constant 1 today
	model3dOn: boolean;
	model3dOpacity: number; // 0..1
	progressColours: boolean;
	showLabels: boolean;
	showPolygons: boolean;
	/** threeDLoaded || mode === "3d" — keep the mesh mounted across Plan↔Reality. */
	keep3dMounted: boolean;

	// ---- transition / chrome (read-only, host-owned machine) ----
	mapScaledOut: boolean;
	mapBlurred: boolean;
	showSpinner: boolean; // mapPhase === "out" || mapLoading
	/** reportsOpen — hide the viewer's own hover card/legend/zoom tools + fade chrome. */
	chromeHidden: boolean;
	/** transition-opacity duration-500 + opacity-0 pointer-events-none when reportsOpen. */
	chromeFade: string;
	/** Map wrapper translateY(-reportScrollY) parallax during report scroll. */
	reportScrollY: number;

	// ---- jump toast (host fires it, BV renders it) ----
	jumpToast: string | null;
	jumpToastLeaving: boolean;

	// ---- Layers overlay positioning (host-computed geometry) ----
	/** Precomputed left offset: 412 detailOpen / 372 searchOpen / 340 sidebarFull / 12. */
	layersOffsetLeft: number;
	/** Noun for the polygon toggle row ("Villas"/"Zones"/…). */
	polyNoun: string;
	/** 2D vs 3D branch for the Layers panel body (defaults to `mode === "3d"`). */
	hide3dLayers?: boolean;

	// ================= CALLBACKS OUT =================
	/** 3D footprint click (passes plot code) OR 2D leaf polygon click (passes villa id).
	 *  Host resolves villaByPlot, hops currentLocation if cross-zone, then openVilla. */
	onSelectVilla: (idOrPlot: string) => void;
	/** 2D parent-view polygon click → host.drillDownLevel(id). */
	onDrillDown: (id: string) => void;
	/** SiteImageViewer's internal SPA/Construction legend toggle. */
	onMapModeChange: (m: MapMode) => void;
	/** Surfaces the lazy-created FootprintViewer to the host (stored in realityViewerRef). */
	onViewerReady: (api: FootprintViewer) => void;

	// Layers overlay switches → shared state
	onMesh3dOnChange: (b: boolean) => void;
	onModel3dOnChange: (b: boolean) => void;
	onModel3dOpacityChange: (n: number) => void;
	onProgressColoursChange: (b: boolean) => void;
	onShowLabelsChange: (b: boolean) => void;
	onShowPolygonsChange: (b: boolean) => void;
};

type LayerRow = {
	id: string;
	label: string;
	icon: typeof Home;
	checked: boolean;
	onToggle?: (v: boolean) => void;
};

export function BuildingViewer({
	mode,
	view,
	level,
	isParent,
	map,
	satelliteBasemap,
	selectedVillaId,
	selectedPlot,
	visiblePlots,
	mapMode,
	mesh3dOn,
	mesh3dOpacity,
	model3dOn,
	model3dOpacity,
	progressColours,
	showLabels,
	showPolygons,
	keep3dMounted,
	mapScaledOut,
	mapBlurred,
	showSpinner,
	chromeHidden,
	chromeFade,
	reportScrollY,
	jumpToast,
	jumpToastLeaving,
	layersOffsetLeft,
	polyNoun,
	hide3dLayers,
	onSelectVilla,
	onDrillDown,
	onMapModeChange,
	onViewerReady,
	onMesh3dOnChange,
	onModel3dOnChange,
	onModel3dOpacityChange,
	onProgressColoursChange,
	onShowLabelsChange,
	onShowPolygonsChange,
}: BuildingViewerProps) {
	// Map layers now live in an overlay ON the canvas, toggled by the Layers button — closed to start.
	const [layersOpen, setLayersOpen] = useState(false);
	// The 3D-tools toolbar lives OUT here (a sibling of the scaled/blurred map wrapper) so the map transition
	// never pulls it. It drives the viewer through this ref, which RealityMeshCanvas fills via onReady.
	const realityViewerRef = useRef<FootprintViewer | null>(null);
	const [navMode, setNavMode] = useState<"orbit" | "pan">("orbit");

	// The Satellite basemap for the current context, when picked. Drives both the 2D branch below and the
	// read-only Satellite row in the Layers overlay.
	const showSatellite = mode === "satellite" && satelliteBasemap != null;
	// The Layers overlay branches to the 3D body (inline switches) unless overridden.
	const show3dLayers = hide3dLayers != null ? !hide3dLayers && mode === "3d" : mode === "3d";

	// Map-layers control — the toggles reflect what's actually drawn on the current 2D view. Satellite/Drone
	// rows have no polygon overlay, so those show read-only.
	const twoDLayers: LayerRow[] = showSatellite
		? [{id: "basemap", label: "Satellite basemap", icon: Satellite, checked: true}]
		: [
				{
					id: "polygons",
					label: `${polyNoun} polygons`,
					icon: LayoutGrid,
					checked: showPolygons,
					onToggle: onShowPolygonsChange,
				},
				{id: "labels", label: `${polyNoun} labels`, icon: Tag, checked: showLabels, onToggle: onShowLabelsChange},
				{id: "ortho", label: "Drone ortho", icon: Layers, checked: true},
			];

	return (
		<>
			{/* Map canvas (base layer) — the real Site Image Viewer widget: the ROSHN Almanar aerial
          ("Zone 1 - A") with the real villa footprint polygons coloured by construction progress.
          The widget owns its own hover progress card + SPA/Construction legend. The floating left
          panel above and the map-layers overlay below sit ON TOP of it. Background image is served
          by the app (apps/storybook/public/site-background.webp). */}
			<div
				className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:overflow-hidden wwc:bg-zinc-800"
				style={chromeHidden ? {transform: `translateY(${-reportScrollY}px)`} : undefined}
			>
				{/* The transition (zoom-out to the grey frame + blur) is applied to the MAP LAYER ONLY — the
            SiteImageViewer scales its own map internally so its zoom tools + legend stay put. The Drone
            iframe has no such controls, so it's wrapped here directly. */}
				{/* 3D reality model — kept mounted while at the villa/batch level so flipping to the 2D plan and
            back never reloads the mesh; hidden (display:none) behind the 2D map when not in 3D mode. */}
				{keep3dMounted && (
					<div
						className={cn(
							"wwc:absolute wwc:inset-0 wwc:origin-center wwc:transition-all wwc:duration-500 wwc:ease-in-out",
							mode !== "3d" && "wwc:hidden",
							mapScaledOut && "wwc:scale-[0.95] wwc:overflow-hidden wwc:rounded-[25.26px]",
							mapBlurred && "wwc:blur-sm",
						)}
					>
						<RealityMeshCanvas
							active={mode === "3d"}
							onReady={(api) => {
								realityViewerRef.current = api;
								onViewerReady(api);
							}}
							meshOn={mesh3dOn}
							meshOpacity={mesh3dOpacity}
							modelOn={model3dOn}
							modelOpacity={model3dOpacity}
							progressColours={progressColours}
							mapMode={mapMode}
							showLabels={showLabels}
							selectedPlot={selectedPlot}
							visiblePlots={visiblePlots}
							onSelectVilla={(plot) => onSelectVilla(plot)}
						/>
					</div>
				)}
				{/* 3D model tools — a SIBLING of the scaled/blurred 3D wrapper (so the map transition never pulls
            it), reusing the plan zoom-tool primitives. Zoom uses plain +/− like the plan view. */}
				{mode === "3d" && (
					<TooltipProvider delayDuration={200}>
						<Toolbar
							orientation="vertical"
							aria-label="3D tools"
							className={cn(
								"wwc:absolute wwc:right-3 wwc:top-3 wwc:z-20 wwc:w-10 wwc:gap-0 wwc:py-1 wwc:transition-opacity",
								chromeFade,
							)}
						>
							<HoverTooltip content="Zoom in" side="left">
								<ToolbarButton icon label="Zoom in" onClick={() => realityViewerRef.current?.zoomIn()}>
									<Plus className="wwc:size-4" />
								</ToolbarButton>
							</HoverTooltip>
							<ToolbarSeparator orientation="horizontal" className="wwc:mx-0 wwc:my-0.5 wwc:w-full" />
							<HoverTooltip content="Zoom out" side="left">
								<ToolbarButton icon label="Zoom out" onClick={() => realityViewerRef.current?.zoomOut()}>
									<Minus className="wwc:size-4" />
								</ToolbarButton>
							</HoverTooltip>
							<ToolbarSeparator orientation="horizontal" className="wwc:mx-0 wwc:my-0.5 wwc:w-full" />
							<HoverTooltip content="Reset view" side="left">
								<ToolbarButton icon label="Reset view" onClick={() => realityViewerRef.current?.resetView()}>
									<Scan className="wwc:size-4" />
								</ToolbarButton>
							</HoverTooltip>
							<HoverTooltip content="Satellite (top-down)" side="left">
								<ToolbarButton icon label="Satellite view" onClick={() => realityViewerRef.current?.topDownView()}>
									<Satellite className="wwc:size-4" />
								</ToolbarButton>
							</HoverTooltip>
							<ToolbarSeparator orientation="horizontal" className="wwc:mx-0 wwc:my-1 wwc:w-full" />
							<HoverTooltip content="Pan" side="left">
								<ToolbarButton
									icon
									label="Pan"
									active={navMode === "pan"}
									onClick={() => {
										setNavMode("pan");
										realityViewerRef.current?.setInteractionMode("pan");
									}}
								>
									<Hand className="wwc:size-4" />
								</ToolbarButton>
							</HoverTooltip>
							<HoverTooltip content="Orbit" side="left">
								<ToolbarButton
									icon
									label="Orbit"
									active={navMode === "orbit"}
									onClick={() => {
										setNavMode("orbit");
										realityViewerRef.current?.setInteractionMode("orbit");
									}}
								>
									<Rotate3d className="wwc:size-4" />
								</ToolbarButton>
							</HoverTooltip>
						</Toolbar>
					</TooltipProvider>
				)}
				{mode === "3d" ? null : showSatellite && satelliteBasemap ? (
					<SiteImageViewer
						key={`sat-${view}-${level}`}
						className="wwc:size-full"
						backgroundUrl={satelliteBasemap.backgroundUrl}
						villas={satelliteBasemap.villas}
						imageWidth={satelliteBasemap.imageWidth}
						imageHeight={satelliteBasemap.imageHeight}
						mapMode={mapMode}
						onMapModeChange={onMapModeChange}
						onSelectVilla={isParent ? (id) => onDrillDown(String(id)) : (id) => onSelectVilla(String(id))}
						focusOnSelect={!isParent}
						selectedVillaId={selectedVillaId}
						onRefresh={() => {}}
						refreshLabel="Updated 14 min ago"
						// Parent grouping levels (phase/zone/batch/block) hide progress: every polygon renders one grey.
						monochrome={isParent}
						mapScaledOut={mapScaledOut}
						mapBlurred={mapBlurred}
						chromeHidden={chromeHidden}
					/>
				) : (
					<SiteImageViewer
						key={map.contentKey}
						className="wwc:size-full"
						backgroundUrl={map.backgroundUrl}
						villas={map.villas}
						blocks={isParent ? undefined : map.blocks}
						imageWidth={map.imageWidth}
						imageHeight={map.imageHeight}
						mapMode={mapMode}
						onMapModeChange={onMapModeChange}
						onSelectVilla={isParent ? (id) => onDrillDown(String(id)) : (id) => onSelectVilla(String(id))}
						focusOnSelect={!isParent}
						selectedVillaId={selectedVillaId}
						onRefresh={() => {}}
						refreshLabel="Updated 14 min ago"
						showPolygons={showPolygons}
						// Parent grouping levels (phase/zone/batch/block) hide progress: every polygon renders one grey.
						monochrome={isParent}
						showLabels={showLabels}
						mapScaledOut={mapScaledOut}
						mapBlurred={mapBlurred}
						chromeHidden={chromeHidden}
					/>
				)}

				{/* Loading spinner (centre) — shown while the next location loads; visuals don't swap yet. */}
				{showSpinner && (
					<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:z-30 wwc:flex wwc:items-center wwc:justify-center">
						<span className="wwc:flex wwc:size-12 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-card/90 wwc:shadow-lg wwc:backdrop-blur-sm">
							<Spinner className="wwc:size-6 wwc:text-primary" />
						</span>
					</div>
				)}

				{/* Jump toast — a single line under the toolbar announcing a jump down to the villa level. The
            OUTER div only centres it (its `-translate-x-1/2` owns `transform`); the INNER div runs the
            slide/fade so the animation's own transform doesn't fight the centring. Enter: fade + slide
            down from under the toolbar; leave: fade + slide back up. */}
				{jumpToast ? (
					<div className={cn("wwc:absolute wwc:left-1/2 wwc:top-[84px] wwc:z-20 wwc:-translate-x-1/2", chromeFade)}>
						<div
							className={cn(
								"wwc:duration-300 wwc:ease-out",
								jumpToastLeaving
									? "wwc:animate-out wwc:fade-out wwc:slide-out-to-top-4 wwc:fill-mode-forwards"
									: "wwc:animate-in wwc:fade-in wwc:slide-in-from-top-4",
							)}
						>
							<div className="wwc:whitespace-nowrap wwc:rounded-full wwc:border wwc:border-border wwc:bg-card/95 wwc:px-3.5 wwc:py-1.5 wwc:text-sm wwc:font-medium wwc:shadow-lg wwc:backdrop-blur-sm">
								<span className="wwc:text-muted-foreground">Jumped to </span>
								<span className="wwc:text-foreground">{jumpToast}</span>
							</div>
						</div>
					</div>
				) : null}
			</div>

			{/* ===== Map-layers control — a button + its overlay, floating ON the canvas =====
          Placement follows the sidebar: when the full-height search panel is open it animates to
          sit BESIDE the panel; when the floating rail fills the canvas height it shifts beside it;
          otherwise it rests in the bottom-left corner, under the sidebar. */}
			<div
				className="wwc:absolute wwc:bottom-3 wwc:z-30 wwc:transition-[left] wwc:duration-300 wwc:ease-in-out"
				style={{left: layersOffsetLeft}}
			>
				<div className={chromeFade}>
					{layersOpen && (
						<div className="wwc:absolute wwc:bottom-full wwc:left-0 wwc:mb-2 wwc:w-[300px] wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:shadow-xl">
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:border-b wwc:border-border wwc:px-3 wwc:py-2.5">
								<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm wwc:font-semibold">
									<Layers className="wwc:size-4 wwc:text-muted-foreground" />
									Map layers
								</span>
								<Button
									icon
									size="sm"
									variant="ghost"
									aria-label="Close map layers"
									onClick={() => setLayersOpen(false)}
								>
									<X className="wwc:size-4" />
								</Button>
							</div>
							<div className="wwc:flex wwc:flex-col wwc:gap-1 wwc:p-2">
								{show3dLayers ? (
									<>
										{/* Reality mesh — toggle */}
										<div className="wwc:flex wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:px-2 wwc:py-2">
											<Box className="wwc:size-4 wwc:shrink-0 wwc:text-muted-foreground" />
											<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-sm">Reality mesh</span>
											<Switch checked={mesh3dOn} onCheckedChange={onMesh3dOnChange} aria-label="Reality mesh" />
										</div>
										{/* Progress model — toggle + opacity */}
										<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:rounded-md wwc:px-2 wwc:py-2">
											<div className="wwc:flex wwc:items-center wwc:gap-2.5">
												<LayoutGrid className="wwc:size-4 wwc:shrink-0 wwc:text-muted-foreground" />
												<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-sm">Progress model</span>
												<Switch checked={model3dOn} onCheckedChange={onModel3dOnChange} aria-label="Progress model" />
											</div>
											{model3dOn ? (
												<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:pl-6">
													<Slider
														value={[Math.round(model3dOpacity * 100)]}
														max={100}
														step={5}
														onValueChange={(v) => onModel3dOpacityChange((v[0] ?? 0) / 100)}
														aria-label="Progress model opacity"
														className="wwc:flex-1"
													/>
													<span className="wwc:w-9 wwc:shrink-0 wwc:text-right wwc:text-[11px] wwc:tabular-nums wwc:text-muted-foreground">
														{Math.round(model3dOpacity * 100)}%
													</span>
												</div>
											) : null}
										</div>
										{/* Progress colours — toggle */}
										<div className="wwc:flex wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:px-2 wwc:py-2">
											<Tag className="wwc:size-4 wwc:shrink-0 wwc:text-muted-foreground" />
											<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-sm">Progress colours</span>
											<Switch
												checked={progressColours}
												disabled={!model3dOn}
												onCheckedChange={onProgressColoursChange}
												aria-label="Progress colours"
											/>
										</div>
										{/* Villa labels — toggle (shares state with the 2D labels layer) */}
										<div className="wwc:flex wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:px-2 wwc:py-2">
											<Tag className="wwc:size-4 wwc:shrink-0 wwc:text-muted-foreground" />
											<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-sm">Villa labels</span>
											<Switch checked={showLabels} onCheckedChange={onShowLabelsChange} aria-label="Villa labels" />
										</div>
									</>
								) : (
									twoDLayers.map((row) => {
										const Icon = row.icon;
										const readOnly = !row.onToggle;
										return (
											<div
												key={row.id}
												className={cn(
													"wwc:flex wwc:flex-row wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:px-2 wwc:py-2",
													readOnly && "wwc:opacity-60",
												)}
											>
												<Icon className="wwc:size-4 wwc:shrink-0 wwc:text-muted-foreground" />
												<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-sm">{row.label}</span>
												<Switch
													checked={row.checked}
													disabled={readOnly}
													onCheckedChange={(checked) => row.onToggle?.(checked)}
													aria-label={row.label}
												/>
											</div>
										);
									})
								)}
							</div>
						</div>
					)}

					{/* Layers control — a regular pill button (matching the Legend button), toggling the overlay. */}
					<button
						type="button"
						aria-label="Map layers"
						aria-expanded={layersOpen}
						onClick={() => setLayersOpen((o) => !o)}
						className={cn(
							"wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card/95 wwc:px-3 wwc:py-2 wwc:text-sm wwc:font-medium wwc:shadow-lg wwc:backdrop-blur-sm wwc:transition-colors wwc:hover:bg-accent",
							layersOpen && "wwc:border-primary wwc:text-primary",
						)}
					>
						<SlidersHorizontal className="wwc:size-4" />
						Layers
					</button>
				</div>
			</div>
		</>
	);
}

export default BuildingViewer;
