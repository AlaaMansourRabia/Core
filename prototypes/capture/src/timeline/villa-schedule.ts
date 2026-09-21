// Real villa schedule — the single source of truth for the timeline.
//
// Adapts the pulled P6 export (villa-2265-VL4-L-timeline.json, 69 activities) into the existing
// `Schedule` shape the 4D overlay + floor-panel schedule list already consume. This REPLACES the old
// mock (public/schedule.json, which was generated from a different building, the UE22 model). This is a
// data swap: the UI shape is unchanged; only the data — and the model linkage — moved to the real pull.
//
// Model linkage: the P6 activities carry no IFC GUIDs, so there is no shared id with the villa model.
// We link heuristically — each activity's `floors` map to the model's storeys and its `disciplines` map
// to IFC element categories (see FLOOR_TO_STOREY / DISCIPLINE_CATEGORIES). scene-painter resolves those
// to the model's localIds. The villa federation is ARC + PLU + MEP + ELE only (no STR/SITE geometry),
// so sitework/structural activities legitimately highlight nothing.

import type {Schedule, ScheduleMilestone, ScheduleObject, ScheduleTask} from "./types";

import {tradeForActivity} from "./trades";
import raw from "./villa-2265-VL4-L-timeline.json";

/** One activity in the P6 export. */
export interface P6Activity {
	code: string;
	name: string;
	division: string;
	disciplines: string[];
	floors: string[];
	status: "Completed" | "InProgress" | "NotStarted";
	criticalPath: boolean;
	plannedStart: string;
	plannedFinish: string;
	baselineStart: string;
	baselineFinish: string;
	durationHours: number;
	plannedProgressPercent: number;
	approvedProgressPercent: number;
	budgetAtCompletion: number;
	earnedValue: number;
}

interface P6Export {
	villa: string;
	unitType: string;
	overall: {start: string; finish: string; durationDays: number; baselineStart: string; baselineFinish: string};
	activityCount: number;
	floorCodes: Record<string, string>;
	disciplineCodes: Record<string, string>;
	activities: P6Activity[];
}

const DATA = raw as P6Export;

// ── Floor + discipline mapping to the villa model ────────────────────────────────────────────────
//
// The model has 4 IfcBuildingStoreys (elevations): Ground Floor −12.8, First Floor 0.2, Second Floor
// 8.5, Roof 12.3. The −12.8 "Ground Floor" is the foundation/substructure level, so the P6 floors line
// up by elevation (not by name): SS→foundation, GF→ground(0.2), FF/UF→above, RF→roof. `storeyName` must
// match the IfcBuildingStorey Name EXACTLY so scene-painter can resolve elements on it.

const FLOOR_ORDER = ["SS", "GF", "FF", "UF", "RF"] as const;

const FLOOR_TO_STOREY: Record<string, string> = {
	SS: "Ground Floor", // substructure/foundation → model's lowest storey (−12.8 m)
	GF: "First Floor", // real ground level → model's First Floor (0.2 m)
	FF: "Second Floor", // → model's Second Floor (8.5 m)
	UF: "Second Floor", // upper — the villa has no distinct upper storey; merged into Second
	RF: "Roof", // → model's Roof (12.3 m)
};

const STOREY_ELEVATION: Record<string, number> = {
	"Ground Floor": -12.8,
	"First Floor": 0.2,
	"Second Floor": 8.5,
	Roof: 12.3,
};

// Storeys top → bottom (for the overlay's per-floor list, sorted by elevation).
const STOREY_ORDER = ["Roof", "Second Floor", "First Floor", "Ground Floor"];

// IFC categories each discipline touches, for the heuristic highlight. Overlap between PLU/MEP/ELE is
// expected (they share flow terminals/segments); STR/SITE have no geometry in this federation.
const DISCIPLINE_CATEGORIES: Record<string, RegExp[]> = {
	ARC: [/IFCWALL/, /IFCDOOR/, /IFCWINDOW/, /IFCCOVERING/, /IFCCURTAINWALL/, /IFCRAILING/, /IFCSTAIR/, /IFCSLAB/, /IFCROOF/, /IFCPLATE/, /IFCMEMBER/, /IFCFURNI/],
	STR: [/IFCCOLUMN/, /IFCBEAM/, /IFCFOOTING/, /IFCPILE/, /IFCSLAB/],
	PLU: [/IFCSANITARY/, /IFCPIPE/, /IFCFLOWSEGMENT/, /IFCFLOWFITTING/, /IFCFLOWTERMINAL/],
	MEP: [/IFCDUCT/, /IFCAIRTERMINAL/, /IFCFAN/, /IFCFLOWMOVING/, /IFCFLOWCONTROLLER/, /IFCFLOWSEGMENT/],
	ELE: [/IFCELECTRIC/, /IFCLIGHT/, /IFCCABLECARRIER/, /IFCOUTLET/, /IFCSWITCH/, /IFCDISTRIBUTION/, /IFCFLOWTERMINAL/],
	SITE: [],
};

// ── Date helpers (UTC / date-only, so no timezone off-by-one) ─────────────────────────────────────

const MS_PER_DAY = 86_400_000;
const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const PROJECT_START = DATA.overall.start;
const dayOf = (iso: string) => Math.round((utc(iso) - utc(PROJECT_START)) / MS_PER_DAY);

// The primary floor of a (possibly multi-floor) activity = its lowest by construction order.
function primaryFloor(floors: string[]): string | undefined {
	return [...floors].sort((a, b) => FLOOR_ORDER.indexOf(a as never) - FLOOR_ORDER.indexOf(b as never))[0];
}

function build(): Schedule {
	const activities = DATA.activities;
	const totalDays = dayOf(DATA.overall.finish);

	const tasks: ScheduleTask[] = [];
	const objects: ScheduleObject[] = [];

	for (const a of activities) {
		const discipline = a.disciplines[0] ?? "SITE";
		const floorCode = primaryFloor(a.floors);
		const storeyName = floorCode ? (FLOOR_TO_STOREY[floorCode] ?? null) : null;
		const storey = storeyName ?? "Site";
		const trade = tradeForActivity(discipline);
		const startDay = dayOf(a.plannedStart);
		const endDay = dayOf(a.plannedFinish);
		const duration = Math.max(1, endDay - startDay);

		tasks.push({
			id: a.code,
			name: a.name,
			objectId: a.code, // 1:1 task ↔ object
			activity: discipline,
			storey,
			phase: a.division,
			startDay,
			duration,
			startDate: a.plannedStart,
			endDate: a.plannedFinish,
			predecessors: [],
			tradeColor: trade.color,
			tradeLabel: trade.label,
			progress: a.approvedProgressPercent,
			status: a.status,
			criticalPath: a.criticalPath,
		});

		objects.push({
			id: a.code,
			label: a.name,
			storey,
			elevation: storeyName ? (STOREY_ELEVATION[storeyName] ?? 0) : 0,
			ifcType: discipline,
			activity: discipline,
			phase: a.division,
			count: duration, // nominal weight (days) — drives the build-up progress by schedule, not geometry
			guids: [],
			expressIDs: [],
			startDay,
			endDay,
			startDate: a.plannedStart,
			buildDate: a.plannedFinish,
			buildTaskId: a.code,
			storeyName,
			categories: DISCIPLINE_CATEGORIES[discipline] ?? [],
		});
	}

	// Milestones: when each model storey's last activity finishes (top → bottom by elevation).
	const lastFinishByStorey = new Map<string, number>();
	for (const t of tasks) {
		if (t.storey === "Site") continue;
		lastFinishByStorey.set(t.storey, Math.max(lastFinishByStorey.get(t.storey) ?? 0, t.startDay + t.duration));
	}
	const milestones: ScheduleMilestone[] = [...lastFinishByStorey.entries()]
		.map(([storey, day]) => ({
			id: `ms-${storey.replace(/\s+/g, "-").toLowerCase()}`,
			name: `${storey} complete`,
			day,
			date: dateForDay(day),
		}))
		.sort((a, b) => a.day - b.day);

	const phaseOrder = [...new Set(tasks.map((t) => t.phase))];
	const elementCount = objects.reduce((sum, o) => sum + o.count, 0);

	return {
		meta: {
			project: DATA.villa,
			projectStart: PROJECT_START,
			totalDays,
			endDate: DATA.overall.finish,
			dayUnit: "day",
			objectCount: objects.length,
			taskCount: tasks.length,
			elementCount,
			storeyOrder: STOREY_ORDER,
			phaseOrder,
		},
		milestones,
		objects,
		tasks,
	};
}

function dateForDay(day: number): string {
	return new Date(utc(PROJECT_START) + day * MS_PER_DAY).toISOString().slice(0, 10);
}

/** The real villa schedule, in the shape the timeline UI already consumes. */
export const VILLA_SCHEDULE: Schedule = build();
