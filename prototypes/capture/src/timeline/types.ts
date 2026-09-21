// Shared contract for the 4D construction-timeline feature.
//
// The schedule (public/schedule.json) is generated offline from the UE22 IFC model by
// .context/gen_schedule.py — 73 objects, 330 tasks, 1203 real IFC elements, sequenced
// bottom-up (structure climbs Ground→Roof), starting 2026-01-01. Every task links to an
// object; every geometry-bearing object carries the IFC GUIDs of its elements so the viewer
// can highlight / hide / reveal exactly those elements as days advance.

/** One schedulable work item, always linked to an object + an activity. */
export interface ScheduleTask {
	id: string;
	name: string;
	objectId: string;
	activity: string;
	storey: string;
	phase: string;
	startDay: number; // day index, 0 = projectStart
	duration: number; // days
	startDate: string; // ISO date
	endDate: string; // ISO date
	predecessors: string[];
	/** Trade colour/label, precomputed so the schedule list + legend don't re-derive per row. */
	tradeColor: string;
	tradeLabel: string;
	/** Percent complete (approved) for this task, 0..100. */
	progress: number;
	/** P6 status. */
	status: "Completed" | "InProgress" | "NotStarted";
	criticalPath: boolean;
}

/** A worked object = a group of IFC elements (storey × type), or a site/system pseudo-object.
 *  guids/expressIDs are empty for non-geometry objects (SITE enabling/commissioning, SYSTEM
 *  car-park MEP). An object is "built" (rendered solid) once its buildTask finishes. */
export interface ScheduleObject {
	id: string;
	label: string;
	storey: string;
	elevation: number;
	ifcType: string;
	activity: string;
	phase: string;
	count: number;
	guids: string[];
	expressIDs: number[];
	startDay: number;
	endDay: number;
	startDate: string;
	buildDate: string;
	buildTaskId: string | null;
	/** Heuristic model linkage (no shared IDs between P6 and the IFC): the model storey this work sits on
	 *  (null = no matching storey, e.g. sitework) and the IFC category patterns its discipline touches.
	 *  scene-painter resolves these to the model's localIds instead of GUIDs. */
	storeyName: string | null;
	categories: RegExp[];
}

export interface ScheduleMilestone {
	id: string;
	name: string;
	day: number;
	date: string;
}

export interface ScheduleMeta {
	project: string;
	projectStart: string;
	totalDays: number;
	endDate: string;
	dayUnit: string;
	objectCount: number;
	taskCount: number;
	elementCount: number;
	storeyOrder: string[];
	phaseOrder: string[];
}

export interface Schedule {
	meta: ScheduleMeta;
	milestones: ScheduleMilestone[];
	objects: ScheduleObject[];
	tasks: ScheduleTask[];
}

/** Per-object lifecycle state at a given day. */
export type ObjectState = "pending" | "active" | "built";

/** Live construction progress for one storey at the current day. */
export interface FloorProgress {
	storey: string;
	elevation: number;
	totalElements: number;
	builtElements: number;
	/** 0..1 — built elements plus the time-fraction of elements currently under construction. */
	progress: number;
	state: ObjectState;
	/** Objects on this floor being worked right now. */
	activeObjectCount: number;
	/** Trade keys currently active on this floor (for colour dots). */
	activeTrades: string[];
}

/** Everything the overlay UI needs to render + drive playback. Produced by use4DTimeline. */
export interface TimelineState {
	ready: boolean; // schedule loaded + geometry resolved
	loading: boolean;
	error: string | null;
	schedule: Schedule | null;

	currentDay: number; // float, 0..totalDays
	totalDays: number;
	currentDate: string; // ISO date for currentDay
	playing: boolean;
	speed: number; // days per second while playing
	autoRotate: boolean; // orbit the camera 90° across a full playback (only while playing, not scrubbing)

	/** 0..1 completion by built-element count (the "build-up" progress). */
	progress: number;
	builtElements: number;
	totalElements: number;

	/** Objects currently being worked (state === "active") at currentDay. */
	activeObjects: ScheduleObject[];
	/** Tasks in progress at currentDay (for the "what's happening now" list). */
	activeTasks: ScheduleTask[];
	/** Dominant phase(s) in progress right now. */
	activePhases: string[];
	/** Trade keys currently being worked anywhere (for the "now on site" colour badges). */
	activeTrades: string[];
	/** Milestone at/just passed and the next upcoming one. */
	lastMilestone: ScheduleMilestone | null;
	nextMilestone: ScheduleMilestone | null;

	/** Per-storey progress at the current day, ordered top floor → ground. */
	floors: FloorProgress[];
}

export interface TimelineControls {
	play(): void;
	pause(): void;
	toggle(): void;
	seek(day: number): void; // clamps to [0, totalDays]
	stepDays(delta: number): void; // nudge current day
	setSpeed(daysPerSecond: number): void;
	reset(): void; // back to day 0
	jumpToEnd(): void; // fully-built model
	setAutoRotate(on: boolean): void;
	toggleAutoRotate(): void;
}

/** ISO date string for a given day index against a projectStart ISO date. */
export function dayToDate(projectStartISO: string, day: number): string {
	const base = new Date(projectStartISO + "T00:00:00Z");
	base.setUTCDate(base.getUTCDate() + Math.round(day));
	return base.toISOString().slice(0, 10);
}

/** Human date like "12 Mar 2026". */
export function formatDate(iso: string): string {
	const dt = new Date(iso + "T00:00:00Z");
	return dt.toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric", timeZone: "UTC"});
}

export function objectStateAt(obj: ScheduleObject, day: number): ObjectState {
	if (day >= obj.endDay) return "built";
	if (day >= obj.startDay) return "active";
	return "pending";
}
