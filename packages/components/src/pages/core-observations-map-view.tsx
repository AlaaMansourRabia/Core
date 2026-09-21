// Observations Map View — the map surface of the Safety Manager: every observation of a day placed
// on the site it happened on, alongside the cameras that caught them and the responders who work
// them. Sample data only, like the rest of the pages here; the point is the composition —
// ObservationsMap under a set of floating panels, all of them controlled from this one component.

import {cn} from "@wakecap/core-utils";
import {Eye} from "lucide-react";
import * as React from "react";

import {Badge} from "../badge";
import {CameraDetailPanel} from "../camera-detail-panel";
import type {CommentItem} from "../comment-thread";
import {RNGLF_ZONES} from "../data/rnglf-zones";
import {MapControlPanel} from "../map-control-panel";
import {MapHoverCard} from "../map-hover-card";
import {MapLegend} from "../map-legend";
import {ObservationDetailPanel, type ObservationDetail} from "../observation-detail-panel";
import {CAMERA_ICON, HAZARD_ICON, RESPONDER_ICON, ObservationsMap} from "../observations-map";
import {ResponderDetailPanel, type ResponderDetail} from "../responder-detail-panel";
import type {TimeScrubberActivity} from "../time-scrubber";
import {ViolationList} from "../violation-list";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/**
 * Filter vocabulary, taken from the Safety Manager filter panel. Category is the violation type —
 * what the observation actually is — while Source is the system that raised it.
 */
const SEVERITIES = ["Not Determined", "Low", "Medium", "High", "Emergency"] as const;

const SOURCES = [
	"ConnectedWorker",
	"AVL",
	"CCTV",
	"Manual",
	"QRCode",
	"ClinicViolation",
	"TrainingCenter",
	"DigitalWorkPermit",
	"WeatherStation",
];

const CATEGORIES = [
	"Barriers, Guardrails & Warning Lines",
	"Entering Restricted Area",
	"Head Impact",
	"PPE Compliance Detection",
	"SOS",
	"Workers in Line of Fire of Lifting Operations",
];

/** `null` is the unassigned bucket the panel exposes as "Unassigned". */
const COMPANIES: (string | null)[] = ["DEFAULT PACKAGE", "Aramco", "SRACO", null];
const UNASSIGNED = "__unassigned__";

/** Category drives the severity a violation type tends to carry. */
const CATEGORY_SEVERITY: Record<string, (typeof SEVERITIES)[number]> = {
	"Barriers, Guardrails & Warning Lines": "Medium",
	"Entering Restricted Area": "High",
	"Head Impact": "High",
	"PPE Compliance Detection": "Medium",
	SOS: "Emergency",
	"Workers in Line of Fire of Lifting Operations": "High",
};

/**
 * Which actions apply to a ticket, mirroring `lifecycleActionsFor` in the Safety Manager template:
 * the action set is a function of status and source, not a fixed menu.
 */
function actionsFor(t: ObservationDetail) {
	if (t.status === "pending") {
		const secondary = [{id: "false-alarm", label: "False Alarm"}];
		// False Positive is a CCTV-only escape hatch.
		if (t.source === "CCTV") secondary.push({id: "false-positive", label: "False Positive"});
		return {primary: {id: "open", label: "Mark as Opened"}, secondary};
	}
	if (t.status === "open") {
		return {
			primary: {id: "close", label: "Close Issue"},
			secondary: [
				{id: "change-severity", label: "Change Severity"},
				{id: "set-company", label: "Set Company"},
			],
		};
	}
	return {primary: {id: "reopen", label: "Reopen"}, secondary: []};
}

/** The map's New/Open/Closed maps onto the ticket's pending/open/closed. */
const TICKET_STATUS = {new: "pending", open: "open", closed: "closed"} as const;

// The navigation styles are omitted: they pull mapbox-traffic-v1, a paid tileset this token cannot
// fetch, so they 404 on every pan and render without the traffic that is their whole point.
const MAP_STYLES = [
	{value: "mapbox://styles/mapbox/standard", label: "Standard"},
	{value: "mapbox://styles/mapbox/standard-satellite", label: "Standard Satellite"},
	{value: "mapbox://styles/mapbox/satellite-streets-v12", label: "Satellite Streets"},
	{value: "mapbox://styles/mapbox/satellite-v9", label: "Satellite"},
	{value: "mapbox://styles/mapbox/streets-v12", label: "Streets"},
	{value: "mapbox://styles/mapbox/outdoors-v12", label: "Outdoors"},
	{value: "mapbox://styles/mapbox/light-v11", label: "Light"},
	{value: "mapbox://styles/mapbox/dark-v11", label: "Dark"},
];

/**
 * Observations are placed inside the zones rather than across the whole blueprint footprint — the
 * footprint is ~21km of mostly empty desert, and work only happens where the zones are.
 */
const ZONE_CENTROIDS = RNGLF_ZONES.map((zone) => {
	const pts = zone.coordinates;
	return [pts.reduce((sum, p) => sum + p[0], 0) / pts.length, pts.reduce((sum, p) => sum + p[1], 0) / pts.length] as [
		number,
		number,
	];
});

/** Observation lifecycle. The three states the timeline legend reads out. */
const STATUS = {
	// Unanswered is the loudest state, cooling as it is worked and closed out.
	new: {label: "New", color: "#ef4444", bar: "wwc:bg-[#ef4444]"},
	open: {label: "Open", color: "#f97316", bar: "wwc:bg-[#f97316]"},
	closed: {label: "Closed", color: "#22c55e", bar: "wwc:bg-[#22c55e]"},
} as const;

/**
 * The severity ladder as its own colour scheme. Only one scheme is live at a time, so it can reuse the
 * same hues — an escalation ramp from unset grey through to emergency red.
 */
const SEVERITY_META: Record<(typeof SEVERITIES)[number], {color: string; bar: string}> = {
	"Not Determined": {color: "#94a3b8", bar: "wwc:bg-[#94a3b8]"},
	Low: {color: "#22c55e", bar: "wwc:bg-[#22c55e]"},
	Medium: {color: "#eab308", bar: "wwc:bg-[#eab308]"},
	High: {color: "#f97316", bar: "wwc:bg-[#f97316]"},
	Emergency: {color: "#dc2626", bar: "wwc:bg-[#dc2626]"},
};

/** Which dimension the map and timeline are coloured and bucketed by. */
type ColorBy = "status" | "severity";

/** How far around a responder counts as theirs to reach. */
const COVERAGE_METERS = 500;

/**
 * The timeline's resolution. Five minutes rather than an hour: violations arrive in bursts, and an
 * hourly bar averages a spike flat. It also matches how often a responder's position is sampled, so
 * a bar and a whereabouts describe the same instant.
 */
const FRAME_MINUTES = 5;

type StatusKey = keyof typeof STATUS;
const STATUS_KEYS = Object.keys(STATUS) as StatusKey[];

// Deterministic PRNG — stories must render identically on every load.
function seededRandom(seed: number) {
	let s = seed | 0;
	return () => {
		s = (s + 0x6d2b79f5) | 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Share of the day's observations reported in each hour — quiet overnight, two shift peaks. */
const HOURLY_WEIGHT = [1, 1, 1, 1, 2, 6, 14, 26, 34, 38, 36, 30, 18, 22, 32, 35, 30, 20, 10, 6, 4, 3, 2, 1];

/**
 * A day's worth of observations at realistic volume — a few hundred, concentrated in working hours.
 * Sites report far more than a handful per hour, which is what the hourly stacked track is for.
 */
function buildObservations(dayStart: Date, count: number, cutoff: Date) {
	const random = seededRandom(1337);
	const total = HOURLY_WEIGHT.reduce((a, b) => a + b, 0);
	const out: {
		id: string;
		coordinates: [number, number];
		label: string;
		description: string;
		title: string;
		zoneId: string;
		assigneeId?: string;
		/** False for reports that arrived without coordinates — they exist, but not on the map. */
		located: boolean;
		source: string;
		category: string;
		severity: ObservationDetail["severity"];
		company?: string;
		color: string;
		status: StatusKey;
		time: Date;
	}[] = [];

	const cutoffMs = cutoff.getTime();
	let n = 0;
	for (let hour = 0; hour < 24; hour++) {
		const inHour = Math.round((HOURLY_WEIGHT[hour] / total) * count);
		for (let i = 0; i < inHour; i++) {
			// Older observations have had time to be worked: mostly closed. Recent ones are still new.
			const age = 1 - hour / 24;
			const roll = random();
			const status: StatusKey = roll < age * 0.55 ? "new" : roll < age * 0.55 + 0.3 ? "open" : "closed";
			const minute = Math.floor(random() * 60);

			// The zone the violation happened in — violations are zone-scoped, so the zone filter has
			// something real to filter on. (Cameras deliberately are not; they watch across zones.)
			const zoneIndex = Math.floor(random() * ZONE_CENTROIDS.length);
			const [zLng, zLat] = ZONE_CENTROIDS[zoneIndex];
			const category = CATEGORIES[n % CATEGORIES.length];
			const time = new Date(dayStart.getTime() + (hour * 60 + minute) * 60 * 1000);
			// Nothing is reported from the future — hours past the cutoff stay genuinely empty.
			if (time.getTime() > cutoffMs) continue;
			out.push({
				id: `obs-${n}`,
				// Jittered around a zone centre — roughly 150m, enough to read as a cluster not a stack.
				coordinates: [zLng + (random() - 0.5) * 0.003, zLat + (random() - 0.5) * 0.003] as [number, number],
				zoneId: String(RNGLF_ZONES[zoneIndex].id),
				// A phone with no fix, a report typed in later: roughly one in twelve has no coordinates.
				located: n % 12 !== 0,
				// Roughly a third are already someone's; the rest are unassigned and up for grabs.
				assigneeId: n % 3 === 0 ? RESPONDER_IDS[n % RESPONDER_IDS.length] : undefined,
				label: `${category} #${1000 + n}`,
				description: `${category} detected at ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}.`,
				title: category,
				source: SOURCES[n % SOURCES.length],
				category,
				severity: CATEGORY_SEVERITY[category],
				company: COMPANIES[n % COMPANIES.length] ?? undefined,
				color: STATUS[status].color,
				status,
				time,
			});
			n++;
		}
	}
	return out;
}

/** How often a responder's whereabouts are sampled — kept in step with the timeline's frame. */
const TRACK_SAMPLE_MINUTES = FRAME_MINUTES;

/**
 * A responder's whereabouts through the day: a few waypoints they rotate between, sampled into a
 * track. Each leg is mostly dwell then a walk, rather than constant drift — which is how a patrol
 * actually looks, and it means "where were they at 08:10" has a believable answer.
 */
function buildTrack(dayStart: Date, homeIndex: number, seed: number) {
	const random = seededRandom(seed);
	const pick = () => Math.floor(random() * ZONE_CENTROIDS.length);
	// Out and back twice, returning home overnight.
	const waypoints = [
		{minute: 0, zone: homeIndex},
		{minute: 6 * 60, zone: homeIndex},
		{minute: 10 * 60, zone: pick()},
		{minute: 13 * 60, zone: homeIndex},
		{minute: 16 * 60, zone: pick()},
		{minute: 19 * 60, zone: homeIndex},
		{minute: 24 * 60, zone: homeIndex},
	];

	/**
	 * Contact drops: a responder's device goes offline for stretches of the day. Two gaps each, placed
	 * off the seed so they differ per responder — the map has to survive them, not pretend they are not
	 * there.
	 */
	const gaps = [
		{from: 4 * 60 + Math.floor(random() * 60), length: 90},
		{from: 13 * 60 + Math.floor(random() * 120), length: 60},
	];
	const online = (minute: number) => !gaps.some((g) => minute >= g.from && minute < g.from + g.length);

	const track: {time: Date; at: [number, number]; online: boolean}[] = [];
	for (let minute = 0; minute <= 24 * 60; minute += TRACK_SAMPLE_MINUTES) {
		let leg = waypoints.findIndex((w, i) => i < waypoints.length - 1 && minute < waypoints[i + 1].minute);
		if (leg === -1) leg = waypoints.length - 2;
		const from = ZONE_CENTROIDS[waypoints[leg].zone];
		const to = ZONE_CENTROIDS[waypoints[leg + 1].zone];
		const span = waypoints[leg + 1].minute - waypoints[leg].minute;
		const through = (minute - waypoints[leg].minute) / span;
		// Hold position for the first 60% of a leg, then walk it in the remaining 40%.
		const moved = Math.max(0, (through - 0.6) / 0.4);
		track.push({
			time: new Date(dayStart.getTime() + minute * 60 * 1000),
			at: [from[0] + (to[0] - from[0]) * moved, from[1] + (to[1] - from[1]) * moved],
			online: online(minute),
		});
	}
	return track;
}

type TrackSample = {time: Date; at: [number, number]; online: boolean};

/**
 * Where a responder was at `time` — the last sample at or before it, so it never reports a future
 * position. `online` says whether that is where they *are* or merely where they were last seen.
 */
function sampleAt(track: TrackSample[], time: Date): TrackSample {
	const ms = time.getTime();
	if (ms <= track[0].time.getTime()) return track[0];
	for (let i = track.length - 1; i >= 0; i--) if (track[i].time.getTime() <= ms) return track[i];
	return track[track.length - 1];
}

/** Split a window's samples into one run per unbroken stretch of contact. */
function contactRuns(track: TrackSample[], from: Date, to: Date): [number, number][][] {
	const runs: [number, number][][] = [];
	let run: [number, number][] = [];
	for (const sample of track) {
		if (sample.time < from || sample.time > to) continue;
		if (sample.online) run.push(sample.at);
		else if (run.length) {
			runs.push(run);
			run = [];
		}
	}
	if (run.length) runs.push(run);
	return runs;
}

/** Responder ids, declared ahead of the generator so observations can be assigned to them. */
const RESPONDER_IDS = ["r-1", "r-2", "r-3", "r-4"];

/**
 * Safety responders, with the field set the Safety Manager responder list records. Placed at zone
 * centres so they read as posted to an area rather than scattered.
 */
const RESPONDERS: (ResponderDetail & {zoneIndex: number})[] = [
	{
		id: "r-1",
		zoneIndex: 4,
		name: "Miguel Santos",
		initials: "MS",
		role: "Safety Officer",
		trade: "INDIRECT-CONSTRUCTION MANAGER",
		online: true,
		enrolledSince: "14 Jul 2026",
		alertsSent: 78,
		alertsAcked: 61,
		alertsClosed: 54,
		acknowledgmentRate: "78%",
		avgResponse: "4m 12s",
		timeOnSite: "6h 40m",
		timeInAssignedZone: "5h 02m",
		platformAcks: {Android: 41, iOS: 14, Web: 6},
		channel: "Mobile",
		mobileNumber: "+966 50 118 4402",
		companies: ["TR", "TR-ACTAVO", "TR-AFIC"],
		companyOverflow: 12,
		zones: "All",
		packages: "NGL Fractionation Trains & Utilities",
		observationSources: ["ConnectedWorker", "WeatherStation"],
	},
	{
		id: "r-2",
		zoneIndex: 10,
		name: "Mohammad Junaid Raza",
		initials: "MR",
		role: "HSE Supervisor",
		trade: "INDIRECT-HSE SUPERVISOR",
		online: true,
		enrolledSince: "02 Jun 2026",
		alertsSent: 143,
		alertsAcked: 138,
		alertsClosed: 131,
		acknowledgmentRate: "96%",
		avgResponse: "1m 48s",
		timeOnSite: "8h 15m",
		timeInAssignedZone: "7h 33m",
		platformAcks: {Android: 96, Huawei: 30, Web: 12},
		channel: "Mobile",
		mobileNumber: "+966 55 902 7731",
		companies: ["NGMSA-PKG3", "SH-PKG5"],
		companyOverflow: 3,
		zones: "NGMSA-PKG3, SH-PKG5",
		packages: "Utilities & Offsites",
		observationSources: ["ConnectedWorker", "CCTV", "ClinicViolation"],
	},
	{
		id: "r-3",
		zoneIndex: 17,
		name: "Roberto Cruz Tuazon",
		initials: "RT",
		role: "Safety Officer",
		trade: "DIRECT-SAFETY OFFICER",
		online: false,
		enrolledSince: "21 Mar 2026",
		alertsSent: 52,
		alertsAcked: 44,
		alertsClosed: 44,
		acknowledgmentRate: "85%",
		avgResponse: "3m 05s",
		timeOnSite: "-",
		timeInAssignedZone: "-",
		platformAcks: {iOS: 33, Web: 11},
		channel: "Mobile",
		mobileNumber: "+966 53 664 1198",
		companies: ["BQ-PKG10"],
		companyOverflow: 0,
		zones: "BQ-PKG10",
		packages: "Pipe Laydown & TCF",
		observationSources: ["Manual", "QRCode"],
	},
	{
		id: "r-4",
		zoneIndex: 25,
		name: "Muhammad Aqeel",
		initials: "MA",
		role: "HSE Officer",
		trade: "INDIRECT-HSE OFFICER",
		online: true,
		enrolledSince: "09 May 2026",
		alertsSent: 97,
		alertsAcked: 90,
		alertsClosed: 71,
		acknowledgmentRate: "93%",
		avgResponse: "2m 21s",
		timeOnSite: "7h 04m",
		timeInAssignedZone: "6h 11m",
		platformAcks: {Android: 72, Web: 18},
		channel: "Mobile",
		mobileNumber: "+966 56 447 3390",
		companies: ["TR-PKG1", "TR-PKG2"],
		companyOverflow: 5,
		zones: "TR-PKG1, TR-PKG2",
		packages: "NGL Trains 1 & 2",
		observationSources: ["ConnectedWorker", "AVL"],
	},
];

/** One camera per zone centre — a camera watches a zone, and the badge counts what it caught. */
function buildCameras(observations: ReturnType<typeof buildObservations>) {
	return RNGLF_ZONES.slice(0, 14).map((zone, i) => {
		const [lng, lat] = ZONE_CENTROIDS[i];
		// Attribute the observations that fell nearest this camera — it is what the badge counts and
		// what the camera panel lists, so both read off one array.
		const caught = observations.filter((o) => {
			const dx = o.coordinates[0] - lng;
			const dy = o.coordinates[1] - lat;
			return Math.sqrt(dx * dx + dy * dy) < 0.0016;
		});
		return {
			id: zone.id,
			name: `CAM ${String(i + 1).padStart(2, "0")}`,
			zone: zone.name ?? String(zone.id),
			coordinates: [lng, lat] as [number, number],
			violations: caught.length,
			caught,
		};
	});
}

export interface ObservationsMapViewProps {
	className?: string;
}

/**
 * The Observations Map as a whole working view: a day of safety observations over the RNGLF site,
 * with cameras, responders and their tracks, a five-minute timeline, filter and display panels, a
 * key, and the ticket / camera / responder detail panels a marker opens.
 *
 * Everything it draws is generated here — observations, cameras, responder whereabouts — so it runs
 * on its own with no data wiring. It fills its parent, which owns the height.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your own view from `ObservationsMap` and the map panels,
 * wired to your data.
 */
export function ObservationsMapView({className}: ObservationsMapViewProps) {
	// Off by default: the zones now carry the real geography, so the dashed footprint is noise until a
	// blueprint image exists to drape.
	const [showBlueprint, setShowBlueprint] = React.useState(false);
	const [showZones, setShowZones] = React.useState(true);
	const [mapStyle, setMapStyle] = React.useState(MAP_STYLES[0].value);
	// Empty means "no filter" for both — 90 zones and 3 statuses are unwieldy to pre-select.
	const [zoneFilter, setZoneFilter] = React.useState<string[]>([]);
	const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
	const [severityFilter, setSeverityFilter] = React.useState<string[]>([]);
	const [sourceFilter, setSourceFilter] = React.useState<string[]>([]);
	const [categoryFilter, setCategoryFilter] = React.useState<string[]>([]);
	const [companyFilter, setCompanyFilter] = React.useState<string[]>([]);
	const [showCameras, setShowCameras] = React.useState(true);
	const [showZoneNames, setShowZoneNames] = React.useState(true);
	const [showResponders, setShowResponders] = React.useState(true);
	const [colorBy, setColorBy] = React.useState<ColorBy>("status");
	// A collapsed timeline frees the right of its row, so the legend drops down beside it.
	const [timelineCollapsed, setTimelineCollapsed] = React.useState(false);
	const [openResponderId, setOpenResponderId] = React.useState<string | number | null>(null);
	// The open ticket, plus any lifecycle edits made to it from the panel.
	const [openTicketId, setOpenTicketId] = React.useState<string | null>(null);
	// Set while a camera is open. A ticket drilled into from it keeps this, which is what makes Back work.
	const [openCameraId, setOpenCameraId] = React.useState<string | number | null>(null);
	const [ticketEdits, setTicketEdits] = React.useState<Record<string, Partial<ObservationDetail>>>({});
	const [commentsById, setCommentsById] = React.useState<Record<string, CommentItem[]>>({});
	const [draft, setDraft] = React.useState("");

	// Live day. Nothing is generated past `maxTime`, so the hours ahead of now are empty because there
	// is no data yet — not because the window is hiding it.
	const [selectedDate, setSelectedDate] = React.useState(() => startOfDay(new Date()));
	// The window the map reads. Opens on the last frame — "now" means the past few minutes, not the
	// hour so far. Drag either handle to widen it.
	const [range, setRange] = React.useState<[Date, Date]>(() => {
		const now = new Date();
		return [new Date(now.getTime() - FRAME_MINUTES * 60 * 1000), now];
	});

	const day = React.useMemo(
		() => ({start: selectedDate, end: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)}),
		[selectedDate],
	);

	// On today's timeline the cursor stops at "now"; a past day is fully historical.
	const maxTime = React.useMemo(() => {
		const now = new Date();
		return startOfDay(now).getTime() === selectedDate.getTime() ? now : day.end;
	}, [selectedDate, day.end]);

	const observations = React.useMemo(() => buildObservations(day.start, 420, maxTime), [day.start, maxTime]);

	/**
	 * The map is a snapshot of the selected window, not a running total from 00:00 — moving or widening
	 * the range moves through the day rather than accumulating it, which is what keeps the hourly track
	 * and the pins describing the same thing.
	 */
	const visible = React.useMemo(
		() => observations.filter((o) => o.time.getTime() >= range[0].getTime() && o.time.getTime() < range[1].getTime()),
		[observations, range],
	);

	/**
	 * Every filter applies to the violations. Zone is one of them — a violation belongs to a zone, so
	 * filtering by zone scopes the pins as well as the polygons. Cameras are deliberately exempt: they
	 * watch across zones rather than sitting in one, so a zone filter must not make them vanish.
	 *
	 * The timeline keeps showing the whole day's breakdown, so filtering never looks like data loss.
	 */
	const shownObservations = React.useMemo(
		() =>
			visible.filter((o) => {
				if (statusFilter.length && !statusFilter.includes(o.status)) return false;
				if (zoneFilter.length && !zoneFilter.includes(o.zoneId)) return false;
				if (severityFilter.length && !severityFilter.includes(o.severity)) return false;
				if (sourceFilter.length && !sourceFilter.includes(o.source)) return false;
				if (categoryFilter.length && !categoryFilter.includes(o.category)) return false;
				if (companyFilter.length && !companyFilter.includes(o.company ?? UNASSIGNED)) return false;
				return true;
			}),
		[visible, statusFilter, zoneFilter, severityFilter, sourceFilter, categoryFilter, companyFilter],
	);

	const cameras = React.useMemo(() => buildCameras(shownObservations), [shownObservations]);

	/**
	 * Responders move, so the map cannot pin them to one point for a whole window. Each carries a track
	 * for the day, and is drawn at their last known position *within the selected range* — the most
	 * recent place they actually were, not where they ended the day.
	 */
	const responderTracks = React.useMemo(
		() => RESPONDERS.map((r, i) => ({...r, track: buildTrack(day.start, r.zoneIndex, 4200 + i * 17)})),
		[day.start],
	);

	const placedResponders = React.useMemo(
		() =>
			responderTracks.map((r) => {
				const last = sampleAt(r.track, range[1] < maxTime ? range[1] : maxTime);
				// Out of contact draws faded and marks the last place they were seen, not where they are.
				return {...r, coordinates: last.at, online: last.online};
			}),
		[responderTracks, range, maxTime],
	);
	const metresBetween = React.useCallback((a: [number, number], b: [number, number]) => {
		const dLat = (a[1] - b[1]) * 110574;
		const dLng = (a[0] - b[0]) * 111320 * Math.cos((a[1] * Math.PI) / 180);
		return Math.hypot(dLat, dLng);
	}, []);

	const openResponder = React.useMemo(
		() => placedResponders.find((r) => r.id === openResponderId) ?? null,
		[placedResponders, openResponderId],
	);

	/**
	 * Violations a camera accounts for are not drawn on the map. They are reported at the camera's own
	 * coordinates, so the badge would cover them anyway — and the count on the camera already says how
	 * many there are. They stay reachable by opening the camera.
	 */
	const cameraHeldIds = React.useMemo(() => new Set(cameras.flatMap((c) => c.caught.map((o) => o.id))), [cameras]);

	const mapObservations = React.useMemo(
		() => shownObservations.filter((o) => o.located && !cameraHeldIds.has(o.id)),
		[shownObservations, cameraHeldIds],
	);

	/** Reports with no coordinates. They cannot be pinned, so they get a list instead of being dropped. */
	const unlocated = React.useMemo(() => shownObservations.filter((o) => !o.located), [shownObservations]);

	/** What the open responder already owns, and what else is close enough for them to take. */
	const responderQueues = React.useMemo(() => {
		if (!openResponder) return {assigned: [], nearby: []};
		const summarise = (o: (typeof shownObservations)[number]) => ({
			id: o.id,
			title: o.label,
			status: TICKET_STATUS[o.status],
			severity: o.severity,
			timestamp: hhmm(o.time),
			detail: `${Math.round(metresBetween(o.coordinates, sampleAt(openResponder.track, o.time).at))}m away`,
		});
		return {
			assigned: shownObservations.filter((o) => o.assigneeId === openResponder.id).map(summarise),
			// In range is judged per violation, at the moment it was reported — against where the responder
			// actually stood then, not where they happened to end the window. Over a range they move, so a
			// single circle would both miss violations they could have reached and claim ones they could not.
			nearby: shownObservations
				.filter((o) => {
					if (o.assigneeId === openResponder.id) return false;
					const was = sampleAt(openResponder.track, o.time);
					// Out of contact is not "in range": there is no knowing where they were, and they were
					// not reachable. A stale position would claim reach they never had.
					return was.online && metresBetween(o.coordinates, was.at) <= COVERAGE_METERS;
				})
				.map(summarise),
		};
	}, [openResponder, shownObservations, metresBetween]);

	// Markers take their colour from whichever dimension the map is showing.
	const colouredObservations = React.useMemo(
		() =>
			mapObservations.map((o) => ({
				...o,
				color: colorBy === "severity" ? SEVERITY_META[o.severity].color : STATUS[o.status].color,
			})),
		[mapObservations, colorBy],
	);

	/**
	 * What stays lit while something is selected: the open ticket on its own, or a camera together with
	 * every violation it caught — the camera panel lists them, so the map should show the same set.
	 */
	const focusedIds = React.useMemo(() => {
		// A focused responder also stops being nudged off a camera, so its coverage centres on its badge.
		if (openResponderId) return [openResponderId];
		if (openTicketId && !openCameraId) return [openTicketId];
		const camera = cameras.find((c) => c.id === openCameraId);
		if (!camera) return undefined;
		// Its violations are not pins, so there is nothing else to keep lit.
		return [camera.id];
	}, [openTicketId, openCameraId, openResponderId, cameras]);

	const openCamera = React.useMemo(() => cameras.find((c) => c.id === openCameraId) ?? null, [cameras, openCameraId]);

	const openTicket = React.useMemo<ObservationDetail | null>(() => {
		const o = observations.find((x) => x.id === openTicketId);
		if (!o) return null;
		// No coordinates means no zone to derive; the panel says so rather than guessing one.
		const zone = !o.located
			? null
			: RNGLF_ZONES.reduce<{name: string; d: number} | null>((best, z) => {
					const c = ZONE_CENTROIDS[RNGLF_ZONES.indexOf(z)];
					const d = Math.hypot(o.coordinates[0] - c[0], o.coordinates[1] - c[1]);
					return !best || d < best.d ? {name: z.name ?? String(z.id), d} : best;
				}, null);
		return {
			id: o.id,
			title: o.label,
			description: o.description,
			status: TICKET_STATUS[o.status],
			severity: o.severity,
			source: o.source,
			category: o.category,
			company: o.company,
			zone: zone?.name,
			updatedAt: o.time.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}),
			...ticketEdits[o.id],
		};
	}, [observations, openTicketId, ticketEdits]);

	// Every lifecycle action drops an audit line into the thread, as the list view does.
	const runAction = React.useCallback(
		(actionId: string) => {
			if (!openTicket) return;
			const next: Partial<ObservationDetail> =
				actionId === "open"
					? {status: "open", assignedTo: "Muhammad Aqeel"}
					: actionId === "close"
						? {status: "closed", closedBy: "Roberto Cruz Tuazon"}
						: actionId === "reopen"
							? {status: "open", assignedTo: "Muhammad Aqeel", closedBy: undefined}
							: actionId === "false-positive"
								? {status: "closed", falsePositive: true}
								: actionId === "false-alarm"
									? {status: "closed"}
									: {};
			const label: Record<string, string> = {
				open: "Marked as opened and assigned to Muhammad Aqeel.",
				close: "Closed by Roberto Cruz Tuazon.",
				reopen: "Reopened.",
				"false-alarm": "Marked as false alarm.",
				"false-positive": "Marked as false positive.",
				"change-severity": "Severity change requested.",
				"set-company": "Company assignment requested.",
			};
			setTicketEdits((prev) => ({...prev, [openTicket.id]: {...prev[openTicket.id], ...next}}));
			setCommentsById((prev) => ({
				...prev,
				[openTicket.id]: [
					...(prev[openTicket.id] ?? []),
					{
						id: `a-${openTicket.id}-${prev[openTicket.id]?.length ?? 0}`,
						author: {name: "System", initials: "S"},
						timestamp: "just now",
						body: label[actionId] ?? actionId,
					},
				],
			}));
		},
		[openTicket],
	);

	/**
	 * One bar per hour, stacked by status. Observations arrive in the hundreds per day and dozens per
	 * hour, so an hourly bucket is the honest resolution — finer buckets just add noise to a track that
	 * is 24 bars wide, and coarser ones hide the shift peaks.
	 */
	const activity = React.useMemo<TimeScrubberActivity[]>(
		() =>
			Array.from({length: (24 * 60) / FRAME_MINUTES}, (_, i) => {
				const from = day.start.getTime() + i * FRAME_MINUTES * 60 * 1000;
				const to = from + FRAME_MINUTES * 60 * 1000;
				const time = new Date(from);
				const inFrame = observations.filter((o) => o.time.getTime() >= from && o.time.getTime() < to);
				// Bars stack by whatever the map is coloured by, so the two always describe the same split.
				const segments =
					colorBy === "severity"
						? SEVERITIES.map((level) => ({
								value: inFrame.filter((o) => o.severity === level).length,
								className: SEVERITY_META[level].bar,
							}))
						: // Bottom→top: closed underneath, new on top, so the unresolved work reads at a glance.
							([...STATUS_KEYS].reverse().map((k) => ({
								value: inFrame.filter((o) => o.status === k).length,
								className: STATUS[k].bar,
							})) as {value: number; className: string}[]);
				const future = from > maxTime.getTime();
				return {
					time,
					value: inFrame.length,
					segments,
					title: future
						? `${hhmm(time)} — no data yet`
						: `${hhmm(time)} — ${inFrame.length} observation${inFrame.length === 1 ? "" : "s"}`,
				};
			}),
		[day.start, observations, maxTime, colorBy],
	);

	// "Now" snaps the window back to the last frame on today — the most recent five minutes.
	const goToNow = React.useCallback(() => {
		const now = new Date();
		setSelectedDate(startOfDay(now));
		setRange([new Date(now.getTime() - FRAME_MINUTES * 60 * 1000), now]);
	}, []);

	// Switching day carries the window's width and time-of-day onto the new date.
	const changeDate = React.useCallback((date: Date) => {
		const start = startOfDay(date);
		setSelectedDate(start);
		setRange(([from, to]) => {
			const width = to.getTime() - from.getTime();
			const offset = from.getTime() - startOfDay(from).getTime();
			const next = new Date(start.getTime() + offset);
			return [next, new Date(next.getTime() + width)];
		});
	}, []);

	return (
		// The height is the parent's to give: a story hands it the viewport, a template tab hands it
		// what is left under the header.
		<div className={cn("wwc:h-full wwc:min-h-0", className)}>
			<ObservationsMap
				fullHeight
				className="wwc:rounded-none"
				showBlueprint={showBlueprint}
				mapStyle={mapStyle}
				zones={RNGLF_ZONES}
				selectedZoneIds={zoneFilter}
				// Captured framing. fitTo must be "none" or the bounds fit would override center/zoom on load.
				fitTo="none"
				center={[49.6857, 26.801247]}
				zoom={13.27}
				bearing={0}
				pitch={45.5}
				zoneColorMode="neutral"
				showZones={showZones}
				showZoneLabels={showZoneNames}
				onZoneSelect={(zone) => {
					// Clicking a zone toggles it in the filter — the same selection the dropdown drives, so
					// the click zooms, outlines and filters rather than just naming what was hit.
					const id = String(zone.id);
					setZoneFilter((prev) => (prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]));
				}}
				observations={colouredObservations}
				renderHoverCard={({kind, id}) => {
					if (kind === "observation") {
						const o = observations.find((x) => x.id === id);
						if (!o) return null;
						return (
							<MapHoverCard
								title={o.label}
								badges={
									<>
										<Badge variant="neutralSoft">{STATUS[o.status].label}</Badge>
										<Badge variant="outline">{o.severity}</Badge>
									</>
								}
								rows={[
									{label: "Reported", value: hhmm(o.time)},
									{label: "Source", value: o.source},
									{label: "Company", value: o.company ?? "Not Determined"},
								]}
								footer="Click to open the ticket"
							/>
						);
					}
					if (kind === "camera") {
						const c = cameras.find((x) => x.id === id);
						if (!c) return null;
						return (
							<MapHoverCard
								title={c.name}
								badges={<Badge variant="neutralSoft">{c.violations} in window</Badge>}
								// Stands in for the live feed until streams are wired in.
								media={
									<div className="wwc:flex wwc:h-16 wwc:items-center wwc:justify-center wwc:border-b wwc:border-border wwc:bg-muted wwc:text-[11px] wwc:text-muted-foreground">
										No preview
									</div>
								}
								rows={[
									{label: "Type", value: "Fixed CCTV"},
									{label: "Location", value: c.zone},
								]}
								footer="Click to open the camera"
							/>
						);
					}
					const r = placedResponders.find((x) => x.id === id);
					if (!r) return null;
					return (
						<MapHoverCard
							title={r.name}
							badges={
								<>
									<Badge variant={r.online ? "successSoft" : "neutralSoft"}>{r.online ? "Online" : "Offline"}</Badge>
									<Badge variant="outline">{r.role}</Badge>
								</>
							}
							rows={[
								{label: "Acked", value: `${r.acknowledgmentRate ?? "-"}`},
								{label: "Avg. response", value: r.avgResponse ?? "-"},
								{label: "Zones", value: r.zones ?? "-"},
							]}
							footer={`Reaches ${COVERAGE_METERS}m around them`}
						/>
					);
				}}
				onObservationSelect={(observation) => {
					setOpenTicketId(observation.id);
					setOpenCameraId(null);
					setOpenResponderId(null);
				}}
				cameras={cameras}
				responders={placedResponders}
				// A selected responder shows where they went in this window and the ground that put in reach.
				// The corridor's round caps already cover the endpoint, so no separate circle is needed.
				track={
					openResponder
						? {
								// One segment per unbroken run of contact, so an offline stretch is drawn as a gap
								// rather than a straight line across ground nobody walked.
								segments: contactRuns(openResponder.track, range[0], range[1] < maxTime ? range[1] : maxTime),
								radiusMeters: COVERAGE_METERS,
							}
						: undefined
				}
				showResponders={showResponders}
				onResponderSelect={(responder) => {
					setOpenResponderId(responder.id);
					setOpenTicketId(null);
					setOpenCameraId(null);
				}}
				focusedIds={focusedIds}
				onBackgroundClick={() => {
					setOpenTicketId(null);
					setOpenCameraId(null);
				}}
				showCameras={showCameras}
				onCameraSelect={(camera) => {
					setOpenCameraId(camera.id);
					setOpenTicketId(null);
					setOpenResponderId(null);
				}}
				detail={
					openTicket ? (
						<ObservationDetailPanel
							observation={openTicket}
							onClose={() => setOpenTicketId(null)}
							primaryAction={actionsFor(openTicket).primary}
							secondaryActions={actionsFor(openTicket).secondary}
							onAction={runAction}
							comments={commentsById[openTicket.id] ?? []}
							commentValue={draft}
							onCommentValueChange={setDraft}
							onCommentSubmit={(html) => {
								// CommentItem.body renders as a node, not markup — the composer hands back HTML,
								// so flatten it to text rather than printing the tags.
								const text = html
									.replace(/<\/(p|div|li)>/g, "\n")
									.replace(/<[^>]+>/g, "")
									.trim();
								if (!text) return;
								setCommentsById((prev) => ({
									...prev,
									[openTicket.id]: [
										...(prev[openTicket.id] ?? []),
										{
											id: `c-${openTicket.id}-${prev[openTicket.id]?.length ?? 0}`,
											author: {name: "You", initials: "Y"},
											timestamp: "just now",
											body: text,
										},
									],
								}));
								setDraft("");
							}}
							onBack={openCamera || openResponder ? () => setOpenTicketId(null) : undefined}
							backLabel={
								openCamera ? `Back to ${openCamera.name}` : openResponder ? `Back to ${openResponder.name}` : undefined
							}
						/>
					) : openResponder ? (
						<ResponderDetailPanel
							responder={openResponder}
							assigned={responderQueues.assigned}
							nearby={responderQueues.nearby}
							coverageMeters={COVERAGE_METERS}
							onViolationSelect={(v) => setOpenTicketId(v.id)}
							onClose={() => setOpenResponderId(null)}
						/>
					) : openCamera ? (
						<CameraDetailPanel
							camera={{
								id: openCamera.id,
								name: openCamera.name,
								kind: "Fixed CCTV",
								location: openCamera.zone,
								state: "Online",
								// No thumbnailUrl yet — the panel shows its placeholder until real stills or a
								// live stream are wired in.
								live: true,
							}}
							violations={openCamera.caught.map((o) => ({
								id: o.id,
								title: o.label,
								status: TICKET_STATUS[o.status],
								severity: o.severity,
								timestamp: o.time.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}),
							}))}
							onViolationSelect={(v) => setOpenTicketId(v.id)}
							onClose={() => setOpenCameraId(null)}
						/>
					) : null
				}
				legendInline={timelineCollapsed}
				legend={
					<MapLegend
						sections={[
							{
								// The key tracks whatever the map is coloured by, so it never describes the other scheme.
								title: colorBy === "severity" ? "Severity" : "Status",
								items:
									colorBy === "severity"
										? SEVERITIES.map((level) => ({
												label: level,
												color: SEVERITY_META[level].color,
												shape: "circle" as const,
												icon: HAZARD_ICON,
											}))
										: STATUS_KEYS.map((k) => ({
												label: STATUS[k].label,
												color: STATUS[k].color,
												shape: "circle" as const,
												icon: HAZARD_ICON,
											})),
							},
							{
								title: "On site",
								items: [
									{label: "Camera", color: "#3d4a5c", shape: "square" as const, icon: CAMERA_ICON},
									{label: "Responder", color: "#2f6b63", shape: "square" as const, icon: RESPONDER_ICON},
								],
							},
							{
								title: "Areas",
								items: [{label: "Zone", color: "#64748b", shape: "fill" as const}],
							},
						]}
					/>
				}
				controls={
					// Two panels side by side — what is shown, and how it is drawn — with the unlocated list
					// stacked beneath them. Each folds independently.
					<div className="wwc:flex wwc:flex-col wwc:gap-2">
						<div className="wwc:flex wwc:items-start wwc:gap-2">
							<MapControlPanel
								title="Filters"
								// Folded until asked for — the map is the content, the controls are the aside.
								defaultCollapsed
								onClear={() => {
									setZoneFilter([]);
									setStatusFilter([]);
									setCategoryFilter([]);
									setSeverityFilter([]);
									setSourceFilter([]);
									setCompanyFilter([]);
								}}
								selects={[
									// The dimension the map is coloured by leads as coloured chips; the other becomes a plain
									// dropdown. Switching `colorBy` swaps which is which.
									colorBy === "severity"
										? {
												id: "severity-chips",
												label: "Severity",
												as: "chips" as const,
												// Five labels will not fit one row; a three-column grid keeps them even.
												chipColumns: 3,
												options: SEVERITIES.map((level) => ({
													value: level,
													label: level,
													color: SEVERITY_META[level].color,
												})),
												value: severityFilter,
												onValueChange: setSeverityFilter,
											}
										: {
												id: "status-chips",
												label: "Status",
												// Three options — a segmented row shows all of them at once instead of hiding them.
												as: "chips" as const,
												options: STATUS_KEYS.map((k) => ({
													value: k,
													label: STATUS[k].label,
													color: STATUS[k].color,
												})),
												value: statusFilter,
												onValueChange: setStatusFilter,
											},
									{
										id: "zone-filter",
										label: "Zones",
										placeholder: `All zones (${RNGLF_ZONES.length})`,
										options: RNGLF_ZONES.map((z) => ({value: String(z.id), label: z.name ?? String(z.id)})),
										value: zoneFilter,
										onValueChange: setZoneFilter,
									},
									{
										id: "company-filter",
										label: "Companies",
										placeholder: "All companies",
										options: COMPANIES.map((c) => ({value: c ?? UNASSIGNED, label: c ?? "Unassigned"})),
										value: companyFilter,
										onValueChange: setCompanyFilter,
									},
									{
										id: "source-filter",
										label: "Sources",
										placeholder: "All sources",
										options: SOURCES.map((v) => ({value: v, label: v})),
										value: sourceFilter,
										onValueChange: setSourceFilter,
									},
									// The dimension not being coloured by sits here as an uncoloured dropdown.
									colorBy === "severity"
										? {
												id: "status-filter",
												label: "Status",
												placeholder: "All statuses",
												options: STATUS_KEYS.map((k) => ({value: k, label: STATUS[k].label})),
												value: statusFilter,
												onValueChange: setStatusFilter,
											}
										: {
												id: "severity-filter",
												label: "Severity",
												placeholder: "All severities",
												options: SEVERITIES.map((v) => ({value: v, label: v})),
												value: severityFilter,
												onValueChange: setSeverityFilter,
											},
									{
										id: "category-filter",
										label: "Type",
										placeholder: "All types",
										options: CATEGORIES.map((c) => ({value: c, label: c})),
										value: categoryFilter,
										onValueChange: setCategoryFilter,
									},
								]}
							/>

							<MapControlPanel
								title="Settings"
								defaultCollapsed
								// Narrower than Filters: one dropdown and four switches, with no pills to hold.
								width={220}
								selects={[
									{
										id: "color-by",
										label: "Show by",
										// Two options — a pair of chips is quicker to read and to hit than a dropdown.
										as: "chips",
										single: true,
										options: [
											{value: "status", label: "Status"},
											{value: "severity", label: "Severity"},
										],
										value: [colorBy],
										onValueChange: ([next]) => setColorBy(next as ColorBy),
									},
									{
										id: "map-type",
										label: "Map type",
										single: true,
										options: MAP_STYLES,
										value: [mapStyle],
										onValueChange: ([next]) => setMapStyle(next),
									},
								]}
								toggles={[
									{
										id: "panel-blueprint",
										label: "Blueprint",
										checked: showBlueprint,
										onCheckedChange: setShowBlueprint,
									},
									{id: "panel-zones", label: "Zones", checked: showZones, onCheckedChange: setShowZones},
									{
										id: "panel-zone-names",
										label: "Zone names",
										checked: showZoneNames,
										onCheckedChange: setShowZoneNames,
									},
									{id: "panel-cameras", label: "Cameras", checked: showCameras, onCheckedChange: setShowCameras},
									{
										id: "panel-responders",
										label: "Responders",
										checked: showResponders,
										onCheckedChange: setShowResponders,
									},
								]}
							/>
						</div>

						{/* Reports with no coordinates cannot be pinned, so they get a list. Same rows as every
						    other route into a ticket, and the same right-hand panel opens. */}
						{/* Always present, even at nothing: a panel that appears and disappears as the window
						    changes is impossible to rely on, and "none right now" is itself worth knowing. */}
						<MapControlPanel
							title={`No location (${unlocated.length})`}
							// Opened by default, and the only panel that is: these reports are not on the map, so
							// this list is the only place they can be noticed at all.
							// Shorter than a filter panel: it is a queue to dip into, not the main control.
							maxHeight="34vh"
							// Borderless and edge-faded, so the queue reads as part of the map rather than a
							// control panel sitting on it.
							className="wwc:border-0"
							fadeEdges
						>
							{unlocated.length === 0 ? (
								<p className="wwc:py-2 wwc:text-center wwc:text-xs wwc:text-muted-foreground">
									Everything in this window has a location.
								</p>
							) : (
								<ViolationList
									violations={unlocated.map((o) => ({
										id: o.id,
										title: o.label,
										status: TICKET_STATUS[o.status],
										severity: o.severity,
										timestamp: hhmm(o.time),
										detail: o.source,
									}))}
									onSelect={(v) => {
										setOpenTicketId(v.id);
										setOpenCameraId(null);
										setOpenResponderId(null);
									}}
								/>
							)}
						</MapControlPanel>
					</div>
				}
				timeline={{
					start: day.start,
					end: day.end,
					variant: "barGraph",
					data: activity,
					label: (
						<span className="wwc:flex wwc:items-center wwc:gap-1">
							<Eye className="wwc:h-3 wwc:w-3" />
							Observations
						</span>
					),
					collapsed: timelineCollapsed,
					onCollapsedChange: setTimelineCollapsed,
					// Ticks stay hourly even though the bars are five-minute — 288 ticks would be a solid line.
					minorEveryMinutes: 60,
					majorEveryMinutes: 180,
					legend:
						colorBy === "severity"
							? SEVERITIES.map((level) => ({label: level, className: SEVERITY_META[level].bar}))
							: STATUS_KEYS.map((k) => ({label: STATUS[k].label, className: STATUS[k].bar})),
					// Two handles, not a playhead: the map reads a window, so the control that sets it is a range.
					rangeValue: range,
					onRangeValueChange: setRange,
					max: maxTime,
					date: selectedDate,
					onDateChange: changeDate,
					onNow: goToNow,
					valueLabel: `${shownObservations.length} in ${hhmm(range[0])}–${hhmm(range[1])} · ${mapObservations.length} on map / ${cameraHeldIds.size} on cameras${unlocated.length ? ` / ${unlocated.length} unlocated` : ""}`,
				}}
			/>
		</div>
	);
}
