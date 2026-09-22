import type {FragmentMarker} from "@corensystem/core-ui/fragment-viewer";

import workerUrl from "@thatopen/fragments/worker?url";
import {Badge} from "@corensystem/core-ui/badge";
import {
	FragmentViewer,
	FragmentViewerProvider,
	type FragmentSelection,
	useFragmentViewer,
} from "@corensystem/core-ui/fragment-viewer";
import {ToolButton, ViewerToolbar} from "@corensystem/core-ui/viewer-toolbar";
import {Boxes, CalendarClock, MapPin, Users, X} from "lucide-react";
import {Component, type ReactNode, useEffect, useRef, useState} from "react";

import {sampleDemoWorkers} from "./demo-workers";
import type {FloorTab} from "./floor-list/types";
import {FloorInspector} from "./floor-inspector";
import {FloatingObjectCard, type ObjectSelection, useResolvedObject} from "./object-inspector";
import {FLOORS, type Floor, FloorPanel, getFloor} from "./floor-panel";
import {ProjectInspector} from "./project-inspector";
import {useGlbOverlay} from "./glb-overlay";
import {FloorProgressPanel} from "./timeline/FloorProgressPanel";
import {TimelineOverlay} from "./timeline/TimelineOverlay";
import {TradeLegend} from "./timeline/TradeLegend";
import {use4DTimeline} from "./timeline/use4DTimeline";

// FragmentViewer can throw while starting WebGL (no GPU / WebGL disabled) or on a bad model. Catch
// it so the house view degrades to a message instead of white-screening the whole app.
class ViewerErrorBoundary extends Component<
	{children: ReactNode; fallback: ReactNode; onError?: () => void},
	{failed: boolean}
> {
	state = {failed: false};
	static getDerivedStateFromError() {
		return {failed: true};
	}
	componentDidCatch() {
		// A hard viewer failure (e.g. WebGL unavailable) throws before any status is reported, so treat
		// it as "settled" too — otherwise the outer transition would wait on its safety timeout.
		this.props.onError?.();
	}
	render() {
		return this.state.failed ? this.props.fallback : this.props.children;
	}
}

function Viewer3DUnavailable() {
	return (
		<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center wwc:bg-muted/30 wwc:p-6">
			<div className="wwc:max-w-sm wwc:rounded-lg wwc:border wwc:bg-background wwc:p-4 wwc:text-center wwc:shadow-lg">
				<p className="wwc:text-sm wwc:font-semibold">3D viewer unavailable</p>
				<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
					The 3D scene couldn't start — usually WebGL is disabled or the browser has no GPU access. Open this in a
					normal browser tab with hardware acceleration enabled.
				</p>
			</div>
		</div>
	);
}

// The single-house 3D view — the Site Reality template's 3D viewer (FragmentViewer + ViewerToolbar
// + worker markers) dropped in on its own. It reads a `.frag` model served from public/models.
// villa-vl4.frag is villa-VL4-000201.ifc (IFC4, ~86MB, 4 storeys: Ground/First/Second/Roof) converted
// to Fragments offline (models-src/*.ifc → scripts/convert-ifc.mjs) — the viewer reads `.frag` only, so
// IFC is converted ahead of time and the browser never carries web-ifc's wasm.
const MODEL_SRC = "/models/villa-vl4.frag";
// Optional GLB rendered into the same 3D scene, over the BIM model (see useGlbOverlay). Served from disk
// by the dev middleware in vite.config.ts (set LOCAL_GLB_PATH in .env.local). Off by default.
const OVERLAY_SRC = "/local/overlay.glb";
const DEMO_WORKER_COUNT = 600;
// Stable empty markers array for when workers are hidden (a fresh [] each render would re-run the
// marker effect needlessly).
const NO_MARKERS: FragmentMarker[] = [];

// Frame the camera on the building shell instead of the whole model, so stray site/annotation/space
// geometry doesn't zoom the camera out. Module-level (stable identity) so it doesn't reload the model.
// Tweak this list to change what counts as "the building"; falls back to the whole model if nothing
// matches.
const BUILDING_CATEGORIES: RegExp[] = [
	/IFCWALL/,
	/IFCSLAB/,
	/IFCROOF/,
	/IFCCOLUMN/,
	/IFCBEAM/,
	/IFCSTAIR/,
	/IFCCURTAINWALL/,
	/IFCWINDOW/,
	/IFCDOOR/,
	/IFCMEMBER/,
	/IFCPLATE/,
	/IFCRAILING/,
	/IFCCOVERING/,
];

// Read the current theme's `background` token and return it as a hex string THREE.Color can parse.
// The token may be authored in oklch, so we round-trip through a 1px canvas (which accepts any CSS
// color) to normalise it to rgb/hex. Returns white in light mode, the dark surface in dark mode.
function readThemeBackground(): string {
	if (typeof document === "undefined") return "#0a0a0a";
	const probe = document.createElement("div");
	probe.className = "wwc:bg-background";
	probe.style.cssText = "position:absolute;opacity:0;pointer-events:none";
	document.body.appendChild(probe);
	const raw = getComputedStyle(probe).backgroundColor;
	document.body.removeChild(probe);

	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = 1;
	const ctx = canvas.getContext("2d");
	if (!ctx) return "#0a0a0a";
	ctx.fillStyle = raw || "#0a0a0a";
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// Track the themed background, re-reading it whenever the `dark` class on <html> flips.
function useThemeBackground(): string {
	const [color, setColor] = useState(readThemeBackground);
	useEffect(() => {
		const observer = new MutationObserver(() => setColor(readThemeBackground()));
		observer.observe(document.documentElement, {attributes: true, attributeFilter: ["class"]});
		return () => observer.disconnect();
	}, []);
	return color;
}

// Demo workers sampled from the model's own floor geometry once it's ready (same helper as Site
// Reality). Stands in for a live worker-location feed.
function useDemoWorkers(): FragmentMarker[] {
	const {state, api} = useFragmentViewer();
	const [workers, setWorkers] = useState<FragmentMarker[]>([]);

	useEffect(() => {
		if (state.status !== "ready" || workers.length) return;
		const components = api.viewport()?.components;
		if (!components) return;
		let cancelled = false;
		void sampleDemoWorkers(components, {count: DEMO_WORKER_COUNT}).then((next) => {
			if (!cancelled) setWorkers(next);
		});
		return () => {
			cancelled = true;
		};
	}, [state.status, api, workers.length]);

	return workers;
}

const STATUS_LABEL: Record<string, string> = {
	idle: "Loading…",
	loading: "Loading…",
	ready: "Ready",
	error: "Model unavailable",
};

// The site's real-world location (matches the site-model placement), used by the minimap.
const SITE_LON = 6.137499506;
const SITE_LAT = 46.192506022;

// The Figma "Shadow/L4" elevation for the minimap frame.
const MINIMAP_CARD_SHADOW =
	"0 0 1px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.04), 0 16px 24px rgba(0,0,0,0.06), 0 24px 32px rgba(0,0,0,0.08)";

/**
 * Bottom-left site minimap: a keyless Esri World Imagery raster centred on the site, rotated with the
 * 3D model's yaw (`heading`, degrees) so the direction you're facing always points "up". Wrapped in the
 * Figma-styled frame — rounded tile, translucent white border, the "Shadow/L4" elevation, a sandy inner
 * vignette, a fixed view cone, a green centre pin marking the building, and a "Site" label. The frame
 * chrome (vignette, view cone, pin, label) never rotates; only the imagery does.
 */
function Minimap({lon, lat, heading = 0}: {lon: number; lat: number; heading?: number}) {
	const dLon = 0.0042;
	const dLat = 0.0029;
	const bbox = `${lon - dLon},${lat - dLat},${lon + dLon},${lat + dLat}`;
	const src =
		"https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export" +
		`?bbox=${bbox}&bboxSR=4326&imageSR=4326&size=400,280&format=png32&transparent=false&f=image`;
	return (
		<div
			className="wwc:relative wwc:h-[185px] wwc:w-[185px] wwc:overflow-hidden wwc:rounded-lg wwc:border-2 wwc:border-white/30"
			style={{boxShadow: MINIMAP_CARD_SHADOW}}
		>
			{/* Rotating map layer, scaled up so the corners never expose the container edge while spinning. */}
			<div
				className="wwc:absolute wwc:inset-0 wwc:origin-center wwc:transition-transform wwc:duration-150 wwc:ease-out"
				style={{transform: `rotate(${-heading}deg) scale(1.5)`}}
			>
				<img src={src} alt="Site location" className="wwc:h-full wwc:w-full wwc:object-cover" />
			</div>
			{/* Sandy inner vignette (Figma spec). */}
			<span
				className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:rounded-[inherit]"
				style={{boxShadow: "inset 0 0 18px 12px #b6a798"}}
			/>
			{/* Fixed chrome (never rotates): view cone pointing up = the direction you're facing in 3D. */}
			<span
				className="wwc:pointer-events-none wwc:absolute wwc:left-1/2 wwc:top-1/2 wwc:-translate-x-1/2 wwc:-translate-y-[130%] wwc:border-solid wwc:border-x-[7px] wwc:border-b-[12px] wwc:border-x-transparent wwc:border-b-white/85"
				style={{width: 0, height: 0}}
			/>
			{/* Green pin at centre = where the building sits (the rotation pivot); its tip marks the spot. */}
			<MapPin className="wwc:pointer-events-none wwc:absolute wwc:left-1/2 wwc:top-1/2 wwc:h-5 wwc:w-5 wwc:-translate-x-1/2 wwc:-translate-y-full wwc:fill-[#22c55e] wwc:text-white wwc:drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]" />
			<span className="wwc:absolute wwc:left-2 wwc:top-1.5 wwc:rounded wwc:bg-black/45 wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-medium wwc:text-white wwc:backdrop-blur-sm">
				Site
			</span>
		</div>
	);
}

function StageContent({onSettled, initialFloorId}: {onSettled?: () => void; initialFloorId?: string | null}) {
	const {state, api} = useFragmentViewer();
	const workers = useDemoWorkers();
	const background = useThemeBackground();
	const status = state.status;
	const [showWorkers, setShowWorkers] = useState(false);
	// Optional GLB rendered into the viewer's scene, over the BIM model. Off by default — the model is
	// now the Duplex .frag; toggled from the toolbar.
	const [showOverlay, setShowOverlay] = useState(false);
	useGlbOverlay(OVERLAY_SRC, showOverlay);

	// 4D construction timeline — plays the schedule onto the model, assembling the building day by day.
	const [show4D, setShow4D] = useState(false);
	const timeline = use4DTimeline(show4D);

	// Start the timeline from a specific schedule day (the Schedule tab's week-bar Play). Enabling 4D
	// loads + resolves the schedule asynchronously, so the seek + play is deferred until it's ready.
	const timelineRef = useRef(timeline);
	timelineRef.current = timeline;
	const pendingStartDayRef = useRef<number | null>(null);
	const timelineReady = timeline.state.ready;
	useEffect(() => {
		if (timelineReady && pendingStartDayRef.current != null) {
			timelineRef.current.controls.seek(pendingStartDayRef.current);
			timelineRef.current.controls.play();
			pendingStartDayRef.current = null;
		}
	}, [timelineReady]);
	const startTimelineAtDay = (day: number) => {
		pendingStartDayRef.current = day;
		if (show4D) {
			if (timelineReady) {
				timeline.controls.seek(day);
				timeline.controls.play();
				pendingStartDayRef.current = null;
			}
			return;
		}
		// The timeline owns the scene — clear floor + object emphasis + workers, then enable it (the effect
		// above seeks + plays once it's ready).
		setSelectedFloorId(null);
		setObjectSel(null);
		setShowWorkers(false);
		void api.closeStorey();
		setShow4D(true);
	};

	// Selected floor drives three things at once: the left floor card highlight, the 3D storey
	// emphasis, and the right-hand Floor Inspector panel.
	const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
	const selectedFloor = getFloor(selectedFloorId);

	// The active left-panel tab, reported by FloorPanel — the right-side inspector is hidden on Schedule.
	const [leftTab, setLeftTab] = useState<FloorTab>("floors");
	// The project overview shows by default (nothing selected); its close X dismisses it until the next
	// selection change brings it back.
	const [projectDismissed, setProjectDismissed] = useState(false);
	// The project panel's "Review Progress" opens the site walkthrough clip fullscreen over the canvas.
	const [showWalkthrough, setShowWalkthrough] = useState(false);

	// Object selection (a model pick, or a schedule-row click). The object info shows as a card floating
	// near the object (at the click point for a pick; centred for a schedule click). Separate from floor
	// selection so either can be active.
	const [objectSel, setObjectSel] = useState<ObjectSelection | null>(null);
	const [objectCardPos, setObjectCardPos] = useState<{x: number; y: number} | null>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const lastClickPosRef = useRef<{x: number; y: number} | null>(null);

	// The selected object's active task — the Schedule view expands + highlights it (e.g. after a model pick).
	const selectedObjectActiveTaskId = useResolvedObject(objectSel)?.activeTaskId ?? null;

	const selectObjectById = (objectId: string) => {
		setObjectSel({objectId});
		setObjectCardPos(null); // schedule click — no canvas point, so the card centres.
		setProjectDismissed(false);
	};
	// A model pick selects that element — float its card at the click point. Empty-space clicks are
	// handled by the canvas click handler below.
	const handleSelectionChange = (selection: FragmentSelection | null) => {
		if (selection?.guid) {
			setObjectSel({guid: selection.guid, category: selection.category});
			setObjectCardPos(lastClickPosRef.current);
		}
	};

	// Latest selection + floor, read by the empty-click handler after a pick resolves.
	const selectionRef = useRef(state.selection);
	selectionRef.current = state.selection;
	const selectedFloorRef = useRef(selectedFloorId);
	selectedFloorRef.current = selectedFloorId;

	// A bare click on the 3D canvas that lands on nothing is an empty-space click — deselect the object
	// AND the floor. Checked on the next frame, once the viewer has resolved the pick. Clicks on the
	// floating panels are separate elements, so they never reach this handler.
	const handleCanvasClick = (event: React.MouseEvent) => {
		const rect = stageRef.current?.getBoundingClientRect();
		lastClickPosRef.current = rect ? {x: event.clientX - rect.left, y: event.clientY - rect.top} : null;
		// Small delay so the viewer's async pick resolves first; then, if nothing is selected, it was empty.
		window.setTimeout(() => {
			if (selectionRef.current !== null) return; // a pick landed — keep it
			setObjectSel(null);
			if (selectedFloorRef.current !== null) {
				setSelectedFloorId(null);
				void api.closeStorey();
			}
		}, 60);
	};

	// The canvas 3D model is left untouched when an object is selected — only the selected element is
	// highlighted on it (schedule click → highlightElements; model pick → the viewer's own selection).
	// The rotating outline "mini render" lives in the inspector's object card, not on the canvas.

	// Derive the model's IFC storeys once ready, so a floor click can emphasise the right level in 3D.
	useEffect(() => {
		if (status === "ready" && state.storeys.length === 0) void api.loadStoreys();
	}, [status, state.storeys.length, api]);

	// Emphasise the storey that matches a floor — by IFC name (labels mirror storey names), falling back
	// to elevation rank if names don't line up.
	const openStoreyForFloor = (floor: Floor | undefined) => {
		const {storeys} = state;
		if (!floor || storeys.length === 0) return;
		const byName = storeys.find((s) => s.name.trim().toLowerCase() === floor.label.trim().toLowerCase());
		const index = FLOORS.findIndex((f) => f.id === floor.id);
		const rank = Math.min(Math.max(FLOORS.length - 1 - index, 0), storeys.length - 1);
		const storey = byName ?? storeys[rank];
		if (storey) void api.openStorey(storey.id);
	};

	const selectFloor = (id: string) => {
		setProjectDismissed(false);
		// Toggle: clicking the active floor clears the selection and restores the whole model.
		if (id === selectedFloorId) {
			setSelectedFloorId(null);
			void api.closeStorey();
			return;
		}
		setSelectedFloorId(id);
		openStoreyForFloor(getFloor(id));
	};

	// Arriving from a site-model part-click: preselect that floor once the model + storeys are ready.
	const appliedInitial = useRef(false);
	useEffect(() => {
		if (appliedInitial.current || !initialFloorId) return;
		if (status !== "ready" || state.storeys.length === 0) return;
		appliedInitial.current = true;
		setSelectedFloorId(initialFloorId);
		openStoreyForFloor(getFloor(initialFloorId));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialFloorId, status, state.storeys.length]);

	// Tell the workspace once the model has finished (ready or error) so it can hold the map→house
	// transition until the 3D is loaded, then dissolve straight into the finished scene.
	const onSettledRef = useRef(onSettled);
	onSettledRef.current = onSettled;
	const settledFired = useRef(false);
	const fireSettled = () => {
		if (settledFired.current) return;
		settledFired.current = true;
		onSettledRef.current?.();
	};
	useEffect(() => {
		if (status === "ready" || status === "error") fireSettled();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status]);

	// A full-bleed stage — no bar of its own; the workspace's metric bar (breadcrumb + back button)
	// stays put across the map↔house transition so nothing shifts. The 3D canvas fills the stage,
	// with a load-status chip top-left, the props panel top-right, and the toolbar bottom-center.
	return (
		<div
			ref={stageRef}
			className="wwc:relative wwc:h-full wwc:min-h-0 wwc:w-full wwc:overflow-hidden wwc:bg-background wwc:text-foreground"
		>
			{/* The 3D canvas, isolated in its own boundary so a WebGL/model failure only swaps the canvas
			    for the fallback — the toolbar and panels around it stay put. */}
			<ViewerErrorBoundary fallback={<Viewer3DUnavailable />} onError={fireSettled}>
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: canvas overlay, not a keyboard control. */}
				<div style={{position: "absolute", inset: 0}} onClick={handleCanvasClick}>
					<FragmentViewer
						src={MODEL_SRC}
						modelId="house"
						workerUrl={workerUrl}
						markers={showWorkers ? workers : NO_MARKERS}
						background={background}
						// Reached from the neighborhood zoom, so skip the viewer's own camera zoom-in — the
						// model appears already framed the instant the map dissolves away.
						fitAnimation={false}
						// Frame the building shell, a touch tighter than a full fit.
						fitCategories={BUILDING_CATEGORIES}
						fitFactor={0.9}
						// A pick selects the element; clicking empty space clears the object + floor selection.
						onSelectionChange={handleSelectionChange}
					/>
				</div>
			</ViewerErrorBoundary>

			{/* Floating floor list — top-down per-floor progress; click a floor to highlight that level.
			    Hidden while the 4D timeline is running: floor emphasis (openStorey) drives the same
			    highlight channel as the timeline painter and would corrupt the day-by-day highlighting. */}
			{!show4D && (
				// A definite-height box (top → clear of the bottom-left minimap) so the FloorPanel's own tab
				// bar stays pinned while only its list scrolls. No overflow here — the panel scrolls itself —
				// so nothing clips the tab/list drop shadows. Width is driven by the panel (never < the tabs).
				<div className="wwc:absolute wwc:bottom-60 wwc:left-0 wwc:top-[76px] wwc:z-10 wwc:max-w-[60%] wwc:px-3 wwc:pt-1">
					<FloorPanel
						selectedId={selectedFloorId}
						onSelect={selectFloor}
						onPlayTimeline={startTimelineAtDay}
						onSelectObject={selectObjectById}
						onTabChange={setLeftTab}
						scheduleActiveTaskId={selectedObjectActiveTaskId}
					/>
				</div>
			)}

			{/* While the 4D timeline runs, the left panel shows live per-floor construction progress. */}
			{show4D && (
				<div className="wwc:absolute wwc:left-3 wwc:top-[76px] wwc:z-20 wwc:max-h-[calc(100%-13rem)] wwc:max-w-[48%] wwc:overflow-y-auto">
					<FloorProgressPanel state={timeline.state} />
				</div>
			)}

			{/* Bottom-left stack: load status + worker count, then the site minimap. */}
			<div className="wwc:absolute wwc:bottom-3 wwc:left-3 wwc:z-10 wwc:flex wwc:flex-col wwc:gap-2">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<Badge variant={status === "error" ? "destructive" : status === "ready" ? "secondary" : "outline"}>
						{STATUS_LABEL[status] ?? status}
					</Badge>
					{workers.length > 0 && (
						<span className="wwc:rounded wwc:bg-background/80 wwc:px-1.5 wwc:py-0.5 wwc:text-xs wwc:text-muted-foreground wwc:shadow-sm">
							{showWorkers ? `${workers.length} workers on site` : `${workers.length} workers hidden`}
						</span>
					)}
				</div>
				<Minimap lon={SITE_LON} lat={SITE_LAT} heading={state.heading} />
			</div>

			{/* Right column: the trade legend while the 4D timeline runs; else (except on the Schedule tab,
			    where the right panel is hidden) the Floor Inspector when a floor is selected, else the
			    element-props hint. Object info shows as a floating card near the object, not here. */}
			{show4D ? (
				<div className="wwc:absolute wwc:right-3 wwc:top-[76px] wwc:z-20 wwc:max-h-[calc(100%-13rem)] wwc:overflow-y-auto">
					<TradeLegend state={timeline.state} />
				</div>
			) : leftTab === "schedule" ? null : objectSel || selectedFloor ? (
				<div className="wwc:absolute wwc:right-3 wwc:top-[76px] wwc:bottom-28 wwc:z-20 wwc:w-[360px] wwc:max-w-[46%]">
					<FloorInspector
						floor={selectedFloor}
						objectSel={objectSel}
						onClose={() => selectedFloor && selectFloor(selectedFloor.id)}
						onClearObject={() => setObjectSel(null)}
						onSelectObject={selectObjectById}
					/>
				</div>
			) : projectDismissed ? null : (
				<div className="wwc:absolute wwc:right-3 wwc:top-[76px] wwc:bottom-28 wwc:z-20 wwc:w-[360px] wwc:max-w-[46%]">
					<ProjectInspector
						onClose={() => setProjectDismissed(true)}
						onPlayTimeline={() => startTimelineAtDay(0)}
						onReviewProgress={() => setShowWalkthrough(true)}
					/>
				</div>
			)}

			{/* Object info while in the Schedule view — a card floating near the clicked object (at the click
			    point, else centred). Only the object container, no schedule; closed with the card's X. On
			    the other tabs the object info shows in the right panel instead. */}
			{leftTab === "schedule" && objectSel && (
				<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:z-30">
					<div
						className="wwc:pointer-events-auto wwc:absolute wwc:w-[300px] wwc:max-w-[80vw]"
						style={
							objectCardPos
								? {
										left: Math.max(8, Math.min(objectCardPos.x + 14, (stageRef.current?.clientWidth ?? 1200) - 316)),
										top: Math.max(8, Math.min(objectCardPos.y + 14, (stageRef.current?.clientHeight ?? 800) - 300)),
									}
								: {left: "50%", top: 72, transform: "translateX(-50%)"}
						}
					>
						<FloatingObjectCard sel={objectSel} onClose={() => setObjectSel(null)} />
					</div>
				</div>
			)}

			{/* Toolbar, floating bottom-center. Zero-height wrapper so it never blocks the canvas. */}
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 44,
					height: 0,
					display: "flex",
					justifyContent: "center",
					alignItems: "flex-end",
				}}
			>
				<ViewerToolbar
					className="wwc:max-w-full wwc:shadow-lg"
					extra={({compact}) => (
						<>
							<ToolButton
								icon={CalendarClock}
								label="4D"
								compact={compact}
								active={show4D}
								onClick={() =>
									setShow4D((value) => {
										const next = !value;
										// The timeline owns the scene while it's on — clear any floor emphasis and
										// workers so they don't fight the day-by-day highlighting.
										if (next) {
											setSelectedFloorId(null);
											setObjectSel(null);
											setShowWorkers(false);
											void api.closeStorey();
										}
										return next;
									})
								}
							/>
							<ToolButton
								icon={Users}
								label="Workers"
								compact={compact}
								active={showWorkers}
								onClick={() => setShowWorkers((value) => !value)}
							/>
							<ToolButton
								icon={Boxes}
								label="Overlay"
								compact={compact}
								active={showOverlay}
								onClick={() => setShowOverlay((value) => !value)}
							/>
						</>
					)}
				/>
			</div>

			{/* 4D construction-timeline scrubber — floats above the toolbar, bottom-center. */}
			{show4D && (
				<div className="wwc:pointer-events-none wwc:absolute wwc:bottom-24 wwc:left-0 wwc:right-0 wwc:z-20 wwc:flex wwc:justify-center wwc:px-3">
					<div className="wwc:pointer-events-auto wwc:w-full wwc:max-w-[900px]">
						<TimelineOverlay state={timeline.state} controls={timeline.controls} onClose={() => setShow4D(false)} />
					</div>
				</div>
			)}

			{/* If the model itself can't be found (viewer initialised but the load failed). */}
			{status === "error" && (
				<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:z-20 wwc:flex wwc:items-center wwc:justify-center wwc:p-6">
					<div className="wwc:pointer-events-auto wwc:max-w-sm wwc:rounded-lg wwc:border wwc:bg-background wwc:p-4 wwc:text-center wwc:shadow-lg">
						<p className="wwc:text-sm wwc:font-semibold">3D model not found</p>
						<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
							Drop a Fragments model at{" "}
							<code className="wwc:font-mono">prototypes/capture/public/models/villa-vl4.frag</code> and reopen this house.
						</p>
					</div>
				</div>
			)}

			{/* Walkthrough review — opened by the project panel's "Review Progress"; the site-capture clip
			    played large over the canvas with playback controls. Dismissed with the corner X. */}
			{showWalkthrough && (
				<div className="wwc:absolute wwc:inset-0 wwc:z-40 wwc:flex wwc:items-center wwc:justify-center wwc:bg-black/70 wwc:p-8 wwc:backdrop-blur-sm">
					<div className="wwc:relative wwc:flex wwc:max-h-full wwc:w-full wwc:max-w-4xl wwc:overflow-hidden wwc:rounded-lg wwc:bg-black wwc:shadow-2xl">
						<button
							type="button"
							onClick={() => setShowWalkthrough(false)}
							aria-label="Close walkthrough"
							className="wwc:absolute wwc:right-3 wwc:top-3 wwc:z-10 wwc:flex wwc:size-8 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-black/50 wwc:text-white wwc:backdrop-blur wwc:transition-colors wwc:hover:bg-black/70 wwc:focus-visible:outline-none"
						>
							<X className="wwc:size-4" />
						</button>
						{/* biome-ignore lint/a11y/useMediaCaption: prototype walkthrough clip has no captions. */}
						<video
							src="/videos/360firstfloor.mov"
							autoPlay
							loop
							controls
							playsInline
							className="wwc:h-full wwc:max-h-[80vh] wwc:w-full wwc:object-contain"
						/>
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * Single-house 3D view. Wraps the Site Reality 3D template (FragmentViewer + ViewerToolbar) in its
 * own provider so the toolbar can drive the scene. Mounted underneath the neighborhood as soon as a
 * house is clicked, so it starts loading during the zoom and the map dissolves straight into it.
 */
export function SingleHouseView({onSettled, initialFloorId}: {onSettled?: () => void; initialFloorId?: string | null}) {
	return (
		<FragmentViewerProvider>
			<StageContent onSettled={onSettled} initialFloorId={initialFloorId} />
		</FragmentViewerProvider>
	);
}
