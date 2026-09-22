import {cn} from "@core/core-utils";
import {Minus, Plus, RefreshCw, Scan} from "lucide-react";
import {
	type MouseEvent as ReactMouseEvent,
	type PointerEvent as ReactPointerEvent,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";

import {Button} from "./button";
import {useMapTransition} from "./map-transition";
import {MONOCHROME_STYLE, styleForVilla} from "./site-image-viewer/milestone-ramp";
import type {MapMode, Villa} from "./site-image-viewer/types";
import {VillaHoverCard} from "./site-image-viewer/villa-hover-card";
import {Spinner} from "./spinner";
import {HoverTooltip} from "./tooltip";

export type {MapMode, Villa, SiteMeta} from "./site-image-viewer/types";
export {PROGRESS_LEGEND_ITEMS, VARIANCE_LEGEND_ITEMS} from "./site-image-viewer/legend-items";
export {
	MILESTONE_COLOR_RAMP,
	approvedProgressToBucket,
	bucketLabel,
	classifyVariance,
	styleForVilla,
} from "./site-image-viewer/milestone-ramp";

// Floating-card placement constants — flip-and-clamp. Card is 384×320; it flips to the other side of the
// cursor near an edge, then clamps inside the frame with an 8px margin.
const CARD_W = 384;
const CARD_H = 320;
const OFFSET = 14;
const MARGIN = 8;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** "Just now" / "3m ago" / "2h ago" — how long since the last refresh (shown on the refresh button hover). */
function sinceLabel(ts: number): string {
	const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
	if (s < 60) return "Just now";
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
}

function cardPosition(point: {x: number; y: number}, frameW: number, frameH: number) {
	const left = point.x + OFFSET + CARD_W + MARGIN > frameW ? point.x - CARD_W - OFFSET : point.x + OFFSET;
	const top = point.y + OFFSET + CARD_H + MARGIN > frameH ? point.y - CARD_H - OFFSET : point.y + OFFSET;
	return {
		left: clamp(left, MARGIN, Math.max(MARGIN, frameW - CARD_W - MARGIN)),
		top: clamp(top, MARGIN, Math.max(MARGIN, frameH - CARD_H - MARGIN)),
	};
}

/** The villa number only — the leading digits of the name (e.g. "2166 VL6-R" → "2166"). */
function villaNumber(villa: Villa) {
	return villa.name.match(/^\d+/)?.[0] ?? villa.name;
}

/**
 * The villa number, centered in its polygon and shown for every villa at all times — a rounded chip lifted
 * off the map by the group's drop-shadow filter. `theme` picks the chip colours: `dark` (default) is a black
 * chip with white text; `light` is a white chip with dark text. The `fontSize` is in viewBox units — the
 * viewer counter-scales it so the label renders at a constant on-screen size at any fit/zoom; the chip
 * scales with it.
 */
function VillaLabel({
	villa,
	fontSize,
	theme = "dark",
	leaderPx = 0,
	leaderWidth = 0,
}: {
	villa: Villa;
	fontSize: number;
	theme?: "light" | "dark";
	leaderPx?: number;
	leaderWidth?: number;
}) {
	const cx = villa.x + villa.width / 2;
	const cy = villa.y + villa.height / 2;
	const label = villaNumber(villa);
	const padX = fontSize * 0.55;
	const boxH = fontSize + fontSize * 0.5;
	const boxW = label.length * fontSize * 0.6 + padX * 2;
	const light = theme === "light";
	return (
		<g pointerEvents="none">
			{/* Leader line — a thin white bar dropping from the label's underside toward the villa (selected only). */}
			{leaderPx > 0 ? (
				<rect
					x={cx - leaderWidth / 2}
					y={cy + boxH / 2}
					width={leaderWidth}
					height={leaderPx}
					fill="#ffffff"
					fillOpacity={0.75}
				/>
			) : null}
			<rect
				x={cx - boxW / 2}
				y={cy - boxH / 2}
				width={boxW}
				height={boxH}
				rx={fontSize * 0.3}
				fill={light ? "#ffffff" : "#000000"}
			/>
			<text
				x={cx}
				y={cy}
				textAnchor="middle"
				dominantBaseline="central"
				fontSize={fontSize}
				fontWeight={600}
				fill={light ? "#111827" : "#ffffff"}
			>
				{label}
			</text>
		</g>
	);
}

export interface SiteImageViewerProps {
	/** The background site-plan image (an aerial / blueprint). Hosted by the consumer. */
	backgroundUrl: string;
	/** Villa overlay data, in image-pixel space. See `@core/core-ui/site-image-viewer-fixtures` for the real ROSHN Almanar set. */
	villas: Villa[];
	/**
	 * Optional block-level hull polygons (one per block), in the SAME image-pixel space as `villas`. When
	 * provided, the map shows block-name labels while fully zoomed out and swaps to per-villa number chips
	 * once zoomed in past 10% — mirroring the 3D reality view's Block → Villa LOD label hand-off. Only the
	 * labels swap; the villa polygon overlay stays drawn throughout. Omit for the classic "villa labels always"
	 * behaviour. See `ALMANAR_ZONE_A_BLOCKS` in the fixtures.
	 */
	blocks?: Villa[];
	/** The image's natural pixel size — drives the SVG `viewBox` so villa points map 1:1. Default 4096×4096. */
	imageWidth?: number;
	imageHeight?: number;
	/**
	 * How the site image fits its frame. `cover` fills the frame (default; crops the outer plan) — the SVG
	 * overlay slices to match so footprints stay registered. `contain` letterboxes to show the whole plan.
	 */
	imageFit?: "cover" | "contain";
	/**
	 * Colour mode. `progress` = "SPA" ramp; `variance` = "Construction" ±plan. Controlled when
	 * `onMapModeChange` is provided (drive it from outside); otherwise this is the initial mode. Default `progress`.
	 */
	mapMode?: MapMode;
	/** Fired when the colour mode changes. Provide to control `mapMode` from outside (e.g. shared with a side panel). */
	onMapModeChange?: (mode: MapMode) => void;
	/**
	 * Show the floating Approved-vs-Planned progress card while hovering a villa. Off by default — hovering
	 * still raises the villa's stroke + name chip (inline, no modal). Opt in for the full hover card.
	 */
	hoverCard?: boolean;
	/** Fired when a linked villa is clicked, with its `linkedLbsItemId`. */
	onNavigate?: (lbsItemId: number) => void;
	/**
	 * Fired when any villa polygon is clicked, with its `id` (matches the row id used by side panels).
	 * When provided, every polygon becomes clickable and (unless `focusOnSelect` is false) the viewer
	 * smoothly zooms in ~20% centred on it.
	 */
	onSelectVilla?: (villaId: number | string) => void;
	/**
	 * Whether a polygon click also zooms in ~20% centred on it. Default true. Set false when the click drives
	 * a level drill-down (the consumer runs its own map transition instead).
	 */
	focusOnSelect?: boolean;
	/** The currently-selected villa `id`. Its label renders 10% larger and in light mode (white chip). */
	selectedVillaId?: number | string;
	/** Seed a hovered villa on mount (for a preselected-hover story). */
	initialHoveredId?: number;
	/**
	 * On-screen size (in px) of the villa-number labels. Held constant no matter how the image is scaled to
	 * fit its frame — the viewer counter-scales the SVG text against the fit scale. Default 12.
	 */
	labelSize?: number;
	/** Villa-number chip colours: `dark` (black chip, white text; default) or `light` (white chip, dark text). */
	labelTheme?: "light" | "dark";
	/** Opacity (0–1) of the villa polygon fills — a colour wash over the aerial. Hover adds a small boost. Default 0.37. */
	fillOpacity?: number;
	/** Draw the villa polygon overlay. Default true. Turn off to show the plain background. */
	showPolygons?: boolean;
	/**
	 * Render every polygon in a single neutral grey instead of the progress/variance colours — a way to HIDE
	 * progress on the map (e.g. the parent grouping levels) while the underlying values stay intact. Default false.
	 */
	monochrome?: boolean;
	/** Draw the villa-number labels. Default true. */
	showLabels?: boolean;
	/** Transition: scale the *map layer only* out to the grey frame (24px corners). Zoom tools + legend stay put. */
	mapScaledOut?: boolean;
	/** Transition: blur the *map layer only*. */
	mapBlurred?: boolean;
	/** Fade out the on-map controls (zoom tools + legend) — e.g. while a full-screen sheet is over the map. */
	chromeHidden?: boolean;
	/** Show a refresh button in the bottom-right cluster (left of the legend). Fired on click. */
	onRefresh?: () => void;
	/** Hover-tooltip text for the refresh button (e.g. "Updated 14 min ago"). Default "Refresh". */
	refreshLabel?: string;
	className?: string;
}

/**
 * Site Image Viewer — a background site-plan image with a villa polygon overlay coloured by construction
 * progress. A plain `<svg>` whose `viewBox` equals the image's natural pixel size sits over an `<img>`, so
 * image-pixel villa points map to the screen automatically (no canvas library, no coordinate math).
 *
 * Villas colour by their approved % across the milestone ramp; unlinked villas render grey, linked-but-no-
 * progress render slate. Hovering a linked villa raises its stroke + name chip and pops a floating progress
 * card (the DS `ProgressComparison`) near the cursor. The `TabbedLegend` (top-right) keys the colours and
 * doubles as the SPA (progress) ↔ Construction (variance) mode switch.
 */
export function SiteImageViewer({
	backgroundUrl,
	villas,
	blocks = [],
	imageWidth = 4096,
	imageHeight = 4096,
	imageFit = "cover",
	mapMode: mapModeProp,
	onMapModeChange,
	hoverCard = false,
	onNavigate,
	onSelectVilla,
	focusOnSelect = true,
	selectedVillaId,
	initialHoveredId,
	labelSize = 12,
	labelTheme = "dark",
	fillOpacity = 0.37,
	showPolygons = true,
	monochrome = false,
	showLabels = true,
	mapScaledOut = false,
	mapBlurred = false,
	chromeHidden = false,
	onRefresh,
	refreshLabel = "Refresh",
	className,
}: SiteImageViewerProps) {
	const frameRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<HTMLDivElement>(null);
	// Colour mode — controlled when `onMapModeChange` is provided, otherwise internal (seeded by `mapMode`).
	const [internalMode, setInternalMode] = useState<MapMode>(mapModeProp ?? "progress");
	const mapMode = onMapModeChange != null ? (mapModeProp ?? "progress") : internalMode;
	const setMapMode = (m: MapMode) => {
		if (onMapModeChange == null) setInternalMode(m);
		onMapModeChange?.(m);
	};
	// Refresh: a brief scale-out + blur + spinner (the shared map transition), then the fresh view. In real
	// use `onRefresh` refetches at the zoomed-out midpoint; in Storybook it's a no-op, so this just showcases
	// the animation. `refreshedAt` drives the hover label ("Just now" → "Xm ago"); a slow tick keeps it fresh.
	const refreshTx = useMapTransition();
	const [refreshedAt, setRefreshedAt] = useState<number | null>(null);
	const [, setRefreshTick] = useState(0);
	useEffect(() => {
		if (refreshedAt == null) return;
		const id = window.setInterval(() => setRefreshTick((t) => t + 1), 15000);
		return () => window.clearInterval(id);
	}, [refreshedAt]);
	const [hovered, setHovered] = useState<Villa | null>(() => villas.find((v) => v.id === initialHoveredId) ?? null);
	const [point, setPoint] = useState({x: 0, y: 0});
	const [frameSize, setFrameSize] = useState({w: 0, h: 0});
	const frameSizeRef = useRef({w: 0, h: 0});
	// The pan/zoom view: `zoom` (1 = fit) and `x`/`y` translate in screen px, transform-origin top-left.
	const [view, setView] = useState({zoom: 1, x: 0, y: 0});

	// Track the frame's rendered size so we know how much the viewBox is scaled to fit. Keeps the label
	// font (and the hover-card clamp) correct on every resize.
	useLayoutEffect(() => {
		const el = frameRef.current;
		if (!el) return;
		const update = () => {
			const size = {w: el.clientWidth, h: el.clientHeight};
			frameSizeRef.current = size;
			setFrameSize(size);
		};
		update();
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	// ── Pan / zoom ────────────────────────────────────────────────────────────
	const MIN_ZOOM = 1; // fit is the floor — no zooming out past the image
	const MAX_ZOOM = 8;
	const ZOOM_STEP = 1.6;
	// Block ↔ villa label LOD hand-off (mirrors the 3D reality view): fully zoomed out (fit) shows block-name
	// labels; once zoomed in past 10% the per-villa number chips take over. Only applies when `blocks` is given.
	const BLOCK_LABEL_MAX_ZOOM = 1.1;
	const clampNum = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
	const clampPan = (x: number, y: number, z: number) => {
		const {w, h} = frameSizeRef.current;
		// Zoomed out past fill (z < 1): the image is smaller than the frame → centre it (dark grey shows
		// around). Otherwise keep the scaled map covering the frame: translate stays within [frame*(1-z), 0].
		if (z < 1) return {x: (w * (1 - z)) / 2, y: (h * (1 - z)) / 2};
		return {x: clampNum(x, w * (1 - z), 0), y: clampNum(y, h * (1 - z), 0)};
	};
	// Zoom by `factor` while keeping the point (ax, ay) — in frame px — fixed under the cursor/centre.
	const zoomAround = (ax: number, ay: number, factor: number) =>
		setView((v) => {
			const nextZoom = clampNum(v.zoom * factor, MIN_ZOOM, MAX_ZOOM);
			if (nextZoom === v.zoom) return v;
			const contentX = (ax - v.x) / v.zoom;
			const contentY = (ay - v.y) / v.zoom;
			return {zoom: nextZoom, ...clampPan(ax - contentX * nextZoom, ay - contentY * nextZoom, nextZoom)};
		});
	const centerZoom = (factor: number) => zoomAround(frameSizeRef.current.w / 2, frameSizeRef.current.h / 2, factor);
	const resetView = () => setView({zoom: 1, x: 0, y: 0});

	// A one-shot eased view change (used by focusVilla) — CSS-transitions the pan/zoom transform for this
	// update, then drops the transition so wheel/drag stay snappy.
	const [animating, setAnimating] = useState(false);
	const animTimer = useRef<number | null>(null);
	const animateView = (updater: (v: {zoom: number; x: number; y: number}) => {zoom: number; x: number; y: number}) => {
		setAnimating(true);
		setView(updater);
		if (animTimer.current != null) window.clearTimeout(animTimer.current);
		animTimer.current = window.setTimeout(() => setAnimating(false), 320);
	};

	// Focus a villa: centre it. From the fit view it settles at a FIXED 50% zoom-in; if the map is ALREADY
	// zoomed in (jumping villa → villa) it keeps the current zoom and only re-centres — it never zooms in
	// further. Points are image px; convert to frame px through the fit scale + centring offset, then solve
	// the pan that lands the centroid mid-frame.
	const FOCUS_ZOOM = 1.5;
	const focusVilla = (villa: Villa) => {
		const {w, h} = frameSizeRef.current;
		if (!w || !h || villa.points.length === 0) return;
		const n = villa.points.length;
		const cx = villa.points.reduce((s, p) => s + p.x, 0) / n;
		const cy = villa.points.reduce((s, p) => s + p.y, 0) / n;
		const fs =
			imageFit === "cover" ? Math.max(w / imageWidth, h / imageHeight) : Math.min(w / imageWidth, h / imageHeight);
		const lx = cx * fs + (w - imageWidth * fs) / 2;
		const ly = cy * fs + (h - imageHeight * fs) / 2;
		animateView((v) => {
			// Already zoomed in → keep the current zoom (just re-centre); from fit → zoom to FOCUS_ZOOM.
			const z = v.zoom > 1.001 ? v.zoom : clampNum(FOCUS_ZOOM, MIN_ZOOM, MAX_ZOOM);
			return {zoom: z, ...clampPan(w / 2 - lx * z, h / 2 - ly * z, z)};
		});
	};

	// Wheel-to-zoom toward the cursor (native, non-passive so we can preventDefault the page scroll).
	useEffect(() => {
		const el = frameRef.current;
		if (!el) return;
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			const rect = el.getBoundingClientRect();
			zoomAround(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
		};
		el.addEventListener("wheel", onWheel, {passive: false});
		return () => el.removeEventListener("wheel", onWheel);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Drag-to-pan (only once zoomed in). Capture starts after a small threshold so plain clicks/hovers work.
	const dragRef = useRef<{lastX: number; lastY: number; startX: number; startY: number; active: boolean} | null>(null);
	const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
		if (view.zoom <= 1) return;
		dragRef.current = {lastX: e.clientX, lastY: e.clientY, startX: e.clientX, startY: e.clientY, active: false};
	};
	const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
		const d = dragRef.current;
		if (!d) return;
		if (!d.active) {
			if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 3) return;
			d.active = true;
			try {
				mapRef.current?.setPointerCapture(e.pointerId);
			} catch {
				// Ignore — capture is best-effort; panning still works without it.
			}
		}
		const dx = e.clientX - d.lastX;
		const dy = e.clientY - d.lastY;
		d.lastX = e.clientX;
		d.lastY = e.clientY;
		setView((v) => ({...v, ...clampPan(v.x + dx, v.y + dy, v.zoom)}));
	};
	const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
		if (dragRef.current?.active) {
			try {
				mapRef.current?.releasePointerCapture(e.pointerId);
			} catch {
				// Ignore.
			}
		}
		dragRef.current = null;
	};

	// Read the pointer position off the mouse event (the frame size comes from the observer above).
	const track = (event: ReactMouseEvent) => {
		const rect = frameRef.current?.getBoundingClientRect();
		if (!rect) return;
		setPoint({x: event.clientX - rect.left, y: event.clientY - rect.top});
	};

	const pos = cardPosition(point, frameSize.w, frameSize.h);

	// The viewBox → screen scale. `cover` fills (max), `contain` letterboxes (min). The label font is set in
	// viewBox units as `labelSize / (fitScale * zoom)`, so on screen it stays a constant `labelSize` px at
	// any fit AND any zoom level.
	const fitScale =
		imageFit === "cover"
			? Math.max(frameSize.w / imageWidth, frameSize.h / imageHeight)
			: Math.min(frameSize.w / imageWidth, frameSize.h / imageHeight);
	const labelFontSize = labelSize / ((fitScale > 0 ? fitScale : 1) * view.zoom);
	// One screen px in viewBox units — counter-scales the label lift + leader line to constant on-screen sizes.
	const vbPerScreenPx = 1 / ((fitScale > 0 ? fitScale : 1) * view.zoom);
	const selLabelLift = 48 * vbPerScreenPx; // the selected-villa label rises 48 screen px
	const shadowId = useId();
	const selectedVilla =
		selectedVillaId != null ? (villas.find((v) => String(v.id) === String(selectedVillaId)) ?? null) : null;
	const hasSelection = selectedVilla != null;

	// Block ↔ villa label tier (see BLOCK_LABEL_MAX_ZOOM). With blocks supplied, the block-name labels show
	// while fully zoomed out and give way to the per-villa chips once zoomed in past 10%; with no blocks the
	// villa labels always show (classic behaviour). Only the labels swap — the villa polygons stay drawn.
	const showBlockLabels = showLabels && blocks.length > 0 && view.zoom < BLOCK_LABEL_MAX_ZOOM;
	const showVillaLabels = showLabels && !showBlockLabels;

	// Selecting a villa focuses it — whether the click came from the map polygon or the left-rail list, both
	// paths set `selectedVillaId`, so both get the identical zoom-and-centre here. Closing the villa
	// (selectedVillaId → null) animates back to the exact zoom + pan the map was at before the first selection.
	const preFocusView = useRef<{zoom: number; x: number; y: number} | null>(null);
	useEffect(() => {
		if (!focusOnSelect) return;
		if (selectedVilla) {
			// Remember the pre-selection view once (not on villa → villa jumps) so closing can return to it.
			if (preFocusView.current == null) preFocusView.current = view;
			focusVilla(selectedVilla);
		} else if (preFocusView.current != null) {
			const target = preFocusView.current;
			preFocusView.current = null;
			animateView(() => ({zoom: target.zoom, ...clampPan(target.x, target.y, target.zoom)}));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedVillaId]);

	// Selected-villa label pop: animate it up 80px on select. (Deselect just snaps — the label unmounts, and
	// animating the return would need it kept mounted; per the request, only the select is animated.)
	const [labelLifted, setLabelLifted] = useState(false);
	useEffect(() => {
		if (!selectedVilla) {
			setLabelLifted(false);
			return;
		}
		setLabelLifted(false); // mount at rest…
		const id = requestAnimationFrame(() => setLabelLifted(true)); // …then lift next frame so the transition plays
		return () => cancelAnimationFrame(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedVillaId]);

	return (
		<div
			ref={frameRef}
			className={cn("wwc:relative wwc:h-full wwc:w-full wwc:overflow-hidden wwc:bg-zinc-800", className)}
			onMouseLeave={() => setHovered(null)}
		>
			{/* Transition layer — a location/level switch scales + blurs ONLY the map (this div), revealing the
			    grey frame, while the zoom tools + legend (siblings below) stay crisp and in place. */}
			<div
				className={cn(
					"wwc:absolute wwc:inset-0 wwc:origin-center wwc:transition-all wwc:duration-500 wwc:ease-in-out",
					(mapScaledOut || refreshTx.scaledOut) && "wwc:scale-[0.95] wwc:overflow-hidden wwc:rounded-[25.26px]",
					(mapBlurred || refreshTx.blurred) && "wwc:blur-sm",
				)}
			>
				{/* Pan/zoom layer — the image + overlay scale/translate together so footprints stay registered. */}
				<div
					ref={mapRef}
					className={cn(
						"wwc:absolute wwc:inset-0 wwc:touch-none wwc:select-none",
						view.zoom > 1 ? "wwc:cursor-grab wwc:active:cursor-grabbing" : "",
					)}
					style={{
						transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
						transformOrigin: "0 0",
						transition: animating ? "transform 300ms ease-out" : undefined,
						// Zoomed out past fill: round the floating image's corners (24px on-screen; counter-scaled).
						borderRadius: view.zoom < 1 ? 24 / view.zoom : undefined,
						overflow: view.zoom < 1 ? "hidden" : undefined,
					}}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
				>
					{/* biome-ignore lint/a11y/noRedundantAlt: it's a site plan, "Site plan" is the right alt. */}
					<img
						src={backgroundUrl}
						alt="Site plan"
						draggable={false}
						className={cn(
							"wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:select-none",
							imageFit === "cover" ? "wwc:object-cover" : "wwc:object-contain",
						)}
					/>

					{/* viewBox == image natural size, so villa points (image px) map 1:1 to screen. The overlay's
			    preserveAspectRatio mirrors the image's object-fit so the polygons stay registered. */}
					<svg
						className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full"
						viewBox={`0 0 ${imageWidth} ${imageHeight}`}
						preserveAspectRatio={imageFit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
						role="img"
						aria-label="Villa progress overlay"
					>
						<defs>
							<filter id={shadowId} x="-40%" y="-40%" width="180%" height="180%">
								<feDropShadow
									dx="0"
									dy={labelFontSize * 0.14}
									stdDeviation={labelFontSize * 0.14}
									floodColor="#000000"
									floodOpacity={0.55}
								/>
							</filter>
						</defs>
						{showPolygons &&
							villas.map((villa) => {
								const s = monochrome ? MONOCHROME_STYLE : styleForVilla(villa, mapMode);
								const linked = villa.linkedLbsItemId != null;
								const isHover = hovered?.id === villa.id;
								// Whitelist filter: keep only the selected villa at full opacity; dim the rest to 60%.
								const dim = hasSelection && String(villa.id) !== String(selectedVillaId);
								return (
									<polygon
										key={villa.id}
										data-villa-id={villa.id}
										opacity={dim ? 0.6 : undefined}
										points={villa.points.map((p) => `${p.x},${p.y}`).join(" ")}
										fill={s.fill}
										fillOpacity={isHover ? Math.min(1, fillOpacity + 0.2) : fillOpacity}
										stroke={s.stroke}
										strokeWidth={isHover ? 3.5 : 2}
										strokeLinejoin="round"
										style={{
											pointerEvents: linked || onSelectVilla ? "auto" : "none",
											cursor: linked || onSelectVilla ? "pointer" : "default",
											transition: "fill-opacity 120ms, stroke-width 120ms",
										}}
										onMouseEnter={(event) => {
											setHovered(villa);
											if (hoverCard) track(event);
										}}
										onMouseMove={hoverCard ? track : undefined}
										onMouseLeave={() => setHovered(null)}
										onClick={() => {
											if (onSelectVilla) {
												onSelectVilla(villa.id);
											} else if (linked) {
												onNavigate?.(villa.linkedLbsItemId as number);
											}
										}}
									/>
								);
							})}
						{/* Block-name labels — one centred chip per block hull, shown only while fully zoomed out (mirrors
				    the 3D reality view's coarse Block tier). Zooming in past 10% swaps these for the villa chips. */}
						{showBlockLabels && (
							<g pointerEvents="none" filter={`url(#${shadowId})`}>
								{blocks.map((b) => (
									<VillaLabel key={b.id} villa={b} fontSize={labelFontSize} theme={labelTheme} />
								))}
							</g>
						)}
						{/* Villa numbers, centered in every polygon at all times (drawn above the fills). Every label is
				    dark (base `labelTheme`); the selected villa is skipped here and re-drawn last, larger + light. */}
						{showVillaLabels && (
							<g pointerEvents="none" opacity={hasSelection ? 0.6 : 1} filter={`url(#${shadowId})`}>
								{villas.map((v) =>
									selectedVillaId != null && String(v.id) === String(selectedVillaId) ? null : (
										<VillaLabel key={v.id} villa={v} fontSize={labelFontSize} theme={labelTheme} />
									),
								)}
							</g>
						)}
						{/* On hover, the villa's number chip — drawn on top and shown at ANY zoom (even while the coarser
				    block labels are up), so hovering a footprint always identifies it. Skipped for the selected
				    villa, which is already drawn on top below. */}
						{showLabels && hovered && String(hovered.id) !== String(selectedVillaId ?? "") ? (
							<g pointerEvents="none" filter={`url(#${shadowId})`}>
								<VillaLabel villa={hovered} fontSize={labelFontSize} theme={labelTheme} />
							</g>
						) : null}
						{/* Selected villa — drawn last so it sits on top, 10% larger and in light mode. */}
						{showVillaLabels && selectedVilla ? (
							<g
								pointerEvents="none"
								filter={`url(#${shadowId})`}
								style={{
									transform: `translateY(${labelLifted ? -selLabelLift : 0}px)`,
									transition: "transform 260ms ease-out",
								}}
							>
								<VillaLabel
									villa={selectedVilla}
									fontSize={labelFontSize * 1.1}
									theme="light"
									leaderPx={32 * vbPerScreenPx}
									leaderWidth={vbPerScreenPx}
								/>
							</g>
						) : null}
					</svg>
				</div>
			</div>

			{hoverCard && hovered ? (
				<VillaHoverCard villa={hovered} mapMode={mapMode} style={{left: pos.left, top: pos.top}} />
			) : null}

			{/* Zoom tools (top-right) */}
			<div
				className={cn(
					"wwc:absolute wwc:right-3 wwc:top-3 wwc:z-10 wwc:flex wwc:flex-col wwc:gap-1 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card/95 wwc:p-1 wwc:shadow-lg wwc:backdrop-blur-sm wwc:transition-opacity wwc:duration-500",
					chromeHidden && "wwc:pointer-events-none wwc:opacity-0",
				)}
			>
				<HoverTooltip content="Zoom in" side="left">
					<Button
						icon
						size="sm"
						variant="ghost"
						aria-label="Zoom in"
						onClick={() => centerZoom(ZOOM_STEP)}
						disabled={view.zoom >= MAX_ZOOM}
					>
						<Plus className="wwc:size-4" />
					</Button>
				</HoverTooltip>
				<HoverTooltip content="Zoom out" side="left">
					<Button
						icon
						size="sm"
						variant="ghost"
						aria-label="Zoom out"
						onClick={() => centerZoom(1 / ZOOM_STEP)}
						disabled={view.zoom <= MIN_ZOOM}
					>
						<Minus className="wwc:size-4" />
					</Button>
				</HoverTooltip>
				<HoverTooltip content="Fit to screen" side="left">
					<Button
						icon
						size="sm"
						variant="ghost"
						aria-label="Fit to screen"
						onClick={resetView}
						disabled={view.zoom === 1 && view.x === 0 && view.y === 0}
					>
						<Scan className="wwc:size-4" />
					</Button>
				</HoverTooltip>
			</div>

			{/* Loading spinner (centre) — shown during the refresh transition while the fresh view loads. */}
			{refreshTx.showSpinner && (
				<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:z-20 wwc:flex wwc:items-center wwc:justify-center">
					<span className="wwc:flex wwc:size-12 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-card/90 wwc:shadow-lg wwc:backdrop-blur-sm">
						<Spinner className="wwc:size-6 wwc:text-primary" />
					</span>
				</div>
			)}

			{/* Bottom-right cluster — the refresh button. */}
			<div
				className={cn(
					"wwc:absolute wwc:bottom-3 wwc:right-3 wwc:z-10 wwc:flex wwc:items-end wwc:gap-2 wwc:transition-opacity wwc:duration-500",
					chromeHidden && "wwc:pointer-events-none wwc:opacity-0",
				)}
			>
				{onRefresh ? (
					<HoverTooltip content={refreshedAt != null ? sinceLabel(refreshedAt) : refreshLabel} side="top">
						<Button
							icon
							size="sm"
							variant="ghost"
							aria-label="Refresh"
							onClick={() => {
								setRefreshedAt(Date.now());
								// Run the transition; apply (the real refetch) fires at the zoomed-out midpoint.
								refreshTx.run(() => onRefresh?.());
							}}
							className="wwc:size-[38px] wwc:shrink-0 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card/95 wwc:shadow-lg wwc:backdrop-blur-sm wwc:hover:bg-accent"
						>
							<RefreshCw className="wwc:size-4" />
						</Button>
					</HoverTooltip>
				) : null}
			</div>
		</div>
	);
}
