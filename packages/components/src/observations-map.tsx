import {cn} from "@corensystem/coren-utils";
import {RotateCcw} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as React from "react";

import {FLOAT_SHADOW} from "./float-shadow";
import {MAPBOX_TOKEN} from "./mapbox-token";
import {TimeScrubber, type TimeScrubberProps} from "./time-scrubber";

const BLUEPRINT_SOURCE_ID = "observations-blueprint";
const BLUEPRINT_LAYER_ID = "observations-blueprint-raster";
const FOOTPRINT_SOURCE_ID = "observations-blueprint-footprint";
const FOOTPRINT_FILL_ID = "observations-blueprint-footprint-fill";
const FOOTPRINT_LINE_ID = "observations-blueprint-footprint-line";
const ZONES_SOURCE_ID = "observations-zones";
const ZONES_FILL_ID = "observations-zones-fill";
const ZONES_LABEL_ID = "observations-zones-label";
const ZONES_SELECTED_ID = "observations-zones-selected";
const COVERAGE_SOURCE_ID = "observations-coverage";
const COVERAGE_FILL_ID = "observations-coverage-fill";
const COVERAGE_LINE_ID = "observations-coverage-line";
const TRACK_SOURCE_ID = "observations-track";
const TRACK_CORRIDOR_ID = "observations-track-corridor";
const TRACK_LINE_ID = "observations-track-line";
const TRACK_DISC_SOURCE_ID = "observations-track-disc";
const TRACK_DISC_FILL_ID = "observations-track-disc-fill";
const TRACK_DISC_LINE_ID = "observations-track-disc-line";
/**
 * Emphasis while a zone selection is live: the selected zone is lifted and everything else fades back.
 * The fade is deliberately strong — the point is that the selection stands alone — but stops short of
 * zero so the surrounding geometry is still faintly readable.
 */
const ZONE_SELECTED_FILL_BOOST = 2;
const ZONE_SELECTED_FILL_MAX = 0.6;
const ZONE_UNSELECTED_FILL_DIM = 0.25;
const ZONE_UNSELECTED_LABEL_DIM = 0.2;
/** Fade duration in ms, so selecting reads as a fade rather than a snap. */
const ZONE_FADE_MS = 350;

/** A `[longitude, latitude]` pair, in the order Mapbox expects. */
export type LngLat = [number, number];

/**
 * The four georeferenced corners of a blueprint, in Mapbox image-source order:
 * `[top-left, top-right, bottom-right, bottom-left]` — i.e. clockwise from the
 * north-west corner. Mapbox is strict about this order; a rotated array renders
 * the plan flipped or sheared.
 */
export type BlueprintCorners = [LngLat, LngLat, LngLat, LngLat];

/**
 * Corners of the default site blueprint (Eastern Province, KSA), already
 * normalized into Mapbox order: NW, NE, SE, SW.
 */
const DEFAULT_BLUEPRINT_CORNERS: BlueprintCorners = [
	[49.592229, 26.883951], // top-left / NW
	[49.805313, 26.885901], // top-right / NE
	[49.8069796, 26.7313363], // bottom-right / SE
	[49.5941116, 26.729402], // bottom-left / SW
];

export interface MapZone {
	/** Stable identity — passed back on select. */
	id: string | number;
	/** Label drawn at the zone's centre. Omit to render the polygon unlabelled. */
	name?: string;
	/**
	 * Ring of `[longitude, latitude]` points. The ring may repeat its first point at the end, and may
	 * carry consecutive duplicates — both are tolerated and cleaned up before drawing.
	 */
	coordinates: LngLat[];
	/** Fill and outline colour, any CSS colour. Default `#f97316`. */
	color?: string;
	/** Draw the heavier outline used for restricted areas. Default false. */
	restricted?: boolean;
}

export interface Observation {
	/** Stable identity — used as the React key and passed back on select. */
	id: string;
	/** Where the observation sits, as `[longitude, latitude]`. */
	coordinates: LngLat;
	/** Popup title. Omit to render a marker with no popup. */
	label?: string;
	/** Secondary popup line, e.g. the trade or the reporter. */
	description?: string;
	/** Marker fill. Default `#f97316` (Core orange). */
	color?: string;
}

/**
 * Filled hazard mark, built from lucide's `triangle-alert` outline. Lucide ships outline-only, so the
 * solid variant is authored here: the body takes the glyph fill (white) and the exclamation is knocked
 * back out in `currentColor`, which {@link badgeElement} sets to the badge's own colour.
 *
 * Markers are plain DOM — mounting a React root per pin would cost hundreds of roots on a busy day —
 * so glyphs ship as markup rather than components.
 */
const HAZARD_ICON =
	'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' +
	'<rect x="11" y="9" width="2" height="5.4" rx="1" fill="currentColor"/>' +
	'<circle cx="12" cy="17.4" r="1.15" fill="currentColor"/>';

/**
 * Filled video camera, built from lucide's `video` outline — a body and a lens barrel that both close
 * cleanly, with the lens knocked out in `currentColor`. Reads as a live feed rather than a stills
 * camera, which is what these actually are.
 */
const CAMERA_ICON =
	'<rect x="2" y="6" width="14" height="12" rx="2.5"/>' +
	'<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5z"/>' +
	'<circle cx="9" cy="12" r="2.6" fill="currentColor"/>';

/**
 * Filled guard mark, built from lucide's `shield-user`: a shield body that fills, with the head and
 * shoulders knocked back out in `currentColor`.
 */
const RESPONDER_ICON =
	'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>' +
	'<circle cx="12" cy="10.2" r="2.9" fill="currentColor"/>' +
	'<path d="M6.9 18.5a5.6 5.6 0 0 1 10.2 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>';

export {HAZARD_ICON, CAMERA_ICON, RESPONDER_ICON};

export interface MapResponder {
	/** Stable identity — passed back on select. */
	id: string | number;
	/** Where the responder is, as `[longitude, latitude]`. */
	coordinates: LngLat;
	/** Responder name, used for the marker tooltip. */
	name?: string;
	/** Marks them as on shift; offline responders draw at reduced strength. */
	online?: boolean;
	/** Badge body colour. Default `#2f6b63` — distinct from cameras and from every status. */
	color?: string;
}

export interface MapCamera {
	/** Stable identity — passed back on select. */
	id: string | number;
	/** Where the camera sits, as `[longitude, latitude]`. */
	coordinates: LngLat;
	/** Camera name, used for the tooltip and popup title. */
	name?: string;
	/**
	 * Violations attributed to this camera. Rendered as an always-on count badge, the way an alert icon
	 * carries its notification number — one camera commonly accounts for many violations.
	 */
	violations?: number;
	/** Badge body colour. Default `#3d4a5c` — a muted slate-blue that sits back rather than competing with the violations. */
	color?: string;
}

export interface ObservationsMapProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * URL of the blueprint image to drape over the map. Until one is supplied the
	 * component draws the footprint outline from `corners` so the placement is
	 * still verifiable.
	 */
	blueprintUrl?: string;
	/** Georeferenced corners of the blueprint. Default: the built-in site corners. */
	corners?: BlueprintCorners;
	/** Blueprint opacity, 0–1. Default `0.85`. */
	blueprintOpacity?: number;
	/** Toggle the blueprint (and its footprint) without tearing the map down. Default `true`. */
	showBlueprint?: boolean;
	/** Zone polygons drawn over the blueprint, each in its own colour. */
	zones?: MapZone[];
	/** Toggle the zone polygons without tearing the map down. Default `true`. */
	showZones?: boolean;
	/** Zone fill opacity, 0–1. Default `0.3`. */
	zoneOpacity?: number;
	/** Draw each zone's `name` at its centre. Default `true`. */
	showZoneLabels?: boolean;
	/**
	 * How zones are coloured. `payload` uses each zone's own `color`; `neutral` replaces them with a
	 * quiet grey ramp, so the only meaningful colour on the map is the observation status. Default
	 * `payload`.
	 */
	zoneColorMode?: "payload" | "neutral";
	/** Fires when a zone polygon is clicked. */
	onZoneSelect?: (zone: MapZone) => void;
	/**
	 * Zones to treat as selected: the map flies to fit them, and they get a marching-ants outline so the
	 * selection is legible even when every other zone is still drawn for context. Empty or omitted
	 * leaves the view alone.
	 */
	selectedZoneIds?: (string | number)[];
	/** Pixel padding used when flying to the selection. Default `80`. */
	selectionPadding?: number;
	/**
	 * Show a control that returns the camera to the view the map opened on, appearing only once the
	 * view has actually moved. Default `true`.
	 */
	showResetView?: boolean;
	/** Label on the reset control. Default "Reset view". */
	resetViewLabel?: string;
	/**
	 * Width of the reset control in px, matched to a collapsed `MapControlPanel` so the row of floating
	 * controls reads as one set of modules. Default `160`.
	 */
	resetViewWidth?: number;
	/** Observations to pin on top of the blueprint. */
	observations?: Observation[];
	/** Fires when a marker is clicked. */
	onObservationSelect?: (observation: Observation) => void;
	/**
	 * Inner SVG markup for the glyph inside each observation marker, drawn on a 24x24 viewBox. Paths
	 * inherit a white fill; use `currentColor` for detail that should read as knocked out of the badge.
	 * Defaults to a filled hazard mark — the sign for a safety violation.
	 */
	observationIcon?: string;
	/** Marker badge size in px. Default `20`. */
	observationMarkerSize?: number;
	/** Cameras pinned on the map, each showing its violation count. */
	cameras?: MapCamera[];
	/** Toggle the camera markers. Default `true`. */
	showCameras?: boolean;
	/** Fires when a camera marker is clicked. */
	onCameraSelect?: (camera: MapCamera) => void;
	/** Inner SVG markup for the camera glyph, same contract as `observationIcon`. Defaults to a filled camera. */
	cameraIcon?: string;
	/** Camera badge size in px. Default `20`, matching an observation — shape, not size, distinguishes them. */
	cameraMarkerSize?: number;
	/** Safety responders pinned on the map. */
	responders?: MapResponder[];
	/** Toggle the responder markers. Default `true`. */
	showResponders?: boolean;
	/** Fires when a responder marker is clicked. */
	onResponderSelect?: (responder: MapResponder) => void;
	/** Inner SVG markup for the responder glyph. Defaults to a filled guard mark. */
	responderIcon?: string;
	/** Responder badge size in px. Default `20`, matching the others. */
	responderMarkerSize?: number;
	/**
	 * A coverage radius drawn around a point — the area a selected responder covers. Given in metres, so
	 * it stays true on the ground as the map zooms.
	 */
	coverage?: {center: LngLat; radiusMeters: number; color?: string};
	/**
	 * A responder's path through the selected window, as one segment per unbroken run of contact. Drawn
	 * as a thin line wrapped in a corridor of `radiusMeters` — the ground they could reach along it. A
	 * moving responder has no single coverage circle, so the corridor is the honest answer.
	 *
	 * Segments rather than one path because contact drops: joining the last point before a gap to the
	 * first point after it would draw a walk that may never have happened, and would claim coverage over
	 * ground nobody was on. A gap is drawn as a gap.
	 */
	track?: {segments: LngLat[][]; radiusMeters?: number; color?: string};
	/**
	 * Ids to keep at full strength — everything else on the map fades back. Use it to focus a selection:
	 * pass the selected observation, or a camera together with the violations it caught. Empty or
	 * omitted dims nothing.
	 */
	focusedIds?: (string | number)[];
	/** Opacity applied to everything outside `focusedIds`. Default `0.2`. */
	dimOpacity?: number;
	/**
	 * Card shown while a marker is hovered. The widget tracks what is under the cursor and places the
	 * card above it; the caller only supplies its content, so each kind of marker can say something
	 * different. Return null to show nothing for that kind.
	 */
	renderHoverCard?: (hovered: {kind: "observation" | "camera" | "responder"; id: string | number}) => React.ReactNode;
	/**
	 * Fires when the map itself is clicked rather than a marker — the "clicked outside" signal for a
	 * floating panel. Marker clicks never reach the canvas, so they do not trigger it.
	 */
	onBackgroundClick?: () => void;
	/**
	 * Fires as the camera moves, with the values needed to restore this exact view: `center`, `zoom`,
	 * `bearing` (right-drag rotates) and `pitch` (right-drag up/down tilts). Feed them back as
	 * `center` / `zoom` / `bearing` / `pitch` to open on a chosen framing.
	 */
	onViewChange?: (view: {center: [number, number]; zoom: number; bearing: number; pitch: number}) => void;
	/** Initial bearing in degrees. Default `0`. */
	bearing?: number;
	/** Initial pitch in degrees, 0–85. Default `0`. */
	pitch?: number;
	/**
	 * What to frame on first load, ignoring `center` / `zoom`. `"zones"` is usually what you want when
	 * zones cover a small part of a large site — the blueprint footprint here is ~21km across while its
	 * zones sit inside ~2km of it, so framing the footprint renders them near-invisible. Falls back to
	 * the blueprint when there are no zones. Default `"blueprint"`.
	 */
	fitTo?: "blueprint" | "zones" | "none";
	/** Pixel padding used when fitting to the blueprint. Default `40`. */
	fitPadding?: number;
	/** Initial center, used only when `fitToBlueprint` is false. */
	center?: LngLat;
	/** Initial zoom, used only when `fitToBlueprint` is false. */
	zoom?: number;
	/** Mapbox style URL. Default satellite streets — a site plan reads best over imagery. */
	mapStyle?: string;
	/**
	 * Fill the parent's height instead of the default 500px. The parent must be height-constrained
	 * (e.g. a `h-dvh` flex column) — `height: 100%` of an auto-height parent collapses to nothing.
	 */
	fullHeight?: boolean;
	/**
	 * Floating content in the bottom-right corner — typically a `MapLegend`. It sits above the timeline
	 * by default; set `legendInline` once the timeline is collapsed and narrow enough to share the row.
	 */
	legend?: React.ReactNode;
	/** Place the legend on the timeline's own row rather than above it. Default false. */
	legendInline?: boolean;
	/**
	 * Floating content pinned to the map's top-left corner — typically a `MapControlPanel`. The widget
	 * owns only the placement; the controls stay in the caller's hands.
	 */
	controls?: React.ReactNode;
	/**
	 * Floating content pinned to the map's top-right corner — typically an `ObservationDetailPanel`
	 * for whichever observation is selected. Sized by the content, so give it a fixed width.
	 */
	detail?: React.ReactNode;
	/**
	 * Float a {@link TimeScrubber} along the bottom of the map. Pass the scrubber's own props — the
	 * widget only owns the placement, so the timeline behaves exactly as it does elsewhere. Filtering
	 * `observations` by the cursor time is the caller's job; the map just renders what it is handed.
	 */
	timeline?: TimeScrubberProps;
	style?: React.CSSProperties;
}

function boundsOf(corners: BlueprintCorners) {
	return corners.reduce((bounds, corner) => bounds.extend(corner), new mapboxgl.LngLatBounds(corners[0], corners[0]));
}

/**
 * Turn a raw ring into one GeoJSON is willing to draw: drop consecutive duplicate points (the spaces
 * API repeats the closing point two or three times on some zones), then close the ring explicitly.
 * Returns null for anything that can't form a triangle.
 */
/** Mapbox filter matching only the selected zones; `false` when nothing is selected. */
function selectionFilter(ids: (string | number)[] | undefined): mapboxgl.FilterSpecification {
	if (!ids || ids.length === 0) return ["==", ["literal", 1], ["literal", 0]];
	return ["in", ["get", "zoneId"], ["literal", ids.map(String)]];
}

/**
 * The marching-ants dash cycle. A dash array cannot be interpolated, so the motion comes from stepping
 * through pre-computed patterns — and it has to be the *full* fourteen-step cycle: the first seven
 * only slide the dash halfway, so stopping there snaps back to the start and reads as a stutter rather
 * than travel. Step fourteen lands exactly where step one begins, so the loop is seamless.
 */
const ANT_DASHES: number[][] = [
	[0, 4, 3],
	[0.5, 4, 2.5],
	[1, 4, 2],
	[1.5, 4, 1.5],
	[2, 4, 1],
	[2.5, 4, 0.5],
	[3, 4, 0],
	[0, 0.5, 3, 3.5],
	[0, 1, 3, 3],
	[0, 1.5, 3, 2.5],
	[0, 2, 3, 2],
	[0, 2.5, 3, 1.5],
	[0, 3, 3, 1],
	[0, 3.5, 3, 0.5],
];

/**
 * A circle of `radiusMeters` around `center`, as a polygon. Longitude degrees shrink with latitude, so
 * the x radius is divided by cos(lat) — skip that and the circle reads as an ellipse away from the
 * equator.
 */
/**
 * Ground metres per screen pixel at a given zoom and latitude. Mapbox GL tiles are 512px, so the
 * constant is the equator's circumference over 512 — not the 256px figure quoted in most Web Mercator
 * references, which yields double the true scale and a corridor half the width it should be.
 */
function metresPerPixel(latitude: number, zoom: number) {
	return (78271.516964 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;
}

function circlePolygon(center: LngLat, radiusMeters: number, steps = 72): GeoJSON.Feature<GeoJSON.Polygon> {
	const [lng, lat] = center;
	const dLat = radiusMeters / 110574;
	const dLng = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
	const ring: [number, number][] = [];
	for (let i = 0; i <= steps; i++) {
		const angle = (i / steps) * Math.PI * 2;
		ring.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]);
	}
	return {type: "Feature", properties: {}, geometry: {type: "Polygon", coordinates: [ring]}};
}

function zonesBounds(zones: MapZone[]) {
	let bounds: mapboxgl.LngLatBounds | null = null;
	for (const zone of zones) {
		for (const point of zone.coordinates) {
			bounds = bounds ? bounds.extend(point) : new mapboxgl.LngLatBounds(point, point);
		}
	}
	return bounds;
}

function cleanRing(points: LngLat[]): LngLat[] | null {
	const ring: LngLat[] = [];
	for (const point of points) {
		const last = ring[ring.length - 1];
		if (!last || last[0] !== point[0] || last[1] !== point[1]) ring.push(point);
	}
	// A closed ring's repeated last point is not a distinct vertex.
	const first = ring[0];
	const last = ring[ring.length - 1];
	if (ring.length > 1 && first[0] === last[0] && first[1] === last[1]) ring.pop();
	if (ring.length < 3) return null;
	return [...ring, ring[0]];
}

/**
 * Neutral ramp for `zoneColorMode: "neutral"`. Several tones rather than one grey: 90 zones overlap
 * heavily, and a single fill would merge them into one shape. These stay quiet enough that the status
 * colours on the markers remain the only thing on the map that means something.
 */
const NEUTRAL_ZONE_COLORS = ["#64748b", "#94a3b8", "#78716c", "#a8a29e", "#71717a", "#8b8b8b"];

function zonesData(zones: MapZone[], neutral: boolean): GeoJSON.FeatureCollection<GeoJSON.Polygon> {
	const features: GeoJSON.Feature<GeoJSON.Polygon>[] = [];
	for (const [index, zone] of zones.entries()) {
		const ring = cleanRing(zone.coordinates);
		if (!ring) continue;
		const color = neutral ? NEUTRAL_ZONE_COLORS[index % NEUTRAL_ZONE_COLORS.length] : (zone.color ?? "#f97316");
		features.push({
			type: "Feature",
			id: typeof zone.id === "number" ? zone.id : undefined,
			properties: {
				zoneId: String(zone.id),
				name: zone.name ?? "",
				color,
				restricted: zone.restricted === true,
			},
			geometry: {type: "Polygon", coordinates: [ring]},
		});
	}
	return {type: "FeatureCollection", features};
}

/**
 * The shared marker chrome: a rounded-square badge with a light ring, a soft shadow and a centred
 * glyph. Plain DOM on purpose — a busy day puts hundreds of these on the map, and a React root each
 * would be untenable.
 */
function badgeElement(size: number, color: string, icon: string, round = false) {
	const element = document.createElement("div");
	// Ring scales with the badge, floored so it stays visible on a small marker.
	const ring = Math.max(1.5, Math.round(size * 0.06 * 2) / 2);
	// No `position` here: mapbox-gl.css positions `.mapboxgl-marker` absolutely, and an inline
	// `position:relative` would override it and drop every marker into normal document flow. The
	// count badge below anchors against that mapbox-owned positioning instead.
	element.style.cssText = [
		`width:${size}px`,
		`height:${size}px`,
		`border-radius:${round ? "50%" : `${Math.round(size * 0.3)}px`}`,
		`background:${color}`,
		`border:${ring}px solid rgba(255,255,255,0.92)`,
		"box-shadow:0 1px 4px rgba(0,0,0,0.35)",
		"display:flex",
		"align-items:center",
		"justify-content:center",
		"cursor:pointer",
		"box-sizing:border-box",
		// Knockouts inside the glyph read as holes: `currentColor` resolves to the badge body.
		`color:${color}`,
	].join(";");
	const glyph = Math.round(size * 0.58);
	element.innerHTML =
		`<svg xmlns="http://www.w3.org/2000/svg" width="${glyph}" height="${glyph}" viewBox="0 0 24 24" ` +
		`fill="#fff" stroke="none" aria-hidden="true">${icon}</svg>`;
	return element;
}

/**
 * Notification-style count, pinned to the badge's top-right corner and always visible. Neutral rather
 * than alarm-coloured: the number says how many, not how bad — severity is the observation markers'
 * job. A single digit gets a true circle; longer counts widen into a pill.
 */
function countBadge(count: number, size: number) {
	const badge = document.createElement("span");
	const text = count > 99 ? "99+" : String(count);
	badge.textContent = text;
	const single = text.length === 1;
	// Everything scales off the badge it sits on — a fixed 16px chip swamps a 20px marker.
	const box = Math.max(10, Math.round(size * 0.55));
	const font = Math.max(8, Math.round(size * 0.42));
	const offset = Math.round(size * 0.22);
	const ring = Math.max(1, Math.round(size * 0.06 * 2) / 2);
	badge.style.cssText = [
		"position:absolute",
		`top:-${offset}px`,
		`right:-${offset}px`,
		`height:${box}px`,
		single ? `width:${box}px` : `min-width:${box}px`,
		single ? "padding:0" : `padding:0 ${Math.round(box * 0.28)}px`,
		"border-radius:999px",
		"background:#f8fafc",
		"color:#0f172a",
		`font:600 ${font}px/${box}px ui-sans-serif,system-ui,sans-serif`,
		"text-align:center",
		`border:${ring}px solid rgba(15,23,42,0.25)`,
		"box-sizing:content-box",
		"pointer-events:none",
	].join(";");
	return badge;
}

function footprintData(corners: BlueprintCorners): GeoJSON.Feature<GeoJSON.Polygon> {
	return {
		type: "Feature",
		properties: {},
		geometry: {type: "Polygon", coordinates: [[...corners, corners[0]]]},
	};
}

/**
 * Mapbox map that drapes a georeferenced blueprint over the basemap and pins observations on top of
 * it. The blueprint is an image source anchored by its four corners, so it stays locked to the ground
 * as the map pans and zooms. Pass `blueprintUrl` once the plan image exists; until then the component
 * renders the footprint outline so the corner coordinates can be checked against the basemap.
 */
const ObservationsMap = React.forwardRef<HTMLDivElement, ObservationsMapProps>(
	(
		{
			className,
			blueprintUrl,
			corners = DEFAULT_BLUEPRINT_CORNERS,
			blueprintOpacity = 0.85,
			showBlueprint = true,
			zones = [],
			showZones = true,
			zoneOpacity = 0.3,
			showZoneLabels = true,
			zoneColorMode = "payload",
			onZoneSelect,
			selectedZoneIds,
			selectionPadding = 80,
			showResetView = true,
			resetViewLabel = "Reset view",
			resetViewWidth = 160,
			observations = [],
			onObservationSelect,
			observationIcon = HAZARD_ICON,
			observationMarkerSize = 20,
			cameras = [],
			showCameras = true,
			onCameraSelect,
			cameraIcon = CAMERA_ICON,
			cameraMarkerSize = 20,
			responders = [],
			showResponders = true,
			onResponderSelect,
			responderIcon = RESPONDER_ICON,
			responderMarkerSize = 20,
			coverage,
			track,
			focusedIds,
			dimOpacity = 0.2,
			renderHoverCard,
			onBackgroundClick,
			onViewChange,
			bearing = 0,
			pitch = 0,
			fitTo = "blueprint",
			fitPadding = 40,
			center,
			zoom = 13,
			mapStyle = "mapbox://styles/mapbox/satellite-streets-v12",
			fullHeight = false,
			controls,
			legend,
			legendInline = false,
			detail,
			timeline,
			style,
			...props
		},
		ref,
	) => {
		const rootRef = React.useRef<HTMLDivElement>(null);
		const containerRef = React.useRef<HTMLDivElement>(null);
		const mapRef = React.useRef<mapboxgl.Map | null>(null);
		const markersRef = React.useRef<{id: string | number; marker: mapboxgl.Marker}[]>([]);
		const cameraMarkersRef = React.useRef<{id: string | number; marker: mapboxgl.Marker}[]>([]);
		const responderMarkersRef = React.useRef<{id: string | number; marker: mapboxgl.Marker; at: LngLat}[]>([]);
		// The view the map opened on — where a cleared selection flies back to.
		const homeViewRef = React.useRef<{center: mapboxgl.LngLat; zoom: number; bearing: number; pitch: number} | null>(
			null,
		);
		// Selection size on the previous render, so "cleared" can be told apart from "never had one".
		const hadSelectionRef = React.useRef(false);
		// What the cursor is over, and where on screen to put its card.
		const [hovered, setHovered] = React.useState<{
			kind: "observation" | "camera" | "responder";
			id: string | number;
			x: number;
			y: number;
		} | null>(null);

		// Whether the camera has left the view it opened on — drives the reset control.
		const [viewMoved, setViewMoved] = React.useState(false);

		// Latest props, so the map callbacks below never close over a stale render.
		const latest = React.useRef({
			blueprintUrl,
			corners,
			blueprintOpacity,
			showBlueprint,
			zones,
			showZones,
			zoneOpacity,
			showZoneLabels,
			zoneColorMode,
			onZoneSelect,
			selectedZoneIds,
			focusedIds,
			dimOpacity,
			onBackgroundClick,
			onViewChange,
			responderMarkerSize,
			coverage,
			track,
		});
		latest.current = {
			blueprintUrl,
			corners,
			blueprintOpacity,
			showBlueprint,
			zones,
			showZones,
			zoneOpacity,
			showZoneLabels,
			zoneColorMode,
			onZoneSelect,
			selectedZoneIds,
			focusedIds,
			dimOpacity,
			onBackgroundClick,
			onViewChange,
			responderMarkerSize,
			coverage,
			track,
		};

		React.useImperativeHandle(ref, () => rootRef.current!);

		/**
		 * Fade everything outside `focusedIds` — markers via their own element opacity, layers via their
		 * paint properties. Applied after every marker/layer rebuild as well as on focus changes, since
		 * a rebuild produces fresh elements that know nothing about the current selection.
		 */
		const applyFocus = React.useCallback(() => {
			const {focusedIds: focus, dimOpacity: dim, zoneOpacity: zoneFill, blueprintOpacity: bp} = latest.current;
			const focused = focus && focus.length > 0 ? new Set(focus.map(String)) : null;
			const factor = focused ? dim : 1;

			for (const {id, marker} of [...markersRef.current, ...cameraMarkersRef.current, ...responderMarkersRef.current]) {
				const lit = !focused || focused.has(String(id));
				const element = marker.getElement();
				// Fade with `filter`, not `opacity`: mapbox-gl writes `style.opacity` on every render frame
				// for terrain occlusion, so anything set there is clobbered within a frame.
				element.style.filter = lit ? "" : `opacity(${dim})`;
				// A faded marker should not intercept clicks meant for what is still in focus.
				element.style.pointerEvents = lit ? "" : "none";
			}

			const map = mapRef.current;
			// No isStyleLoaded() guard here: with a live style it stays false for long stretches while tiles
			// load, which silently skipped every layer update below. Each setPaintProperty is already
			// guarded by its own getLayer check, which is the condition that actually matters.
			if (!map) return;

			// With a zone selection live, the unselected zones fade back so the chosen ones carry the view.
			// Data-driven rather than a whole-layer opacity, since it has to differ per feature.
			const selected = latest.current.selectedZoneIds;
			const hasSelection = selected != null && selected.length > 0;
			const zoneDim = (lit: number, dim: number) =>
				hasSelection ? (["case", selectionFilter(selected), lit, lit * dim] as unknown as number) : lit;

			if (map.getLayer(ZONES_FILL_ID)) {
				const lit = zoneFill * factor;
				map.setPaintProperty(ZONES_FILL_ID, "fill-opacity-transition", {duration: ZONE_FADE_MS, delay: 0});
				map.setPaintProperty(
					ZONES_FILL_ID,
					"fill-opacity",
					hasSelection
						? ([
								"case",
								selectionFilter(selected),
								Math.min(lit * ZONE_SELECTED_FILL_BOOST, ZONE_SELECTED_FILL_MAX),
								lit * ZONE_UNSELECTED_FILL_DIM,
							] as unknown as number)
						: lit,
				);
			}
			if (map.getLayer(ZONES_LABEL_ID)) {
				map.setPaintProperty(ZONES_LABEL_ID, "text-opacity-transition", {duration: ZONE_FADE_MS, delay: 0});
				map.setPaintProperty(ZONES_LABEL_ID, "text-opacity", zoneDim(factor, ZONE_UNSELECTED_LABEL_DIM));
			}
			if (map.getLayer(BLUEPRINT_LAYER_ID)) map.setPaintProperty(BLUEPRINT_LAYER_ID, "raster-opacity", bp * factor);
			if (map.getLayer(FOOTPRINT_FILL_ID)) map.setPaintProperty(FOOTPRINT_FILL_ID, "fill-opacity", 0.12 * factor);
			if (map.getLayer(FOOTPRINT_LINE_ID)) map.setPaintProperty(FOOTPRINT_LINE_ID, "line-opacity", factor);
		}, []);

		React.useEffect(() => {
			applyFocus();
		}, [focusedIds, dimOpacity, applyFocus]);

		/**
		 * Cameras and responders are both posted to places rather than events, so they routinely share a
		 * coordinate — and one badge then sits exactly on the other, leaving the lower one unclickable.
		 * Nudge the responder clear when that happens.
		 *
		 * The test is in pixels, not degrees: badges are a fixed pixel size, so a geographic offset that
		 * separates them at site zoom leaves them overlapping when zoomed out. Re-run on zoom for the
		 * same reason.
		 */
		/**
		 * The corridor is a stroked line, so its width is in pixels — recomputed from metres at the
		 * current zoom and latitude, and re-applied on zoom so the ground it covers stays constant.
		 */
		const corridorWidth = React.useCallback(() => {
			const map = mapRef.current;
			const spread = latest.current.track;
			if (!map || !spread) return 0;
			const radius = spread.radiusMeters ?? 0;
			return (radius * 2) / metresPerPixel(map.getCenter().lat, map.getZoom());
		}, []);

		React.useEffect(() => {
			const map = mapRef.current;
			if (!map) return;
			const resize = () => {
				if (map.getLayer(TRACK_CORRIDOR_ID)) map.setPaintProperty(TRACK_CORRIDOR_ID, "line-width", corridorWidth());
			};
			resize();
			map.on("zoom", resize);
			return () => {
				map.off("zoom", resize);
			};
		}, [corridorWidth, track]);

		/**
		 * Wire hover on a marker. The point is taken once, in the map root's own coordinates — the card is
		 * dismissed by leaving the marker, so it never needs to track a moving map.
		 */
		const bindHover = React.useCallback(
			(element: HTMLElement, kind: "observation" | "camera" | "responder", id: string | number) => {
				element.addEventListener("mouseenter", () => {
					const root = rootRef.current;
					if (!root) return;
					const marker = element.getBoundingClientRect();
					const bounds = root.getBoundingClientRect();
					setHovered({
						kind,
						id,
						x: marker.x - bounds.x + marker.width / 2,
						y: marker.y - bounds.y,
					});
				});
				element.addEventListener("mouseleave", () => setHovered(null));
			},
			[],
		);

		const separateResponders = React.useCallback(() => {
			const map = mapRef.current;
			if (!map) return;
			const cameraPoints = cameraMarkersRef.current.map((entry) => map.project(entry.marker.getLngLat()));
			if (cameraPoints.length === 0) {
				for (const entry of responderMarkersRef.current) entry.marker.setLngLat(entry.at);
				return;
			}

			const gap = latest.current.responderMarkerSize + 6;
			// A focused responder is never nudged: its coverage and track are drawn at its true position, so
			// a displaced badge would sit off-centre in its own circle and read as pointing at the camera.
			const focused = latest.current.focusedIds;
			const pinned = focused && focused.length > 0 ? new Set(focused.map(String)) : null;

			for (const entry of responderMarkersRef.current) {
				const point = map.project(entry.at);
				const clashes =
					!pinned?.has(String(entry.id)) && cameraPoints.some((c) => Math.hypot(c.x - point.x, c.y - point.y) < gap);
				entry.marker.setLngLat(clashes ? map.unproject([point.x + gap, point.y - gap * 0.5]) : entry.at);
			}
		}, []);

		React.useEffect(() => {
			separateResponders();
			const map = mapRef.current;
			if (!map) return;
			// The offset is a pixel distance, so it has to be re-laid whenever the projection changes.
			map.on("zoom", separateResponders);
			map.on("rotate", separateResponders);
			map.on("pitch", separateResponders);
			return () => {
				map.off("zoom", separateResponders);
				map.off("rotate", separateResponders);
				map.off("pitch", separateResponders);
			};
		}, [separateResponders]);

		// Fly to the selection whenever it changes, and back to the opening view when it is cleared.
		React.useEffect(() => {
			const map = mapRef.current;
			if (!map) return;
			const selection = selectedZoneIds ?? [];

			if (selection.length === 0) {
				// Only on the transition out of a selection — not on mount, when there never was one.
				if (hadSelectionRef.current && homeViewRef.current) map.easeTo({...homeViewRef.current, duration: 700});
				hadSelectionRef.current = false;
				return;
			}

			hadSelectionRef.current = true;
			const chosen = new Set(selection.map(String));
			const bounds = zonesBounds(zones.filter((z) => chosen.has(String(z.id))));
			if (bounds) map.fitBounds(bounds, {padding: selectionPadding, duration: 700, maxZoom: 17});
		}, [selectedZoneIds, zones, selectionPadding]);

		// Keep the highlight layer's filter in step without rebuilding every zone layer, and re-apply the
		// fade so the unselected zones drop back the moment the selection changes.
		React.useEffect(() => {
			const map = mapRef.current;
			if (map?.getLayer(ZONES_SELECTED_ID)) map.setFilter(ZONES_SELECTED_ID, selectionFilter(selectedZoneIds));
			applyFocus();
		}, [selectedZoneIds, applyFocus]);

		// March the ants. Only runs while something is selected — an idle timer repainting a hidden layer
		// would keep the map busy for nothing.
		React.useEffect(() => {
			if (!selectedZoneIds || selectedZoneIds.length === 0) return;
			let step = 0;
			const timer = setInterval(() => {
				const map = mapRef.current;
				if (!map?.getLayer(ZONES_SELECTED_ID)) return;
				step = (step + 1) % ANT_DASHES.length;
				map.setPaintProperty(ZONES_SELECTED_ID, "line-dasharray", ANT_DASHES[step]);
			}, 55);
			return () => clearInterval(timer);
		}, [selectedZoneIds]);

		/**
		 * Rebuild the blueprint and zone layers from scratch, blueprint first so the zones sit above it.
		 * `setStyle` wipes every custom layer, and an image source cannot swap between "no image" and "an
		 * image", so a teardown/rebuild is the only reliable path — it is cheap, it keeps every state in
		 * one code path, and it is what guarantees the draw order after any of them changes.
		 */
		const applyOverlays = React.useCallback(() => {
			const map = mapRef.current;
			if (!map) return;
			// `style.load` fires before the style reports itself loaded, and addLayer throws until it is.
			// Bailing here is what dropped every overlay on a basemap change — retry once the map settles.
			if (!map.isStyleLoaded()) {
				map.once("idle", applyOverlays);
				return;
			}
			const {blueprintUrl: url, corners: pts, blueprintOpacity: opacity, showBlueprint: visible} = latest.current;

			for (const id of [
				TRACK_DISC_LINE_ID,
				TRACK_DISC_FILL_ID,
				TRACK_LINE_ID,
				TRACK_CORRIDOR_ID,
				COVERAGE_LINE_ID,
				COVERAGE_FILL_ID,
				ZONES_SELECTED_ID,
				ZONES_LABEL_ID,
				ZONES_FILL_ID,
			]) {
				if (map.getLayer(id)) map.removeLayer(id);
			}
			if (map.getSource(ZONES_SOURCE_ID)) map.removeSource(ZONES_SOURCE_ID);
			if (map.getSource(COVERAGE_SOURCE_ID)) map.removeSource(COVERAGE_SOURCE_ID);
			if (map.getSource(TRACK_SOURCE_ID)) map.removeSource(TRACK_SOURCE_ID);
			if (map.getSource(TRACK_DISC_SOURCE_ID)) map.removeSource(TRACK_DISC_SOURCE_ID);

			for (const id of [BLUEPRINT_LAYER_ID, FOOTPRINT_FILL_ID, FOOTPRINT_LINE_ID]) {
				if (map.getLayer(id)) map.removeLayer(id);
			}
			for (const id of [BLUEPRINT_SOURCE_ID, FOOTPRINT_SOURCE_ID]) {
				if (map.getSource(id)) map.removeSource(id);
			}

			const visibility = visible ? "visible" : "none";

			if (url) {
				map.addSource(BLUEPRINT_SOURCE_ID, {type: "image", url, coordinates: pts});
				map.addLayer({
					id: BLUEPRINT_LAYER_ID,
					type: "raster",
					source: BLUEPRINT_SOURCE_ID,
					layout: {visibility},
					// No cross-fade: a blueprint should snap into place, not dissolve.
					paint: {"raster-opacity": opacity, "raster-fade-duration": 0},
				});
			} else {
				// No image yet — show the footprint so the corners are still verifiable on the basemap.
				map.addSource(FOOTPRINT_SOURCE_ID, {type: "geojson", data: footprintData(pts)});
				map.addLayer({
					id: FOOTPRINT_FILL_ID,
					type: "fill",
					source: FOOTPRINT_SOURCE_ID,
					layout: {visibility},
					paint: {"fill-color": "#f97316", "fill-opacity": 0.12},
				});
				map.addLayer({
					id: FOOTPRINT_LINE_ID,
					type: "line",
					source: FOOTPRINT_SOURCE_ID,
					layout: {visibility},
					paint: {"line-color": "#f97316", "line-width": 2, "line-dasharray": [3, 2]},
				});
			}

			const {zones: zoneList, showZones: zonesVisible, zoneOpacity: zoneFill, showZoneLabels: labels} = latest.current;
			if (!zoneList.length) return;

			const zoneVisibility = zonesVisible ? "visible" : "none";
			map.addSource(ZONES_SOURCE_ID, {
				type: "geojson",
				data: zonesData(zoneList, latest.current.zoneColorMode === "neutral"),
			});
			map.addLayer({
				id: ZONES_FILL_ID,
				type: "fill",
				source: ZONES_SOURCE_ID,
				layout: {visibility: zoneVisibility},
				// Each zone carries its own colour in the payload, so read it off the feature.
				paint: {"fill-color": ["get", "color"], "fill-opacity": zoneFill},
			});
			map.addLayer({
				id: ZONES_LABEL_ID,
				type: "symbol",
				source: ZONES_SOURCE_ID,
				layout: {
					visibility: labels && zonesVisible ? "visible" : "none",
					"text-field": ["get", "name"],
					"text-size": 11,
					// Zones are long thin corridors; let the label ride the polygon rather than overflow it.
					"text-max-width": 10,
					"symbol-placement": "point",
				},
				paint: {"text-color": "#ffffff", "text-halo-color": "rgba(0,0,0,0.65)", "text-halo-width": 1.4},
			});

			// Marching-ants outline for the current selection. Its own layer so the dash can animate without
			// touching the base zone styling, and it draws last so it sits above every other zone.
			map.addLayer({
				id: ZONES_SELECTED_ID,
				type: "line",
				source: ZONES_SOURCE_ID,
				filter: selectionFilter(latest.current.selectedZoneIds),
				paint: {"line-color": "#ffffff", "line-width": 2.5, "line-dasharray": [0, 4, 3]},
			});

			// Coverage sits above the zones — it describes a person, not the ground.
			const cover = latest.current.coverage;
			if (cover) {
				const tint = cover.color ?? "#2f6b63";
				map.addSource(COVERAGE_SOURCE_ID, {
					type: "geojson",
					data: circlePolygon(cover.center, cover.radiusMeters),
				});
				map.addLayer({
					id: COVERAGE_FILL_ID,
					type: "fill",
					source: COVERAGE_SOURCE_ID,
					paint: {"fill-color": tint, "fill-opacity": 0.15},
				});
				map.addLayer({
					id: COVERAGE_LINE_ID,
					type: "line",
					source: COVERAGE_SOURCE_ID,
					paint: {"line-color": tint, "line-width": 1.5, "line-dasharray": [3, 2]},
				});
			}

			const path = latest.current.track;
			// Each run is deduped; a run where they never moved collapses to one point, and a zero-length
			// line strokes to nothing — so it is nudged into a hair-length segment, which the round cap
			// renders as exactly the disc it should be. One geometry type, no special-cased layers.
			const deduped = (path?.segments ?? [])
				.map((run) => run.filter((p, i, all) => i === 0 || p[0] !== all[i - 1][0] || p[1] !== all[i - 1][1]))
				.filter((run) => run.length > 0);
			// A run where they never moved has no line to stroke. It cannot be faked with a very short
			// segment either — mapbox drops a line below about a metre as too small to tile, and the
			// coverage silently disappears. Those runs are drawn as discs instead.
			const runs = deduped.filter((run) => run.length > 1);
			const stood = deduped.filter((run) => run.length === 1).map((run) => run[0]);

			if (path && stood.length > 0) {
				const tint = path.color ?? "#2f6b63";
				map.addSource(TRACK_DISC_SOURCE_ID, {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: stood.map((point) => circlePolygon(point, path.radiusMeters ?? 0)),
					},
				});
				map.addLayer({
					id: TRACK_DISC_FILL_ID,
					type: "fill",
					source: TRACK_DISC_SOURCE_ID,
					paint: {"fill-color": tint, "fill-opacity": 0.15},
				});
				// The outline is only drawn when a disc is the whole story. Beside a corridor it reads as a
				// separate object rather than the same coverage, so a standing run there is fill alone —
				// exactly what the corridor is.
				if (runs.length === 0) {
					map.addLayer({
						id: TRACK_DISC_LINE_ID,
						type: "line",
						source: TRACK_DISC_SOURCE_ID,
						paint: {"line-color": tint, "line-width": 1.5, "line-dasharray": [3, 2]},
					});
				}
			}

			if (path && runs.length > 0) {
				const tint = path.color ?? "#2f6b63";
				map.addSource(TRACK_SOURCE_ID, {
					type: "geojson",
					data: {type: "Feature", properties: {}, geometry: {type: "MultiLineString", coordinates: runs}},
				});
				// The corridor is the path stroked at twice the radius with round caps and joins — which is
				// exactly the ground within `radiusMeters` of the path, without any buffer geometry.
				map.addLayer({
					id: TRACK_CORRIDOR_ID,
					type: "line",
					source: TRACK_SOURCE_ID,
					layout: {"line-cap": "round", "line-join": "round"},
					paint: {"line-color": tint, "line-opacity": 0.15, "line-width": corridorWidth()},
				});
				map.addLayer({
					id: TRACK_LINE_ID,
					type: "line",
					source: TRACK_SOURCE_ID,
					layout: {"line-cap": "round", "line-join": "round"},
					paint: {"line-color": tint, "line-width": 1.5, "line-dasharray": [2, 2], "line-opacity": 0.9},
				});
			}

			applyFocus();
		}, [applyFocus, corridorWidth]);

		React.useEffect(() => {
			if (!containerRef.current || mapRef.current) return;

			mapboxgl.accessToken = MAPBOX_TOKEN;

			const map = new mapboxgl.Map({
				container: containerRef.current,
				style: mapStyle,
				center: center ?? boundsOf(corners).getCenter(),
				zoom,
				bearing,
				pitch,
			});
			mapRef.current = map;

			if (fitTo !== "none") {
				const target = (fitTo === "zones" && zonesBounds(zones)) || boundsOf(corners);
				map.fitBounds(target, {padding: fitPadding, duration: 0});
			}

			// Captured after the opening fit, so it is the view the user actually starts from.
			homeViewRef.current = {
				center: map.getCenter(),
				zoom: map.getZoom(),
				bearing: map.getBearing(),
				pitch: map.getPitch(),
			};

			const emitView = () =>
				latest.current.onViewChange?.({
					center: [Number(map.getCenter().lng.toFixed(6)), Number(map.getCenter().lat.toFixed(6))],
					zoom: Number(map.getZoom().toFixed(2)),
					bearing: Number(map.getBearing().toFixed(1)),
					pitch: Number(map.getPitch().toFixed(1)),
				});
			map.on("move", emitView);

			// A small tolerance so a nudge does not count as having moved.
			const checkMoved = () => {
				const home = homeViewRef.current;
				if (!home) return;
				const moved =
					map.getCenter().distanceTo(home.center) > 40 ||
					Math.abs(map.getZoom() - home.zoom) > 0.15 ||
					Math.abs(map.getBearing() - home.bearing) > 1 ||
					Math.abs(map.getPitch() - home.pitch) > 1;
				setViewMoved(moved);
			};
			map.on("moveend", checkMoved);
			// The initial fitBounds happens before this listener exists, so publish the opening view once.
			emitView();

			map.on("load", applyOverlays);
			// setStyle drops every custom layer; re-add them once the new style settles.
			map.on("style.load", applyOverlays);

			return () => {
				map.off("move", emitView);
				map.off("moveend", checkMoved);
				for (const entry of markersRef.current) entry.marker.remove();
				markersRef.current = [];
				for (const entry of cameraMarkersRef.current) entry.marker.remove();
				cameraMarkersRef.current = [];
				for (const entry of responderMarkersRef.current) entry.marker.remove();
				responderMarkersRef.current = [];
				map.remove();
				mapRef.current = null;
			};
		}, []);

		React.useEffect(() => {
			mapRef.current?.setStyle(mapStyle);
		}, [mapStyle]);

		React.useEffect(() => {
			applyOverlays();
		}, [blueprintUrl, corners, zones, zoneColorMode, coverage, track, applyOverlays]);

		// Routed through applyFocus so a live opacity change respects any active dim factor.
		React.useEffect(() => {
			applyFocus();
		}, [blueprintOpacity, applyFocus]);

		React.useEffect(() => {
			const map = mapRef.current;
			if (!map) return;
			const visibility = showBlueprint ? "visible" : "none";
			for (const id of [BLUEPRINT_LAYER_ID, FOOTPRINT_FILL_ID, FOOTPRINT_LINE_ID]) {
				if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visibility);
			}
		}, [showBlueprint]);

		React.useEffect(() => {
			applyFocus();
		}, [zoneOpacity, applyFocus]);

		React.useEffect(() => {
			const map = mapRef.current;
			if (!map) return;
			const visibility = showZones ? "visible" : "none";
			for (const id of [ZONES_FILL_ID]) {
				if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visibility);
			}
			if (map.getLayer(ZONES_LABEL_ID)) {
				map.setLayoutProperty(ZONES_LABEL_ID, "visibility", showZoneLabels && showZones ? "visible" : "none");
			}
		}, [showZones, showZoneLabels]);

		React.useEffect(() => {
			const map = mapRef.current;
			if (!map) return;

			// Delegated to the layer rather than per-feature, so it survives every overlay rebuild.
			const onClick = (event: mapboxgl.MapMouseEvent & {features?: GeoJSON.Feature[]}) => {
				// Markers sit inside the canvas container, so a marker click also fires this layer handler
				// for whatever polygon happens to be underneath. Clicking a violation must not select its
				// zone as well — the same guard the background handler needs.
				const target = event.originalEvent?.target as HTMLElement | null;
				if (target?.closest?.(".mapboxgl-marker")) return;
				const id = event.features?.[0]?.properties?.zoneId;
				if (id == null) return;
				const zone = latest.current.zones.find((z) => String(z.id) === id);
				if (zone) latest.current.onZoneSelect?.(zone);
			};
			const enter = () => {
				map.getCanvas().style.cursor = "pointer";
			};
			const leave = () => {
				map.getCanvas().style.cursor = "";
			};

			// Markers live inside mapbox's canvas container, so a marker click bubbles up and fires the map's
			// own click too. Without this guard the background handler clears the selection the marker just
			// made, and nothing ever opens.
			const onBackground = (event: mapboxgl.MapMouseEvent) => {
				const target = event.originalEvent?.target as HTMLElement | null;
				if (target?.closest?.(".mapboxgl-marker")) return;
				latest.current.onBackgroundClick?.();
			};

			map.on("click", onBackground);
			map.on("click", ZONES_FILL_ID, onClick);
			map.on("mouseenter", ZONES_FILL_ID, enter);
			map.on("mouseleave", ZONES_FILL_ID, leave);
			return () => {
				map.off("click", onBackground);
				map.off("click", ZONES_FILL_ID, onClick);
				map.off("mouseenter", ZONES_FILL_ID, enter);
				map.off("mouseleave", ZONES_FILL_ID, leave);
			};
		}, []);

		React.useEffect(() => {
			const map = mapRef.current;
			if (!map) return;

			for (const entry of markersRef.current) entry.marker.remove();

			const size = observationMarkerSize;

			markersRef.current = observations.map((observation) => {
				// A circular badge, not a teardrop pin: the glyph stays upright and readable, and the marker
				// centres on its coordinate instead of pointing at it from above. Round for observations,
				// square for cameras — at the same size, shape is what tells the two apart.
				const element = badgeElement(size, observation.color ?? "#f97316", observationIcon, true);
				if (observation.label) element.title = observation.label;

				// No popup: the detail panel carries the record, and a bubble over the pin would cover the
				// very markers the selection is meant to be read against.
				const marker = new mapboxgl.Marker({element, anchor: "center"}).setLngLat(observation.coordinates);
				element.addEventListener("click", () => onObservationSelect?.(observation));
				bindHover(element, "observation", observation.id);
				return {id: observation.id, marker: marker.addTo(map)};
			});
			applyFocus();
		}, [observations, onObservationSelect, observationIcon, observationMarkerSize, applyFocus, bindHover]);

		React.useEffect(() => {
			const map = mapRef.current;
			if (!map) return;

			for (const entry of cameraMarkersRef.current) entry.marker.remove();
			if (!showCameras) {
				cameraMarkersRef.current = [];
				return;
			}

			cameraMarkersRef.current = cameras.map((camera) => {
				// Deliberately quiet: a camera is context, not a finding. Desaturated and dark, so it stays
				// legible without pulling attention from the status-coloured violations.
				const element = badgeElement(cameraMarkerSize, camera.color ?? "#3d4a5c", cameraIcon);
				const violations = camera.violations ?? 0;
				if (violations > 0) element.appendChild(countBadge(violations, cameraMarkerSize));
				element.title = camera.name
					? `${camera.name} — ${violations} violation${violations === 1 ? "" : "s"}`
					: `${violations} violations`;

				const marker = new mapboxgl.Marker({element, anchor: "center"}).setLngLat(camera.coordinates);
				element.addEventListener("click", () => onCameraSelect?.(camera));
				bindHover(element, "camera", camera.id);
				return {id: camera.id, marker: marker.addTo(map)};
			});
			applyFocus();
			separateResponders();
		}, [cameras, showCameras, onCameraSelect, cameraIcon, cameraMarkerSize, applyFocus, separateResponders, bindHover]);

		React.useEffect(() => {
			const map = mapRef.current;
			if (!map) return;

			for (const entry of responderMarkersRef.current) entry.marker.remove();
			if (!showResponders) {
				responderMarkersRef.current = [];
				return;
			}

			responderMarkersRef.current = responders.map((responder) => {
				// Square like a camera — both are fixed site infrastructure rather than findings — but in a
				// different hue, so the two are told apart by colour and glyph.
				const element = badgeElement(responderMarkerSize, responder.color ?? "#2f6b63", responderIcon);
				// Off shift reads as receded rather than absent; they are still on site.
				if (responder.online === false) element.style.opacity = "0.55";
				if (responder.name) element.title = responder.name;
				const marker = new mapboxgl.Marker({element, anchor: "center"}).setLngLat(responder.coordinates);
				element.addEventListener("click", () => onResponderSelect?.(responder));
				bindHover(element, "responder", responder.id);
				return {id: responder.id, marker: marker.addTo(map), at: responder.coordinates};
			});
			applyFocus();
			separateResponders();
		}, [
			responders,
			showResponders,
			onResponderSelect,
			responderIcon,
			responderMarkerSize,
			applyFocus,
			separateResponders,
			bindHover,
		]);

		return (
			<div
				ref={rootRef}
				className={cn(
					"wwc:relative wwc:w-full wwc:overflow-hidden wwc:rounded-lg",
					// min-h-0 lets the map shrink inside a flex column instead of being pinned to its content.
					fullHeight ? "wwc:h-full wwc:min-h-0" : "wwc:h-[500px]",
					className,
				)}
				style={style}
				{...props}
			>
				{/* The map fills the root rather than being it, so the timeline can float above the canvas.
				    Sized, not positioned: mapbox-gl.css declares `.mapboxgl-map { position: relative }` and loads
				    after the utilities, so an `absolute inset-0` container would be overridden and collapse to 0. */}
				<div ref={containerRef} className="wwc:h-full wwc:w-full" />

				{/* The reset control rides alongside the controls rather than floating on its own, so it sits
				    beside whatever the caller put in the corner without needing to know its width. */}
				{(controls || (showResetView && viewMoved)) && (
					<div
						className={cn(
							"wwc:absolute wwc:left-3 wwc:top-3 wwc:z-20 wwc:flex wwc:items-start wwc:gap-2",
							// Bounded above the timeline and scrolling, so a tall stack of panels runs out of room
							// rather than sliding underneath it.
							"wwc:overflow-y-auto",
							legendInline ? "wwc:bottom-12" : "wwc:bottom-28",
						)}
					>
						{controls}
						{showResetView && viewMoved && (
							<button
								type="button"
								onClick={() => {
									if (homeViewRef.current) mapRef.current?.easeTo({...homeViewRef.current, duration: 700});
								}}
								style={{width: resetViewWidth}}
								// Same padding, radius, surface and inner row height as a collapsed panel header, so the
								// three float as one set rather than three sizes.
								className={`wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1.5 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:px-2.5 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent ${FLOAT_SHADOW}`}
							>
								<span className="wwc:flex wwc:h-6 wwc:items-center wwc:gap-1.5">
									<RotateCcw className="wwc:h-3.5 wwc:w-3.5" />
									{resetViewLabel}
								</span>
							</button>
						)}
					</div>
				)}

				{hovered && renderHoverCard && (
					<div
						className="wwc:pointer-events-none wwc:absolute wwc:z-30 wwc:-translate-x-1/2 wwc:-translate-y-full"
						style={{left: hovered.x, top: hovered.y - 8}}
					>
						{renderHoverCard({kind: hovered.kind, id: hovered.id})}
					</div>
				)}

				{legend && (
					<div
						className={cn(
							"wwc:absolute wwc:right-3 wwc:z-20",
							// A collapsed timeline gives up the right of its row, so the legend can drop into it.
							legendInline ? "wwc:bottom-3" : "wwc:bottom-24",
						)}
					>
						{legend}
					</div>
				)}

				{/* The panel caps its own height, so the wrapper only has to place it. */}
				{detail && <div className="wwc:absolute wwc:right-3 wwc:top-3 wwc:z-20">{detail}</div>}

				{timeline && (
					<div className="wwc:absolute wwc:inset-x-3 wwc:bottom-3 wwc:z-10">
						<TimeScrubber {...timeline} className={cn("wwc:bg-card", timeline.className)} />
					</div>
				)}
			</div>
		);
	},
);
ObservationsMap.displayName = "ObservationsMap";

export {DEFAULT_BLUEPRINT_CORNERS, ObservationsMap};
