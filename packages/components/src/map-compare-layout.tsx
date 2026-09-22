import {cn} from "@corensystem/core-utils";
import {Maximize2, Minimize2} from "lucide-react";
import * as React from "react";

import {CompareView, type CompareViewApi} from "./compare-view";
import {MapMinimap, type MapMinimapViewport} from "./map-minimap";
import {MapToolbar, type SplitMode} from "./map-toolbar";

export interface MapCompareLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "title"> {
	/** The primary map surface (any node — tiles, SVG, canvas). Pannable/zoomable. */
	map: React.ReactNode;
	/** Optional second, geo-aligned source. When set, the toolbar's compare modes overlay it on the map. */
	compareMap?: React.ReactNode;
	/** Corner chip labels for the two sources (compare mode). */
	mapLabel?: React.ReactNode;
	compareMapLabel?: React.ReactNode;
	/**
	 * Floating controls at the top center of each source — shown only while a compare mode is active.
	 * `mapCenter` sits in the primary (before) view, `compareMapCenter` in the compare (after) view;
	 * e.g. a per-view `TimestampPicker` to scrub each side's capture.
	 */
	mapCenter?: React.ReactNode;
	compareMapCenter?: React.ReactNode;
	/** Optional legend node, floated bottom-left. */
	legend?: React.ReactNode;
	/** Optional title/status node, floated top-left. */
	title?: React.ReactNode;
	/**
	 * Optional element docked across the bottom of the workspace, shown only while a compare mode
	 * is active — e.g. a `TimelineRangeSelector` scrubbing the captures behind both views.
	 */
	bottomBar?: React.ReactNode;
	/** Fires whenever a compare mode is toggled on or off (e.g. to reset each view's selection). */
	onCompareActiveChange?: (active: boolean) => void;
	/** Show a fullscreen toggle button (top-right, above the toolbar). Default false. */
	fullscreen?: boolean;
	/**
	 * Show the overview minimap (bottom-right). Default true. In side-by-side compare with the
	 * divider unlocked, a second overview appears bottom-left so each pane can be navigated on its own.
	 */
	minimap?: boolean;
	/** Initial zoom. Default 1.5 (so you can pan immediately). */
	defaultScale?: number;
	minScale?: number;
	maxScale?: number;
	/** Initial compass bearing in degrees (0 = north). Default 0. */
	defaultBearing?: number;
}

/**
 * A floating-control map workspace that composes the map features into one layout: a pannable,
 * zoomable `CompareView` surface with an optional as-planned/as-built compare, a vertical
 * `MapToolbar` (compare modes, locate, zoom, compass) top-right, an overview `MapMinimap`
 * bottom-right that tracks and drives the view, optional legend / title slots, and optional
 * per-view center controls (`mapCenter` / `compareMapCenter`) that surface only while comparing.
 */
const MapCompareLayout = React.forwardRef<HTMLDivElement, MapCompareLayoutProps>(
	(
		{
			className,
			map,
			compareMap,
			mapLabel,
			compareMapLabel,
			mapCenter,
			compareMapCenter,
			legend,
			title,
			bottomBar,
			onCompareActiveChange,
			fullscreen = false,
			minimap = true,
			defaultScale = 1.5,
			minScale = 1,
			maxScale = 6,
			defaultBearing = 0,
			...rest
		},
		ref,
	) => {
		const [splitMode, setSplitMode] = React.useState<SplitMode | null>(null);
		const [bearing, setBearing] = React.useState(defaultBearing);
		const [view, setView] = React.useState<MapMinimapViewport>({x: 0, y: 0, width: 1, height: 1});
		const [viewAfter, setViewAfter] = React.useState<MapMinimapViewport>({x: 0, y: 0, width: 1, height: 1});
		const [locked, setLocked] = React.useState(true);
		const controller = React.useRef<CompareViewApi | null>(null);
		const canCompare = compareMap != null;
		const compareActive = canCompare && splitMode != null;

		// Leave compare view — clears the active mode and resets the divider to locked so the next
		// compare session starts synced. Surfaced as "Exit compare view" in the toolbar's compare menu.
		const exitCompare = React.useCallback(() => {
			setSplitMode(null);
			setLocked(true);
		}, []);

		const showBottomBar = compareActive && bottomBar != null;
		// While side-by-side panes move independently (divider unlocked), each pane gets its own
		// overview minimap in its corner; otherwise a single overview tracks the synced view.
		const dualMinimaps = minimap && compareActive && splitMode === "side-by-side" && !locked;

		// Merge the forwarded ref with a local one so we can drive the Fullscreen API on the root.
		const rootRef = React.useRef<HTMLDivElement | null>(null);
		const setRefs = React.useCallback(
			(node: HTMLDivElement | null) => {
				rootRef.current = node;
				if (typeof ref === "function") {
					ref(node);
				} else if (ref) {
					ref.current = node;
				}
			},
			[ref],
		);

		// Notify consumers when a compare mode toggles on or off.
		const compareChangeRef = React.useRef(onCompareActiveChange);
		compareChangeRef.current = onCompareActiveChange;
		React.useEffect(() => {
			compareChangeRef.current?.(compareActive);
		}, [compareActive]);

		// Track fullscreen so the button icon and the root's size/chrome stay in sync.
		const [isFullscreen, setIsFullscreen] = React.useState(false);
		React.useEffect(() => {
			const onChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current);
			document.addEventListener("fullscreenchange", onChange);
			return () => document.removeEventListener("fullscreenchange", onChange);
		}, []);
		const toggleFullscreen = React.useCallback(() => {
			if (document.fullscreenElement) {
				void document.exitFullscreen?.();
			} else {
				void rootRef.current?.requestFullscreen?.();
			}
		}, []);

		return (
			<div
				ref={setRefs}
				className={cn(
					"wwc:relative wwc:flex wwc:w-full wwc:flex-col wwc:overflow-hidden",
					isFullscreen ? "wwc:h-full wwc:bg-card" : "wwc:h-[32rem] wwc:rounded-lg wwc:border",
					className,
				)}
				{...rest}
			>
				{/* Map region — all floating controls anchor here, above the optional docked footer. */}
				<div className="wwc:relative wwc:min-h-0 wwc:flex-1">
					<CompareView
						className="wwc:absolute wwc:inset-0"
						interactive
						defaultScale={defaultScale}
						minScale={minScale}
						maxScale={maxScale}
						mode={splitMode ?? "swipe"}
						before={map}
						after={canCompare && splitMode ? compareMap : undefined}
						beforeLabel={mapLabel}
						afterLabel={compareMapLabel}
						locked={locked}
						onLockedChange={setLocked}
						onViewChange={setView}
						onViewChangeAfter={setViewAfter}
						viewControllerRef={controller}
					/>

					{/* Per-view floating controls, centered over each source while comparing. */}
					{compareActive && (mapCenter != null || compareMapCenter != null) && (
						<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:z-20">
							{mapCenter != null && (
								<div className="wwc:pointer-events-auto wwc:absolute wwc:left-1/4 wwc:top-3 wwc:-translate-x-1/2">
									{mapCenter}
								</div>
							)}
							{compareMapCenter != null && (
								<div className="wwc:pointer-events-auto wwc:absolute wwc:left-3/4 wwc:top-3 wwc:-translate-x-1/2">
									{compareMapCenter}
								</div>
							)}
						</div>
					)}

					{title != null && (
						<div className="wwc:pointer-events-none wwc:absolute wwc:left-3 wwc:top-3 wwc:z-20">{title}</div>
					)}

					{/* Before-pane toolbar (top-left) — only while the split is unlocked. Carries the global
					    compare-mode control so the top-right toolbar can be the after pane's nav on its own. */}
					{dualMinimaps && (
						<div className="wwc:absolute wwc:left-3 wwc:top-3 wwc:z-20">
							<MapToolbar
								splitMode={splitMode}
								onSplitModeChange={setSplitMode}
								onExitCompare={exitCompare}
								onLocate={() => controller.current?.setCenter(0.5, 0.5)}
								onZoomIn={() => controller.current?.zoomBy(1.4)}
								onZoomOut={() => controller.current?.zoomBy(1 / 1.4)}
								bearing={bearing}
								onResetNorth={() => setBearing(0)}
							/>
						</div>
					)}

					<div className="wwc:absolute wwc:right-3 wwc:top-3 wwc:z-20 wwc:flex wwc:flex-col wwc:items-end wwc:gap-2">
						{fullscreen && (
							<button
								type="button"
								onClick={toggleFullscreen}
								aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
								aria-pressed={isFullscreen}
								className="wwc:flex wwc:size-9 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:text-foreground wwc:shadow-sm wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-accent-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring"
							>
								{isFullscreen ? <Minimize2 className="wwc:size-4" /> : <Maximize2 className="wwc:size-4" />}
							</button>
						)}
						{/* Locked / not-split: primary toolbar with the compare control, driving the synced view.
						    Unlocked split: the after pane's nav only — compare-mode lives on the before-pane toolbar. */}
						<MapToolbar
							splitMode={!dualMinimaps && canCompare ? splitMode : undefined}
							onSplitModeChange={!dualMinimaps && canCompare ? setSplitMode : undefined}
							onExitCompare={!dualMinimaps && canCompare ? exitCompare : undefined}
							onLocate={() =>
								dualMinimaps ? controller.current?.setCenterAfter(0.5, 0.5) : controller.current?.setCenter(0.5, 0.5)
							}
							onZoomIn={() => (dualMinimaps ? controller.current?.zoomByAfter(1.4) : controller.current?.zoomBy(1.4))}
							onZoomOut={() =>
								dualMinimaps ? controller.current?.zoomByAfter(1 / 1.4) : controller.current?.zoomBy(1 / 1.4)
							}
							bearing={bearing}
							onResetNorth={() => setBearing(0)}
						/>
					</div>

					{/* Legend yields the bottom-left corner to the before-pane minimap while dual minimaps show. */}
					{legend != null && !dualMinimaps && (
						<div className="wwc:absolute wwc:bottom-3 wwc:left-3 wwc:z-20">{legend}</div>
					)}

					{/* Before-pane overview, bottom-left — only while the split is unlocked. */}
					{dualMinimaps && (
						<MapMinimap
							className="wwc:absolute wwc:bottom-3 wwc:left-3 wwc:z-20"
							viewport={view}
							onNavigate={(c) => controller.current?.setCenter(c.x, c.y)}
							label="Overview"
							minimizable
						>
							{map}
						</MapMinimap>
					)}

					{/* Primary overview, bottom-right. Tracks the after pane while the split is unlocked. */}
					{minimap && (
						<MapMinimap
							className="wwc:absolute wwc:bottom-3 wwc:right-3 wwc:z-20"
							viewport={dualMinimaps ? viewAfter : view}
							onNavigate={(c) =>
								dualMinimaps ? controller.current?.setCenterAfter(c.x, c.y) : controller.current?.setCenter(c.x, c.y)
							}
							label="Overview"
							minimizable
						>
							{dualMinimaps ? compareMap : map}
						</MapMinimap>
					)}
				</div>

				{/* Docked footer — only while comparing. */}
				{showBottomBar && (
					<div className="wwc:z-30 wwc:shrink-0 wwc:border-t wwc:border-border wwc:bg-card">{bottomBar}</div>
				)}
			</div>
		);
	},
);
MapCompareLayout.displayName = "MapCompareLayout";

export {MapCompareLayout};
