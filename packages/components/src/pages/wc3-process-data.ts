// WC3 process fixture — extracted verbatim from window.__STORE__.state.processes / .instances of the
// unified-workspace prototype (apps/wc3-platform-web/prototypes/ontology-manager/06-unified-workspace.html,
// the "Store extension: processes" block) via Playwright. Not hand-authored.
//
// The prototype defines exactly TWO processes — proc_permit (7 states, 10 transitions) and proc_obs
// (5 states, 8 transitions) — plus the live instance rows the canvas counts as tokens
// (28 Work Permits, 65 Safety Observations). That is the whole of the real process data; the list
// view and its facets can only be as rich as those two rows.
//
// Product provenance is DERIVED, not stored: a process has no productKey field, so it is resolved
// through process.objectTypeId -> WC3_OBJECT_TYPES.installedBy.productKey. Both processes land on
// the "safety" product, so safety owns 2 processes and every other product owns 0.
//
// The fixture clock is frozen at 2026-07-22 08:00 exactly as in the prototype (FIXTURE_NOW); every
// age / SLA / bottleneck number is measured against it so the screens stay deterministic.
// All data is fictional (PROTOTYPE FIXTURE).

import {getObjectType} from "./wc3-ontology-data";

/* ------------------------------------------------------------------ types */

/** Lifecycle bucket a state sits in — drives the swimlane grouping and the state chip colour. */
export type Wc3ProcessStateCategory = "draft" | "pending" | "active" | "terminal";

/** Graph role of a state. Exactly one state is `initial`; `terminal` states only take reopen edges. */
export type Wc3ProcessStateType = "initial" | "intermediate" | "terminal";

/** How a token that reaches a terminal state ended. */
export type Wc3ProcessStateOutcome = "completed" | "rejected" | "cancelled";

/** Behavioural markers the prototype paints on a state box. */
export type Wc3ProcessStateFlag = "editableAnswers" | "mutableReceiver" | "authorizesWork" | "monitored" | "reopenable";

/** A state in a process graph. `value` is the literal stored in the row's status property. */
export type Wc3ProcessState = {
	id: string;
	/** Value written to `Wc3Process.statusProp` on an instance row sitting in this state. */
	value: string;
	name: string;
	category: Wc3ProcessStateCategory;
	type: Wc3ProcessStateType;
	flags: Wc3ProcessStateFlag[];
	/** Per-state SLA in hours; null when the state has none. Proposed governance layer. */
	slaHours: number | null;
	color: string;
	/** Present on terminal states only. */
	outcome?: Wc3ProcessStateOutcome;
	/** State added on top of the vendor default graph (not in wakecap-standard-v1). */
	custom?: boolean;
	/** State that does not exist in the as-built product yet — a proposed extension. */
	proposed?: boolean;
	/**
	 * Action type ids collected before a permit may REACH this state, on ANY incoming transition.
	 *
	 * On the STATE rather than on each edge because the requirement is a property of arriving here at
	 * all: put it on the edges and adding a seventh way in silently drops it.
	 */
	entryRequirements?: string[];
	/**
	 * Effect ids applied, IN ORDER, whenever a permit enters this state — in the commit phase, after
	 * the incoming edge's own effects. See WC3_PROCESS_EFFECTS.
	 */
	entryEffects?: string[];
};

/** Edge semantics — also the edge colour key in the canvas. */
export type Wc3ProcessTransitionKind = "forward" | "reject_loop" | "reopen" | "branch" | "extension_loop" | "close_out";

/** An edge in a process graph, bound to an ontology action type that enforces its rules. */
export type Wc3ProcessTransition = {
	id: string;
	/** Verb shown on the edge label; not unique (the same verb can leave several states). */
	key: string;
	/** Source state id (`Wc3ProcessState.id`). */
	from: string;
	/** Target state id (`Wc3ProcessState.id`); equals `from` on an extension loop. */
	to: string;
	/**
	 * Action type id in WC3_ACTION_TYPES — the enforcement point for this edge.
	 *
	 * `null` means DRAWN BUT NOT BOUND: a canvas drag creates the edge the moment it is dropped, and
	 * the binding is the one field a drag cannot supply. The edge is real, editable, undoable and on
	 * the canvas; it is simply not publishable yet, which lint rule L7 says and the publish gate
	 * enforces. Nothing else about a transition is optional — key, endpoints and kind are all derived
	 * at creation.
	 */
	actionTypeId: string | null;
	kind: Wc3ProcessTransitionKind;
	/** Role expected to fire the edge; a permit stage name or an HSE role. */
	actorRole: string;
	/** Human-readable guard expressions checked before the edge may fire. */
	guards: string[];
	/** Side effects worth surfacing next to the edge. */
	note?: string;
	/** Edge that does not exist in the as-built product yet — a proposed extension. */
	proposed?: boolean;
};

/** SLA hours keyed by an instance's severity, when the process is severity-driven rather than per-state. */
export type Wc3ProcessSlaBySeverity = {Critical: number; High: number; Medium: number; Low: number};

/** A first-class process definition bound to one object type. */
export type Wc3Process = {
	id: string;
	name: string;
	icon: string;
	/** Object type whose rows are the tokens of this process (id in WC3_OBJECT_TYPES). */
	objectTypeId: string;
	/** Property on an instance row that holds the current state `value`. */
	statusProp: string;
	/** Other object types the graph reads or writes without owning. */
	alsoTouches: string[];
	/** Where the lifecycle comes from and which parts are as-built vs. proposed. */
	evidenceNote: string;
	/** Severity-driven SLA table, or null when SLAs are per state. */
	slaBySeverity: Wc3ProcessSlaBySeverity | null;
	/** Caveat shown under the aging / bottleneck panel. */
	slaNote: string;
	states: Wc3ProcessState[];
	transitions: Wc3ProcessTransition[];
};

/** One row of `ot_permit` — a token of the Digital Work Permit process. */
export type Wc3PermitRow = {
	permit_id: string;
	permit_title: string;
	permit_type: string;
	permit_status: string;
	zone_id: string;
	receiver_worker_id: string;
	equipment_id: string | null;
	valid_from: string | null;
	valid_to: string | null;
	gas_test_done: boolean;
	isolations_confirmed: boolean;
	extension_hours: number;
	compliance_score: number;
	created_at: string;
	rejection_reason: string | null;
	closure_reason: string | null;
	crew_id: string;
	isolation_list: string;
	gas_test_readings: string | null;
};

/** One row of `ot_observation` — a token of the Observation Manager process. */
export type Wc3ObservationRow = {
	observation_id: string;
	observation_title: string;
	severity_level: string;
	observed_at: string;
	observation_status: string;
	corrective_action: string;
	hazard_tags: string;
	photo_ref: string;
	zone_id: string;
	reported_by: string;
	source: string;
	assigned_to: string | null;
	closed_at: string | null;
	closed_by: string | null;
	due_at: string;
};

/** A token row, read generically by the process helpers via `Wc3Process.statusProp`. */
export type Wc3ProcessInstanceRow = Record<string, string | number | boolean | null>;

/** A graph-validity violation reported by `processLint` (DWP engine rules L1–L7). */
export type Wc3ProcessLintError = {rule: string; msg: string};

/** One bar of the aging histogram behind the bottleneck analysis. */
export type Wc3ProcessAgingBucket = {label: string; maxHours: number; count: number; over: number};

/** A state ranked by how badly it is holding tokens up. */
export type Wc3ProcessBottleneck = {
	state: Wc3ProcessState;
	/** Tokens currently sitting in the state. */
	tokens: number;
	/** Of those, how many are past their SLA. */
	over: number;
	/** Share of tokens past SLA, 0–1. */
	overShare: number;
	/** Mean age in hours of the tokens in the state. */
	avgAgeHours: number;
	/** Oldest token age in hours. */
	maxAgeHours: number;
	/** SLA applied to the state, when it has one and the process is not severity-driven. */
	slaHours: number | null;
};

/* --------------------------------------------------------------- fixtures */

/**
 * The prototype's frozen clock. Every `created_at` / `observed_at` in this file is relative to it,
 * so ages and SLA breaches are stable rather than drifting with wall-clock time.
 */
export const WC3_PROCESS_FIXTURE_NOW = "2026-07-22 08:00";

/** `WC3_PROCESS_FIXTURE_NOW` as epoch ms. */
export const WC3_PROCESS_FIXTURE_NOW_MS = Date.parse("2026-07-22T08:00:00");

/** Every process defined in the prototype — there are exactly two. */
export const WC3_PROCESSES: Wc3Process[] = [
	{
		id: "proc_permit",
		name: "Digital Work Permit",
		icon: "wrench",
		objectTypeId: "ot_permit",
		statusProp: "permit_status",
		alsoTouches: ["ot_zone", "ot_worker", "ot_cert"],
		evidenceNote:
			"Lifecycle mirrors wakecap-standard-v1 (frontend-2.0-digital-work-permit). “Suspended” is a labeled custom state added to enable the occupancy gate; custom graphs may add such states.",
		slaBySeverity: null,
		slaNote:
			"State SLAs are a PROPOSED governance layer (the DWP engine exposes start_sla_timer effects; defaults define none).",
		states: [
			{
				id: "ps_draft",
				value: "draft",
				name: "Draft",
				category: "draft",
				type: "initial",
				flags: ["editableAnswers", "mutableReceiver"],
				slaHours: null,
				color: "#64748b",
			},
			{
				id: "ps_submitted",
				value: "submitted",
				name: "Submitted",
				category: "pending",
				type: "intermediate",
				flags: [],
				slaHours: 24,
				color: "#0ea5e9",
			},
			{
				id: "ps_inreview",
				value: "in_review",
				name: "In review",
				category: "pending",
				type: "intermediate",
				flags: [],
				slaHours: 48,
				color: "#d97706",
			},
			{
				id: "ps_issued",
				value: "issued",
				name: "Issued",
				category: "active",
				type: "intermediate",
				flags: ["authorizesWork", "monitored"],
				slaHours: null,
				color: "#16a34a",
			},
			{
				id: "ps_suspended",
				value: "suspended",
				name: "Suspended",
				category: "active",
				type: "intermediate",
				flags: ["monitored"],
				slaHours: 8,
				color: "#f59e0b",
				custom: true,
			},
			{
				id: "ps_closed",
				value: "closed",
				name: "Closed",
				category: "terminal",
				type: "terminal",
				outcome: "completed",
				flags: [],
				slaHours: null,
				color: "#334155",
			},
			{
				id: "ps_rejected",
				value: "rejected",
				name: "Rejected",
				category: "terminal",
				type: "terminal",
				outcome: "rejected",
				flags: ["reopenable"],
				slaHours: null,
				color: "#dc2626",
			},
		],
		transitions: [
			{
				id: "pt_submit",
				key: "submit",
				from: "ps_draft",
				to: "ps_submitted",
				actionTypeId: "at_submit_permit",
				kind: "forward",
				actorRole: "create",
				guards: ["form_complete", "crew/receiver data"],
			},
			{
				id: "pt_review",
				key: "start_review",
				from: "ps_submitted",
				to: "ps_inreview",
				actionTypeId: "at_start_permit_review",
				kind: "forward",
				actorRole: "review",
				guards: [],
			},
			{
				id: "pt_rej_sub",
				key: "reject_from_submitted",
				from: "ps_submitted",
				to: "ps_rejected",
				actionTypeId: "at_reject_permit",
				kind: "reject_loop",
				actorRole: "review",
				guards: ["reason REQUIRED"],
			},
			{
				id: "pt_rej_rev",
				key: "reject_from_review",
				from: "ps_inreview",
				to: "ps_rejected",
				actionTypeId: "at_reject_permit",
				kind: "reject_loop",
				actorRole: "review",
				guards: ["reason REQUIRED"],
			},
			{
				id: "pt_issue",
				key: "issue",
				from: "ps_inreview",
				to: "ps_issued",
				actionTypeId: "at_issue_permit",
				kind: "forward",
				actorRole: "issue",
				guards: [
					"validity_window_valid",
					"attachments_present(gas_test)",
					"field_predicate(isolations)",
					"field_predicate(receiver_cert_valid)",
				],
			},
			{
				id: "pt_suspend",
				key: "suspend",
				from: "ps_issued",
				to: "ps_suspended",
				actionTypeId: "at_suspend_permit",
				kind: "branch",
				actorRole: "issue",
				guards: [],
				note: "Effect: if zone occupancy > 0 → auto-raise Critical observation (Connected Worker)",
			},
			{
				id: "pt_resume",
				key: "resume",
				from: "ps_suspended",
				to: "ps_issued",
				actionTypeId: "at_resume_permit",
				kind: "forward",
				actorRole: "issue",
				guards: ["not_invalidated"],
			},
			{
				id: "pt_extend",
				key: "extend",
				from: "ps_issued",
				to: "ps_issued",
				actionTypeId: "at_extend_permit",
				kind: "extension_loop",
				actorRole: "issue",
				guards: ["extension_enabled", "extension_within_cap", "extension_hours_positive"],
			},
			{
				id: "pt_close",
				key: "close",
				from: "ps_issued",
				to: "ps_closed",
				actionTypeId: "at_close_permit",
				kind: "close_out",
				actorRole: "close",
				guards: ["early_closure_reason"],
			},
			{
				id: "pt_reopen_rej",
				key: "reopen_from_rejected",
				from: "ps_rejected",
				to: "ps_inreview",
				actionTypeId: "at_start_permit_review",
				kind: "reopen",
				actorRole: "review",
				guards: ["state.flags.reopenable"],
			},
		],
	},
	{
		id: "proc_obs",
		name: "Observation Manager",
		icon: "warning",
		objectTypeId: "ot_observation",
		statusProp: "observation_status",
		alsoTouches: ["ot_zone", "ot_worker"],
		evidenceNote:
			"As-built lifecycle from observation-manager-v2: New → Open → Closed / False Alarm with reopen edges. “Escalated” + severity SLAs are PROPOSED extensions (repo has no SLA model).",
		slaBySeverity: {Critical: 4, High: 24, Medium: 72, Low: 168},
		slaNote:
			"Severity SLAs (Critical 4 h · High 24 h · Medium 72 h · Low 168 h) are PROPOSED — the as-built model has only timeReceived.",
		states: [
			{
				id: "os_new",
				value: "New",
				name: "New",
				category: "pending",
				type: "initial",
				flags: [],
				slaHours: null,
				color: "#0ea5e9",
			},
			{
				id: "os_open",
				value: "Open",
				name: "Open",
				category: "active",
				type: "intermediate",
				flags: ["monitored"],
				slaHours: null,
				color: "#d97706",
			},
			{
				id: "os_escalated",
				value: "Escalated",
				name: "Escalated",
				category: "active",
				type: "intermediate",
				flags: ["monitored"],
				slaHours: null,
				color: "#dc2626",
				proposed: true,
			},
			{
				id: "os_closed",
				value: "Closed",
				name: "Closed",
				category: "terminal",
				type: "terminal",
				outcome: "completed",
				flags: ["reopenable"],
				slaHours: null,
				color: "#334155",
			},
			{
				id: "os_false",
				value: "False Alarm",
				name: "False Alarm",
				category: "terminal",
				type: "terminal",
				outcome: "cancelled",
				flags: ["reopenable"],
				slaHours: null,
				color: "#64748b",
			},
		],
		transitions: [
			{
				id: "ot_ack",
				key: "markOpen",
				from: "os_new",
				to: "os_open",
				actionTypeId: "at_open_observation",
				kind: "forward",
				actorRole: "HSE Manager",
				guards: [],
			},
			{
				id: "ot_close",
				key: "closeWithCloseout",
				from: "os_open",
				to: "os_closed",
				actionTypeId: "at_close_observation",
				kind: "close_out",
				actorRole: "HSE Manager",
				guards: ["closeout form complete"],
			},
			{
				id: "ot_fa_new",
				key: "markFalseAlarm",
				from: "os_new",
				to: "os_false",
				actionTypeId: "at_mark_false_alarm",
				kind: "branch",
				actorRole: "Safety Officer",
				guards: ["fixed-list reason"],
			},
			{
				id: "ot_fa_open",
				key: "markFalseAlarm",
				from: "os_open",
				to: "os_false",
				actionTypeId: "at_mark_false_alarm",
				kind: "branch",
				actorRole: "Safety Officer",
				guards: ["fixed-list reason"],
			},
			{
				id: "ot_reopen_c",
				key: "reopen",
				from: "os_closed",
				to: "os_open",
				actionTypeId: "at_reopen_observation",
				kind: "reopen",
				actorRole: "HSE Manager",
				guards: ["confirm dialog"],
			},
			{
				id: "ot_reopen_f",
				key: "reopen",
				from: "os_false",
				to: "os_open",
				actionTypeId: "at_reopen_observation",
				kind: "reopen",
				actorRole: "HSE Manager",
				guards: ["confirm dialog"],
			},
			{
				id: "ot_escalate",
				key: "escalate",
				from: "os_open",
				to: "os_escalated",
				actionTypeId: "at_escalate_observation",
				kind: "branch",
				actorRole: "HSE Manager",
				guards: ["over SLA (proposed)"],
				proposed: true,
			},
			{
				id: "ot_resolve",
				key: "closeEscalated",
				from: "os_escalated",
				to: "os_closed",
				actionTypeId: "at_close_observation",
				kind: "close_out",
				actorRole: "HSE Manager",
				guards: ["closeout form complete"],
				proposed: true,
			},
		],
	},
];

/** Token rows per object type, keyed by `Wc3Process.objectTypeId`. */
export const WC3_PROCESS_INSTANCES: {ot_permit: Wc3PermitRow[]; ot_observation: Wc3ObservationRow[]} = {
	ot_permit: [
		{
			permit_id: "PT-701",
			permit_title: "Hot work — welding L03 mezzanine",
			permit_type: "hot_work",
			permit_status: "draft",
			zone_id: "ZN-001",
			receiver_worker_id: "WK-2003",
			equipment_id: null,
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-21 14:10",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-01",
			isolation_list: "No isolations recorded",
			gas_test_readings: null,
		},
		{
			permit_id: "PT-702",
			permit_title: "Confined space — tank T2 inspection",
			permit_type: "confined_space",
			permit_status: "submitted",
			zone_id: "ZN-004",
			receiver_worker_id: "WK-2009",
			equipment_id: null,
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-21 09:30",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-10",
			isolation_list: "No isolations recorded",
			gas_test_readings: null,
		},
		{
			permit_id: "PT-703",
			permit_title: "Electrical — tie-in panel DB-4",
			permit_type: "electrical_work",
			permit_status: "in_review",
			zone_id: "ZN-001",
			receiver_worker_id: "WK-2007",
			equipment_id: null,
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-20 16:45",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-09",
			isolation_list: "No isolations recorded",
			gas_test_readings: null,
		},
		{
			permit_id: "PT-704",
			permit_title: "Hot work — rebar cutting L11 core",
			permit_type: "hot_work",
			permit_status: "issued",
			zone_id: "ZN-001",
			receiver_worker_id: "WK-2001",
			equipment_id: null,
			valid_from: "2026-07-22 06:00",
			valid_to: "2026-07-22 18:00",
			gas_test_done: true,
			isolations_confirmed: true,
			extension_hours: 0,
			compliance_score: 92.5,
			created_at: "2026-07-21 07:20",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-06",
			isolation_list: "Sprinkler zone 3 isolated at valve SV-03",
			gas_test_readings: "O₂ 20.9 % · LEL 0 % · H₂S 0 ppm · CO 0 ppm",
		},
		{
			permit_id: "PT-705",
			permit_title: "Work at height — facade access L05",
			permit_type: "work_at_height",
			permit_status: "issued",
			zone_id: "ZN-001",
			receiver_worker_id: "WK-2002",
			equipment_id: null,
			valid_from: "2026-07-21 06:00",
			valid_to: "2026-07-24 18:00",
			gas_test_done: false,
			isolations_confirmed: true,
			extension_hours: 2,
			compliance_score: 88,
			created_at: "2026-07-20 11:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-14",
			isolation_list: "Gas supply to plant room isolated",
			gas_test_readings: null,
		},
		{
			permit_id: "PT-706",
			permit_title: "Excavation — trench extension grid D",
			permit_type: "excavation",
			permit_status: "suspended",
			zone_id: "ZN-004",
			receiver_worker_id: "WK-2009",
			equipment_id: "EQ-503",
			valid_from: "2026-07-21 06:00",
			valid_to: "2026-07-23 18:00",
			gas_test_done: false,
			isolations_confirmed: true,
			extension_hours: 0,
			compliance_score: 74,
			created_at: "2026-07-20 08:15",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-11",
			isolation_list: "Sprinkler zone 3 isolated at valve SV-03",
			gas_test_readings: null,
		},
		{
			permit_id: "PT-707",
			permit_title: "Cold work — scaffold modification L02",
			permit_type: "cold_work",
			permit_status: "closed",
			zone_id: "ZN-001",
			receiver_worker_id: "WK-2004",
			equipment_id: null,
			valid_from: "2026-07-19 06:00",
			valid_to: "2026-07-19 18:00",
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 96,
			created_at: "2026-07-18 13:00",
			rejection_reason: null,
			closure_reason: "Work complete",
			crew_id: "CR-06",
			isolation_list: "No isolations recorded",
			gas_test_readings: null,
		},
		{
			permit_id: "PT-708",
			permit_title: "Lifting ops — core jump L12 (TC-1)",
			permit_type: "lifting",
			permit_status: "issued",
			zone_id: "ZN-002",
			receiver_worker_id: "WK-2006",
			equipment_id: "EQ-501",
			valid_from: "2026-07-22 06:00",
			valid_to: "2026-07-23 18:00",
			gas_test_done: false,
			isolations_confirmed: true,
			extension_hours: 0,
			compliance_score: 91,
			created_at: "2026-07-21 15:40",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-14",
			isolation_list: "Sprinkler zone 3 isolated at valve SV-03",
			gas_test_readings: null,
		},
		{
			permit_id: "PT-709",
			permit_title: "Radiography — weld NDT laydown",
			permit_type: "radiography",
			permit_status: "rejected",
			zone_id: "ZN-003",
			receiver_worker_id: "WK-2008",
			equipment_id: null,
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-19 10:05",
			rejection_reason: "RPS not appointed; source transport docs missing",
			closure_reason: null,
			crew_id: "CR-12",
			isolation_list: "No isolations recorded",
			gas_test_readings: null,
		},
		{
			permit_id: "PT-710",
			permit_title: "Hot work — cutting roof deck",
			permit_type: "hot_work",
			permit_status: "draft",
			zone_id: "ZN-001",
			receiver_worker_id: "WK-2071",
			equipment_id: "EQ-506",
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-20 00:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-01",
			gas_test_readings: null,
			isolation_list: "No isolations recorded",
		},
		{
			permit_id: "PT-711",
			permit_title: "Cold work — blockwork B01",
			permit_type: "cold_work",
			permit_status: "draft",
			zone_id: "ZN-012",
			receiver_worker_id: "WK-2139",
			equipment_id: null,
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-18 07:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-08",
			gas_test_readings: null,
			isolation_list: "No isolations recorded",
		},
		{
			permit_id: "PT-712",
			permit_title: "Confined space — sump inspection L04",
			permit_type: "confined_space",
			permit_status: "submitted",
			zone_id: "ZN-012",
			receiver_worker_id: "WK-2060",
			equipment_id: null,
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-18 11:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-10",
			gas_test_readings: null,
			isolation_list: "No isolations recorded",
		},
		{
			permit_id: "PT-713",
			permit_title: "Work at height — facade access L04",
			permit_type: "work_at_height",
			permit_status: "submitted",
			zone_id: "ZN-007",
			receiver_worker_id: "WK-2117",
			equipment_id: null,
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-21 02:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-11",
			gas_test_readings: null,
			isolation_list: "No isolations recorded",
		},
		{
			permit_id: "PT-714",
			permit_title: "Excavation — pile cap L01",
			permit_type: "excavation",
			permit_status: "in_review",
			zone_id: "ZN-003",
			receiver_worker_id: "WK-2048",
			equipment_id: "EQ-506",
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-21 00:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-10",
			gas_test_readings: null,
			isolation_list: "No isolations recorded",
		},
		{
			permit_id: "PT-715",
			permit_title: "Electrical — cable termination L02",
			permit_type: "electrical_work",
			permit_status: "in_review",
			zone_id: "ZN-003",
			receiver_worker_id: "WK-2090",
			equipment_id: null,
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-20 13:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-01",
			gas_test_readings: null,
			isolation_list: "No isolations recorded",
		},
		{
			permit_id: "PT-716",
			permit_title: "Radiography — weld NDT L04",
			permit_type: "radiography",
			permit_status: "in_review",
			zone_id: "ZN-002",
			receiver_worker_id: "WK-2117",
			equipment_id: null,
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-20 19:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-12",
			gas_test_readings: null,
			isolation_list: "No isolations recorded",
		},
		{
			permit_id: "PT-717",
			permit_title: "Hot work — cutting L03",
			permit_type: "hot_work",
			permit_status: "issued",
			zone_id: "ZN-012",
			receiver_worker_id: "WK-2125",
			equipment_id: null,
			valid_from: "2026-07-21 01:00",
			valid_to: "2026-07-22 23:00",
			gas_test_done: true,
			isolations_confirmed: true,
			extension_hours: 0,
			compliance_score: 81.6,
			created_at: "2026-07-20 16:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-03",
			gas_test_readings: "O₂ 20.6 % · LEL 0 % · H₂S 0 ppm · CO 2 ppm",
			isolation_list: "DB-4 breaker locked & tagged (LOTO-118)",
		},
		{
			permit_id: "PT-718",
			permit_title: "Cold work — scaffold modification L01",
			permit_type: "cold_work",
			permit_status: "issued",
			zone_id: "ZN-001",
			receiver_worker_id: "WK-2048",
			equipment_id: null,
			valid_from: "2026-07-20 19:00",
			valid_to: "2026-07-22 02:00",
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 79.2,
			created_at: "2026-07-20 08:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-11",
			gas_test_readings: null,
			isolation_list: "Sprinkler zone 3 isolated at valve SV-03",
		},
		{
			permit_id: "PT-719",
			permit_title: "Confined space — riser shaft entry L05",
			permit_type: "confined_space",
			permit_status: "issued",
			zone_id: "ZN-013",
			receiver_worker_id: "WK-2090",
			equipment_id: null,
			valid_from: "2026-07-20 03:00",
			valid_to: "2026-07-22 01:00",
			gas_test_done: true,
			isolations_confirmed: true,
			extension_hours: 0,
			compliance_score: 89.6,
			created_at: "2026-07-20 00:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-07",
			gas_test_readings: "O₂ 21.0 % · LEL 0 % · H₂S 0 ppm · CO 2 ppm",
			isolation_list: "Gas supply to plant room isolated",
		},
		{
			permit_id: "PT-720",
			permit_title: "Work at height — facade access L05",
			permit_type: "work_at_height",
			permit_status: "issued",
			zone_id: "ZN-011",
			receiver_worker_id: "WK-2137",
			equipment_id: "EQ-501",
			valid_from: "2026-07-21 20:00",
			valid_to: "2026-07-22 18:00",
			gas_test_done: false,
			isolations_confirmed: true,
			extension_hours: 0,
			compliance_score: 75.8,
			created_at: "2026-07-21 08:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-04",
			gas_test_readings: null,
			isolation_list: "No isolations required",
		},
		{
			permit_id: "PT-721",
			permit_title: "Excavation — pile cap B01",
			permit_type: "excavation",
			permit_status: "issued",
			zone_id: "ZN-002",
			receiver_worker_id: "WK-2110",
			equipment_id: null,
			valid_from: "2026-07-20 09:00",
			valid_to: "2026-07-22 02:00",
			gas_test_done: false,
			isolations_confirmed: true,
			extension_hours: 3,
			compliance_score: 89.8,
			created_at: "2026-07-20 05:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-11",
			gas_test_readings: null,
			isolation_list: "Lift 2 immobilised at L00",
		},
		{
			permit_id: "PT-722",
			permit_title: "Electrical — DB energisation L05",
			permit_type: "electrical_work",
			permit_status: "issued",
			zone_id: "ZN-007",
			receiver_worker_id: "WK-2099",
			equipment_id: null,
			valid_from: "2026-07-20 18:00",
			valid_to: "2026-07-22 18:00",
			gas_test_done: false,
			isolations_confirmed: true,
			extension_hours: 0,
			compliance_score: 76.4,
			created_at: "2026-07-20 12:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-08",
			gas_test_readings: null,
			isolation_list: "CHW valve V-207 closed & chained",
		},
		{
			permit_id: "PT-723",
			permit_title: "Radiography — weld NDT L03",
			permit_type: "radiography",
			permit_status: "closed",
			zone_id: "ZN-011",
			receiver_worker_id: "WK-2134",
			equipment_id: null,
			valid_from: "2026-07-11 14:00",
			valid_to: "2026-07-12 02:00",
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 1,
			compliance_score: 95.9,
			created_at: "2026-07-11 03:00",
			rejection_reason: null,
			closure_reason: "Work complete",
			crew_id: "CR-10",
			gas_test_readings: null,
			isolation_list: "Lift 2 immobilised at L00",
		},
		{
			permit_id: "PT-724",
			permit_title: "Hot work — grinding L04",
			permit_type: "hot_work",
			permit_status: "closed",
			zone_id: "ZN-013",
			receiver_worker_id: "WK-2139",
			equipment_id: null,
			valid_from: "2026-07-11 03:00",
			valid_to: "2026-07-11 21:00",
			gas_test_done: true,
			isolations_confirmed: true,
			extension_hours: 5,
			compliance_score: 93.7,
			created_at: "2026-07-10 19:00",
			rejection_reason: null,
			closure_reason: "Scope handed to follow-on permit",
			crew_id: "CR-12",
			gas_test_readings: "O₂ 20.7 % · LEL 0 % · H₂S 0 ppm · CO 0 ppm",
			isolation_list: "DB-4 breaker locked & tagged (LOTO-118)",
		},
		{
			permit_id: "PT-725",
			permit_title: "Cold work — scaffold modification L02",
			permit_type: "cold_work",
			permit_status: "closed",
			zone_id: "ZN-014",
			receiver_worker_id: "WK-2138",
			equipment_id: null,
			valid_from: "2026-07-13 09:00",
			valid_to: "2026-07-14 22:00",
			gas_test_done: false,
			isolations_confirmed: true,
			extension_hours: 1,
			compliance_score: 80.4,
			created_at: "2026-07-12 19:00",
			rejection_reason: null,
			closure_reason: "Scope handed to follow-on permit",
			crew_id: "CR-11",
			gas_test_readings: null,
			isolation_list: "Lift 2 immobilised at L00",
		},
		{
			permit_id: "PT-726",
			permit_title: "Confined space — sump inspection L02",
			permit_type: "confined_space",
			permit_status: "closed",
			zone_id: "ZN-011",
			receiver_worker_id: "WK-2081",
			equipment_id: null,
			valid_from: "2026-07-18 22:00",
			valid_to: "2026-07-19 21:00",
			gas_test_done: true,
			isolations_confirmed: true,
			extension_hours: 0,
			compliance_score: 75.5,
			created_at: "2026-07-18 20:00",
			rejection_reason: null,
			closure_reason: "Scope handed to follow-on permit",
			crew_id: "CR-09",
			gas_test_readings: "O₂ 21.0 % · LEL 0 % · H₂S 0 ppm · CO 0 ppm",
			isolation_list: "No isolations required",
		},
		{
			permit_id: "PT-727",
			permit_title: "Work at height — facade access L01",
			permit_type: "work_at_height",
			permit_status: "rejected",
			zone_id: "ZN-011",
			receiver_worker_id: "WK-2137",
			equipment_id: null,
			valid_from: null,
			valid_to: null,
			gas_test_done: false,
			isolations_confirmed: false,
			extension_hours: 0,
			compliance_score: 0,
			created_at: "2026-07-20 22:00",
			rejection_reason: "Isolation certificate missing",
			closure_reason: null,
			crew_id: "CR-12",
			gas_test_readings: null,
			isolation_list: "No isolations recorded",
		},
		{
			permit_id: "PT-728",
			permit_title: "Excavation — pile cap L04",
			permit_type: "excavation",
			permit_status: "suspended",
			zone_id: "ZN-002",
			receiver_worker_id: "WK-2138",
			equipment_id: null,
			valid_from: "2026-07-21 03:00",
			valid_to: "2026-07-22 16:00",
			gas_test_done: false,
			isolations_confirmed: true,
			extension_hours: 0,
			compliance_score: 92.5,
			created_at: "2026-07-20 22:00",
			rejection_reason: null,
			closure_reason: null,
			crew_id: "CR-09",
			gas_test_readings: null,
			isolation_list: "Gas supply to plant room isolated",
		},
	],
	ot_observation: [
		{
			observation_id: "OBS-401",
			observation_title: "Unguarded edge at core L10",
			severity_level: "High",
			observed_at: "2026-07-20 10:12",
			observation_status: "Open",
			corrective_action: "Install edge protection before next pour",
			hazard_tags: "fall-from-height",
			photo_ref: "media://obs/OBS-401.jpg",
			zone_id: "ZN-001",
			reported_by: "WK-2010",
			source: "manual",
			assigned_to: null,
			closed_at: null,
			closed_by: null,
			due_at: "2026-07-21 07:12",
		},
		{
			observation_id: "OBS-402",
			observation_title: "Hoist gate interlock bypassed",
			severity_level: "Critical",
			observed_at: "2026-07-21 08:40",
			observation_status: "New",
			corrective_action: "Stop hoist use; replace interlock",
			hazard_tags: "lifting,mechanical",
			photo_ref: "media://obs/OBS-402.jpg",
			zone_id: "ZN-002",
			reported_by: "WK-2006",
			source: "AI Camera",
			assigned_to: null,
			closed_at: null,
			closed_by: null,
			due_at: "2026-07-21 09:40",
		},
		{
			observation_id: "OBS-403",
			observation_title: "Good catch: rebar caps installed proactively",
			severity_level: "Low",
			observed_at: "2026-07-19 14:05",
			observation_status: "Closed",
			corrective_action: "None — positive intervention",
			hazard_tags: "housekeeping",
			photo_ref: "media://obs/OBS-403.jpg",
			zone_id: "ZN-001",
			reported_by: "WK-2002",
			source: "manual",
			assigned_to: null,
			closed_at: null,
			closed_by: null,
			due_at: "2026-07-26 11:05",
		},
		{
			observation_id: "OBS-404",
			observation_title: "Excavation shoring gap grid D4",
			severity_level: "High",
			observed_at: "2026-07-21 15:20",
			observation_status: "Open",
			corrective_action: "Trench box installed",
			hazard_tags: "excavation",
			photo_ref: "media://obs/OBS-404.jpg",
			zone_id: "ZN-004",
			reported_by: "WK-2009",
			source: "manual",
			assigned_to: null,
			closed_at: null,
			closed_by: null,
			due_at: "2026-07-22 12:20",
		},
		{
			observation_id: "OBS-405",
			observation_title: "Slab pour crew missing hi-viz",
			severity_level: "Medium",
			observed_at: "2026-07-22 06:55",
			observation_status: "New",
			corrective_action: "Toolbox talk on PPE",
			hazard_tags: "ppe",
			photo_ref: "media://obs/OBS-405.jpg",
			zone_id: "ZN-005",
			reported_by: "WK-2010",
			source: "AI Camera",
			assigned_to: null,
			closed_at: null,
			closed_by: null,
			due_at: "2026-07-25 03:55",
		},
		{
			observation_id: "OBS-406",
			observation_title: "Unprotected leading edge — Podium Fit-out Area",
			severity_level: "Medium",
			observed_at: "2026-07-22 00:27",
			observation_status: "New",
			corrective_action: "",
			hazard_tags: "fall-from-height",
			photo_ref: "media://obs/OBS-406.jpg",
			zone_id: "ZN-007",
			reported_by: "WK-2140",
			source: "manual",
			assigned_to: null,
			due_at: "2026-07-25 00:27",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-407",
			observation_title: "Housekeeping — offcuts blocking egress — Site Welfare & Offices",
			severity_level: "High",
			observed_at: "2026-07-16 15:50",
			observation_status: "Escalated",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "housekeeping",
			photo_ref: "media://obs/OBS-407.jpg",
			zone_id: "ZN-014",
			reported_by: "WK-2092",
			source: "Asset alert",
			assigned_to: "WK-2072",
			due_at: "2026-07-17 15:50",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-408",
			observation_title: "Worker without harness on facade deck — Podium Fit-out Area",
			severity_level: "Medium",
			observed_at: "2026-06-17 18:21",
			observation_status: "Closed",
			corrective_action: "Area barriered and re-inspected",
			hazard_tags: "fall-from-height",
			photo_ref: "media://obs/OBS-408.jpg",
			zone_id: "ZN-007",
			reported_by: "WK-2101",
			source: "BIM clash",
			assigned_to: "WK-2129",
			due_at: "2026-06-20 18:21",
			closed_at: "2026-06-19 19:21",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-409",
			observation_title: "Damaged scaffold toe board — Basement Plant Room",
			severity_level: "Medium",
			observed_at: "2026-06-27 01:00",
			observation_status: "False Alarm",
			corrective_action: "Permit re-issued with additional controls",
			hazard_tags: "scaffold",
			photo_ref: "media://obs/OBS-409.jpg",
			zone_id: "ZN-008",
			reported_by: "WK-2026",
			source: "manual",
			assigned_to: null,
			due_at: "2026-06-30 01:00",
			closed_at: "2026-06-27 08:00",
			closed_by: "WK-2142",
		},
		{
			observation_id: "OBS-410",
			observation_title: "Uncapped rebar starter bars — North Laydown Yard",
			severity_level: "High",
			observed_at: "2026-07-14 10:27",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "impalement",
			photo_ref: "media://obs/OBS-410.jpg",
			zone_id: "ZN-003",
			reported_by: "WK-2069",
			source: "Environmental sensor",
			assigned_to: "WK-2128",
			due_at: "2026-07-15 10:27",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-411",
			observation_title: "Cable trailing across walkway — Gate 2 Logistics Yard",
			severity_level: "Medium",
			observed_at: "2026-06-07 17:22",
			observation_status: "Closed",
			corrective_action: "Permit re-issued with additional controls",
			hazard_tags: "electrical",
			photo_ref: "media://obs/OBS-411.jpg",
			zone_id: "ZN-013",
			reported_by: "WK-2142",
			source: "AI Camera",
			assigned_to: "WK-2103",
			due_at: "2026-06-10 17:22",
			closed_at: "2026-06-10 18:22",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-412",
			observation_title: "Missing fire extinguisher at hot-work station — Gate 2 Logistics Yard",
			severity_level: "High",
			observed_at: "2026-07-07 15:10",
			observation_status: "Closed",
			corrective_action: "Method statement re-briefed",
			hazard_tags: "fire",
			photo_ref: "media://obs/OBS-412.jpg",
			zone_id: "ZN-013",
			reported_by: "WK-2140",
			source: "manual",
			assigned_to: "WK-2098",
			due_at: "2026-07-08 15:10",
			closed_at: "2026-07-11 13:10",
			closed_by: "WK-2141",
		},
		{
			observation_id: "OBS-413",
			observation_title: "Excavation edge not barricaded — MEP Riser Shafts",
			severity_level: "Medium",
			observed_at: "2026-07-20 19:15",
			observation_status: "New",
			corrective_action: "",
			hazard_tags: "excavation",
			photo_ref: "media://obs/OBS-413.jpg",
			zone_id: "ZN-010",
			reported_by: "WK-2049",
			source: "AI Camera",
			assigned_to: null,
			due_at: "2026-07-23 19:15",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-414",
			observation_title: "Load left suspended over walkway — Hoist Zone A",
			severity_level: "High",
			observed_at: "2026-07-17 21:31",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "lifting",
			photo_ref: "media://obs/OBS-414.jpg",
			zone_id: "ZN-002",
			reported_by: "WK-2017",
			source: "BIM clash",
			assigned_to: "WK-2089",
			due_at: "2026-07-18 21:31",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-415",
			observation_title: "Spoil stockpile too close to trench — South Excavation Pit",
			severity_level: "Low",
			observed_at: "2026-07-13 18:59",
			observation_status: "Closed",
			corrective_action: "Toolbox talk delivered to the crew",
			hazard_tags: "excavation",
			photo_ref: "media://obs/OBS-415.jpg",
			zone_id: "ZN-004",
			reported_by: "WK-2142",
			source: "AI Camera",
			assigned_to: "WK-2043",
			due_at: "2026-07-20 18:59",
			closed_at: "2026-07-15 10:59",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-416",
			observation_title: "Hoist gate left open — Podium Fit-out Area",
			severity_level: "Low",
			observed_at: "2026-06-26 08:58",
			observation_status: "False Alarm",
			corrective_action: "Defective equipment quarantined",
			hazard_tags: "lifting,mechanical",
			photo_ref: "media://obs/OBS-416.jpg",
			zone_id: "ZN-007",
			reported_by: "WK-2092",
			source: "BIM clash",
			assigned_to: null,
			due_at: "2026-07-03 08:58",
			closed_at: "2026-06-28 19:58",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-417",
			observation_title: "PPE — no eye protection during grinding — Gate 2 Logistics Yard",
			severity_level: "Low",
			observed_at: "2026-07-15 22:03",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "ppe",
			photo_ref: "media://obs/OBS-417.jpg",
			zone_id: "ZN-013",
			reported_by: "WK-2141",
			source: "Radar",
			assigned_to: "WK-2128",
			due_at: "2026-07-22 22:03",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-418",
			observation_title: "Good catch: gas bottles re-secured — Podium Fit-out Area",
			severity_level: "Low",
			observed_at: "2026-07-02 23:42",
			observation_status: "Closed",
			corrective_action: "Housekeeping crew cleared the area",
			hazard_tags: "housekeeping",
			photo_ref: "media://obs/OBS-418.jpg",
			zone_id: "ZN-007",
			reported_by: "WK-2034",
			source: "BIM clash",
			assigned_to: "WK-2010",
			due_at: "2026-07-09 23:42",
			closed_at: "2026-07-06 17:42",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-419",
			observation_title: "Oil spill near generator GEN-115 — Blockwork Bay L02",
			severity_level: "Medium",
			observed_at: "2026-07-06 16:23",
			observation_status: "Closed",
			corrective_action: "Housekeeping crew cleared the area",
			hazard_tags: "environment",
			photo_ref: "media://obs/OBS-419.jpg",
			zone_id: "ZN-011",
			reported_by: "WK-2140",
			source: "AI Camera",
			assigned_to: "WK-2138",
			due_at: "2026-07-09 16:23",
			closed_at: "2026-07-09 04:23",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-420",
			observation_title: "Unlabelled chemical container — MEP Riser Shafts",
			severity_level: "High",
			observed_at: "2026-07-21 06:29",
			observation_status: "New",
			corrective_action: "",
			hazard_tags: "coshh",
			photo_ref: "media://obs/OBS-420.jpg",
			zone_id: "ZN-010",
			reported_by: "WK-2076",
			source: "manual",
			assigned_to: null,
			due_at: "2026-07-22 06:29",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-421",
			observation_title: "Temporary lighting insufficient in riser — Blockwork Bay L02",
			severity_level: "Medium",
			observed_at: "2026-07-15 03:18",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "electrical",
			photo_ref: "media://obs/OBS-421.jpg",
			zone_id: "ZN-011",
			reported_by: "WK-2141",
			source: "BIM clash",
			assigned_to: "WK-2024",
			due_at: "2026-07-18 03:18",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-422",
			observation_title: "Blocked emergency assembly route — Gate 2 Logistics Yard",
			severity_level: "Medium",
			observed_at: "2026-07-16 04:08",
			observation_status: "Closed",
			corrective_action: "Housekeeping crew cleared the area",
			hazard_tags: "emergency",
			photo_ref: "media://obs/OBS-422.jpg",
			zone_id: "ZN-013",
			reported_by: "WK-2010",
			source: "Radar",
			assigned_to: "WK-2119",
			due_at: "2026-07-19 04:08",
			closed_at: "2026-07-19 03:08",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-423",
			observation_title: "Untrained operator on telehandler — South Excavation Pit",
			severity_level: "Medium",
			observed_at: "2026-06-20 11:50",
			observation_status: "False Alarm",
			corrective_action: "Permit re-issued with additional controls",
			hazard_tags: "plant",
			photo_ref: "media://obs/OBS-423.jpg",
			zone_id: "ZN-004",
			reported_by: "WK-2141",
			source: "Asset alert",
			assigned_to: null,
			due_at: "2026-06-23 11:50",
			closed_at: "2026-06-24 06:50",
			closed_by: "WK-2010",
		},
		{
			observation_id: "OBS-424",
			observation_title: "Hot works without fire watch — South Excavation Pit",
			severity_level: "High",
			observed_at: "2026-07-16 15:16",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "fire",
			photo_ref: "media://obs/OBS-424.jpg",
			zone_id: "ZN-004",
			reported_by: "WK-2141",
			source: "Connected Worker",
			assigned_to: "WK-2005",
			due_at: "2026-07-17 15:16",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-425",
			observation_title: "Dust suppression not running at cutting station — MEP Riser Shafts",
			severity_level: "High",
			observed_at: "2026-07-11 18:15",
			observation_status: "Closed",
			corrective_action: "Housekeeping crew cleared the area",
			hazard_tags: "health",
			photo_ref: "media://obs/OBS-425.jpg",
			zone_id: "ZN-010",
			reported_by: "WK-2062",
			source: "Connected Worker",
			assigned_to: "WK-2139",
			due_at: "2026-07-12 18:15",
			closed_at: "2026-07-14 07:15",
			closed_by: "WK-2010",
		},
		{
			observation_id: "OBS-426",
			observation_title: "Confined space entry log incomplete — Gate 2 Logistics Yard",
			severity_level: "High",
			observed_at: "2026-06-12 04:20",
			observation_status: "Closed",
			corrective_action: "Area barriered and re-inspected",
			hazard_tags: "confined-space",
			photo_ref: "media://obs/OBS-426.jpg",
			zone_id: "ZN-013",
			reported_by: "WK-2124",
			source: "manual",
			assigned_to: "WK-2077",
			due_at: "2026-06-13 04:20",
			closed_at: "2026-06-13 20:20",
			closed_by: "WK-2010",
		},
		{
			observation_id: "OBS-427",
			observation_title: "Welfare — drinking water station empty — Blockwork Bay L02",
			severity_level: "Medium",
			observed_at: "2026-07-21 15:44",
			observation_status: "New",
			corrective_action: "",
			hazard_tags: "welfare",
			photo_ref: "media://obs/OBS-427.jpg",
			zone_id: "ZN-011",
			reported_by: "WK-2035",
			source: "Environmental sensor",
			assigned_to: null,
			due_at: "2026-07-24 15:44",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-428",
			observation_title: "Guardrail removed and not reinstated — North Laydown Yard",
			severity_level: "High",
			observed_at: "2026-07-20 00:17",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "fall-from-height",
			photo_ref: "media://obs/OBS-428.jpg",
			zone_id: "ZN-003",
			reported_by: "WK-2101",
			source: "BIM clash",
			assigned_to: "WK-2125",
			due_at: "2026-07-21 00:17",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-429",
			observation_title: "Near miss: dropped hand tool from L03 — South Excavation Pit",
			severity_level: "High",
			observed_at: "2026-07-14 05:47",
			observation_status: "Closed",
			corrective_action: "Defective equipment quarantined",
			hazard_tags: "dropped-object",
			photo_ref: "media://obs/OBS-429.jpg",
			zone_id: "ZN-004",
			reported_by: "WK-2022",
			source: "Environmental sensor",
			assigned_to: "WK-2077",
			due_at: "2026-07-15 05:47",
			closed_at: "2026-07-17 06:47",
			closed_by: "WK-2141",
		},
		{
			observation_id: "OBS-430",
			observation_title: "Positive: crew stopped work for wind speed — Gate 2 Logistics Yard",
			severity_level: "High",
			observed_at: "2026-07-13 10:08",
			observation_status: "False Alarm",
			corrective_action: "Area barriered and re-inspected",
			hazard_tags: "behaviour",
			photo_ref: "media://obs/OBS-430.jpg",
			zone_id: "ZN-013",
			reported_by: "WK-2133",
			source: "manual",
			assigned_to: null,
			due_at: "2026-07-14 10:08",
			closed_at: "2026-07-16 18:08",
			closed_by: "WK-2142",
		},
		{
			observation_id: "OBS-431",
			observation_title: "Unprotected leading edge — Tower Core L01–L10",
			severity_level: "Medium",
			observed_at: "2026-07-14 19:59",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "fall-from-height",
			photo_ref: "media://obs/OBS-431.jpg",
			zone_id: "ZN-001",
			reported_by: "WK-2041",
			source: "BIM clash",
			assigned_to: "WK-2036",
			due_at: "2026-07-17 19:59",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-432",
			observation_title: "Housekeeping — offcuts blocking egress — Podium Fit-out Area",
			severity_level: "Medium",
			observed_at: "2026-05-29 14:00",
			observation_status: "Closed",
			corrective_action: "Area barriered and re-inspected",
			hazard_tags: "housekeeping",
			photo_ref: "media://obs/OBS-432.jpg",
			zone_id: "ZN-007",
			reported_by: "WK-2017",
			source: "BIM clash",
			assigned_to: "WK-2034",
			due_at: "2026-06-01 14:00",
			closed_at: "2026-06-02 08:00",
			closed_by: "WK-2142",
		},
		{
			observation_id: "OBS-433",
			observation_title: "Worker without harness on facade deck — South Excavation Pit",
			severity_level: "High",
			observed_at: "2026-06-29 00:50",
			observation_status: "Closed",
			corrective_action: "Toolbox talk delivered to the crew",
			hazard_tags: "fall-from-height",
			photo_ref: "media://obs/OBS-433.jpg",
			zone_id: "ZN-004",
			reported_by: "WK-2142",
			source: "BIM clash",
			assigned_to: "WK-2082",
			due_at: "2026-06-30 00:50",
			closed_at: "2026-07-01 22:50",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-434",
			observation_title: "Damaged scaffold toe board — Roof Plant Deck",
			severity_level: "High",
			observed_at: "2026-07-21 21:45",
			observation_status: "New",
			corrective_action: "",
			hazard_tags: "scaffold",
			photo_ref: "media://obs/OBS-434.jpg",
			zone_id: "ZN-012",
			reported_by: "WK-2105",
			source: "AI Camera",
			assigned_to: null,
			due_at: "2026-07-22 21:45",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-435",
			observation_title: "Uncapped rebar starter bars — South Excavation Pit",
			severity_level: "Medium",
			observed_at: "2026-07-21 19:47",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "impalement",
			photo_ref: "media://obs/OBS-435.jpg",
			zone_id: "ZN-004",
			reported_by: "WK-2142",
			source: "AI Camera",
			assigned_to: "WK-2092",
			due_at: "2026-07-24 19:47",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-436",
			observation_title: "Cable trailing across walkway — North Laydown Yard",
			severity_level: "Critical",
			observed_at: "2026-07-18 04:12",
			observation_status: "Closed",
			corrective_action: "Method statement re-briefed",
			hazard_tags: "electrical",
			photo_ref: "media://obs/OBS-436.jpg",
			zone_id: "ZN-003",
			reported_by: "WK-2070",
			source: "BIM clash",
			assigned_to: "WK-2131",
			due_at: "2026-07-18 08:12",
			closed_at: "2026-07-21 19:12",
			closed_by: "WK-2141",
		},
		{
			observation_id: "OBS-437",
			observation_title: "Missing fire extinguisher at hot-work station — MEP Riser Shafts",
			severity_level: "Low",
			observed_at: "2026-06-30 11:57",
			observation_status: "Closed",
			corrective_action: "Housekeeping crew cleared the area",
			hazard_tags: "fire",
			photo_ref: "media://obs/OBS-437.jpg",
			zone_id: "ZN-010",
			reported_by: "WK-2022",
			source: "AI Camera",
			assigned_to: "WK-2144",
			due_at: "2026-07-07 11:57",
			closed_at: "2026-07-01 21:57",
			closed_by: "WK-2141",
		},
		{
			observation_id: "OBS-438",
			observation_title: "Excavation edge not barricaded — Roof Plant Deck",
			severity_level: "High",
			observed_at: "2026-07-15 12:34",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "excavation",
			photo_ref: "media://obs/OBS-438.jpg",
			zone_id: "ZN-012",
			reported_by: "WK-2140",
			source: "Asset alert",
			assigned_to: "WK-2077",
			due_at: "2026-07-16 12:34",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-439",
			observation_title: "Load left suspended over walkway — Basement Plant Room",
			severity_level: "Medium",
			observed_at: "2026-06-29 02:40",
			observation_status: "Closed",
			corrective_action: "Permit re-issued with additional controls",
			hazard_tags: "lifting",
			photo_ref: "media://obs/OBS-439.jpg",
			zone_id: "ZN-008",
			reported_by: "WK-2007",
			source: "AI Camera",
			assigned_to: "WK-2007",
			due_at: "2026-07-02 02:40",
			closed_at: "2026-07-02 13:40",
			closed_by: "WK-2010",
		},
		{
			observation_id: "OBS-440",
			observation_title: "Spoil stockpile too close to trench — Blockwork Bay L02",
			severity_level: "Critical",
			observed_at: "2026-06-17 00:12",
			observation_status: "Closed",
			corrective_action: "Housekeeping crew cleared the area",
			hazard_tags: "excavation",
			photo_ref: "media://obs/OBS-440.jpg",
			zone_id: "ZN-011",
			reported_by: "WK-2121",
			source: "Asset alert",
			assigned_to: "WK-2117",
			due_at: "2026-06-17 04:12",
			closed_at: "2026-06-19 17:12",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-441",
			observation_title: "Hoist gate left open — Tower Core L01–L10",
			severity_level: "High",
			observed_at: "2026-07-21 10:40",
			observation_status: "New",
			corrective_action: "",
			hazard_tags: "lifting,mechanical",
			photo_ref: "media://obs/OBS-441.jpg",
			zone_id: "ZN-001",
			reported_by: "WK-2010",
			source: "Environmental sensor",
			assigned_to: null,
			due_at: "2026-07-22 10:40",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-442",
			observation_title: "PPE — no eye protection during grinding — Roof Plant Deck",
			severity_level: "High",
			observed_at: "2026-07-20 23:14",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "ppe",
			photo_ref: "media://obs/OBS-442.jpg",
			zone_id: "ZN-012",
			reported_by: "WK-2142",
			source: "manual",
			assigned_to: "WK-2004",
			due_at: "2026-07-21 23:14",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-443",
			observation_title: "Good catch: gas bottles re-secured — Roof Plant Deck",
			severity_level: "Low",
			observed_at: "2026-06-11 04:58",
			observation_status: "Closed",
			corrective_action: "Housekeeping crew cleared the area",
			hazard_tags: "housekeeping",
			photo_ref: "media://obs/OBS-443.jpg",
			zone_id: "ZN-012",
			reported_by: "WK-2042",
			source: "Environmental sensor",
			assigned_to: "WK-2074",
			due_at: "2026-06-18 04:58",
			closed_at: "2026-06-13 02:58",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-444",
			observation_title: "Oil spill near generator GEN-115 — Blockwork Bay L02",
			severity_level: "Medium",
			observed_at: "2026-07-10 11:05",
			observation_status: "Closed",
			corrective_action: "Toolbox talk delivered to the crew",
			hazard_tags: "environment",
			photo_ref: "media://obs/OBS-444.jpg",
			zone_id: "ZN-011",
			reported_by: "WK-2141",
			source: "Radar",
			assigned_to: "WK-2029",
			due_at: "2026-07-13 11:05",
			closed_at: "2026-07-12 07:05",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-445",
			observation_title: "Unlabelled chemical container — Basement Plant Room",
			severity_level: "Low",
			observed_at: "2026-07-20 15:43",
			observation_status: "New",
			corrective_action: "",
			hazard_tags: "coshh",
			photo_ref: "media://obs/OBS-445.jpg",
			zone_id: "ZN-008",
			reported_by: "WK-2141",
			source: "AI Camera",
			assigned_to: null,
			due_at: "2026-07-27 15:43",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-446",
			observation_title: "Temporary lighting insufficient in riser — Gate 2 Logistics Yard",
			severity_level: "Medium",
			observed_at: "2026-06-10 01:51",
			observation_status: "Closed",
			corrective_action: "Defective equipment quarantined",
			hazard_tags: "electrical",
			photo_ref: "media://obs/OBS-446.jpg",
			zone_id: "ZN-013",
			reported_by: "WK-2140",
			source: "Asset alert",
			assigned_to: "WK-2042",
			due_at: "2026-06-13 01:51",
			closed_at: "2026-06-10 03:51",
			closed_by: "WK-2141",
		},
		{
			observation_id: "OBS-447",
			observation_title: "Blocked emergency assembly route — MEP Riser Shafts",
			severity_level: "Medium",
			observed_at: "2026-06-14 16:31",
			observation_status: "Closed",
			corrective_action: "Permit re-issued with additional controls",
			hazard_tags: "emergency",
			photo_ref: "media://obs/OBS-447.jpg",
			zone_id: "ZN-010",
			reported_by: "WK-2029",
			source: "Radar",
			assigned_to: "WK-2054",
			due_at: "2026-06-17 16:31",
			closed_at: "2026-06-16 08:31",
			closed_by: "WK-2010",
		},
		{
			observation_id: "OBS-448",
			observation_title: "Untrained operator on telehandler — Blockwork Bay L02",
			severity_level: "High",
			observed_at: "2026-06-24 04:24",
			observation_status: "False Alarm",
			corrective_action: "Permit re-issued with additional controls",
			hazard_tags: "plant",
			photo_ref: "media://obs/OBS-448.jpg",
			zone_id: "ZN-011",
			reported_by: "WK-2012",
			source: "Connected Worker",
			assigned_to: null,
			due_at: "2026-06-25 04:24",
			closed_at: "2026-06-27 04:24",
			closed_by: "WK-2141",
		},
		{
			observation_id: "OBS-449",
			observation_title: "Hot works without fire watch — Roof Plant Deck",
			severity_level: "Medium",
			observed_at: "2026-07-16 23:58",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "fire",
			photo_ref: "media://obs/OBS-449.jpg",
			zone_id: "ZN-012",
			reported_by: "WK-2027",
			source: "Environmental sensor",
			assigned_to: "WK-2107",
			due_at: "2026-07-19 23:58",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-450",
			observation_title: "Dust suppression not running at cutting station — Facade Access Deck",
			severity_level: "Medium",
			observed_at: "2026-06-26 11:00",
			observation_status: "Closed",
			corrective_action: "Area barriered and re-inspected",
			hazard_tags: "health",
			photo_ref: "media://obs/OBS-450.jpg",
			zone_id: "ZN-009",
			reported_by: "WK-2141",
			source: "Radar",
			assigned_to: "WK-2037",
			due_at: "2026-06-29 11:00",
			closed_at: "2026-06-28 02:00",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-451",
			observation_title: "Confined space entry log incomplete — Gate 2 Logistics Yard",
			severity_level: "Medium",
			observed_at: "2026-06-22 04:51",
			observation_status: "Closed",
			corrective_action: "Housekeeping crew cleared the area",
			hazard_tags: "confined-space",
			photo_ref: "media://obs/OBS-451.jpg",
			zone_id: "ZN-013",
			reported_by: "WK-2141",
			source: "Asset alert",
			assigned_to: "WK-2101",
			due_at: "2026-06-25 04:51",
			closed_at: "2026-06-22 08:51",
			closed_by: "WK-2142",
		},
		{
			observation_id: "OBS-452",
			observation_title: "Welfare — drinking water station empty — Site Welfare & Offices",
			severity_level: "High",
			observed_at: "2026-07-21 08:09",
			observation_status: "New",
			corrective_action: "",
			hazard_tags: "welfare",
			photo_ref: "media://obs/OBS-452.jpg",
			zone_id: "ZN-014",
			reported_by: "WK-2069",
			source: "Asset alert",
			assigned_to: null,
			due_at: "2026-07-22 08:09",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-453",
			observation_title: "Guardrail removed and not reinstated — Facade Access Deck",
			severity_level: "High",
			observed_at: "2026-07-10 10:09",
			observation_status: "Escalated",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "fall-from-height",
			photo_ref: "media://obs/OBS-453.jpg",
			zone_id: "ZN-009",
			reported_by: "WK-2010",
			source: "Radar",
			assigned_to: "WK-2080",
			due_at: "2026-07-11 10:09",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-454",
			observation_title: "Near miss: dropped hand tool from L03 — Blockwork Bay L02",
			severity_level: "Low",
			observed_at: "2026-07-02 23:24",
			observation_status: "Closed",
			corrective_action: "Permit re-issued with additional controls",
			hazard_tags: "dropped-object",
			photo_ref: "media://obs/OBS-454.jpg",
			zone_id: "ZN-011",
			reported_by: "WK-2097",
			source: "Radar",
			assigned_to: "WK-2092",
			due_at: "2026-07-09 23:24",
			closed_at: "2026-07-06 16:24",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-455",
			observation_title: "Positive: crew stopped work for wind speed — Basement Plant Room",
			severity_level: "Low",
			observed_at: "2026-07-19 10:37",
			observation_status: "False Alarm",
			corrective_action: "Toolbox talk delivered to the crew",
			hazard_tags: "behaviour",
			photo_ref: "media://obs/OBS-455.jpg",
			zone_id: "ZN-008",
			reported_by: "WK-2140",
			source: "manual",
			assigned_to: null,
			due_at: "2026-07-26 10:37",
			closed_at: "2026-07-21 08:37",
			closed_by: "WK-2142",
		},
		{
			observation_id: "OBS-456",
			observation_title: "Unprotected leading edge — Basement Plant Room",
			severity_level: "Medium",
			observed_at: "2026-07-17 04:56",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "fall-from-height",
			photo_ref: "media://obs/OBS-456.jpg",
			zone_id: "ZN-008",
			reported_by: "WK-2140",
			source: "BIM clash",
			assigned_to: "WK-2115",
			due_at: "2026-07-20 04:56",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-457",
			observation_title: "Housekeeping — offcuts blocking egress — North Laydown Yard",
			severity_level: "High",
			observed_at: "2026-07-13 15:01",
			observation_status: "Closed",
			corrective_action: "Method statement re-briefed",
			hazard_tags: "housekeeping",
			photo_ref: "media://obs/OBS-457.jpg",
			zone_id: "ZN-003",
			reported_by: "WK-2141",
			source: "Radar",
			assigned_to: "WK-2014",
			due_at: "2026-07-14 15:01",
			closed_at: "2026-07-15 14:01",
			closed_by: "WK-2010",
		},
		{
			observation_id: "OBS-458",
			observation_title: "Worker without harness on facade deck — Tower Core L01–L10",
			severity_level: "Medium",
			observed_at: "2026-06-23 18:44",
			observation_status: "Closed",
			corrective_action: "Toolbox talk delivered to the crew",
			hazard_tags: "fall-from-height",
			photo_ref: "media://obs/OBS-458.jpg",
			zone_id: "ZN-001",
			reported_by: "WK-2141",
			source: "AI Camera",
			assigned_to: "WK-2082",
			due_at: "2026-06-26 18:44",
			closed_at: "2026-06-25 10:44",
			closed_by: "WK-2142",
		},
		{
			observation_id: "OBS-459",
			observation_title: "Damaged scaffold toe board — Podium Fit-out Area",
			severity_level: "Critical",
			observed_at: "2026-07-20 17:55",
			observation_status: "New",
			corrective_action: "",
			hazard_tags: "scaffold",
			photo_ref: "media://obs/OBS-459.jpg",
			zone_id: "ZN-007",
			reported_by: "WK-2140",
			source: "manual",
			assigned_to: null,
			due_at: "2026-07-20 21:55",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-460",
			observation_title: "Uncapped rebar starter bars — South Excavation Pit",
			severity_level: "Medium",
			observed_at: "2026-07-13 00:55",
			observation_status: "Escalated",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "impalement",
			photo_ref: "media://obs/OBS-460.jpg",
			zone_id: "ZN-004",
			reported_by: "WK-2031",
			source: "BIM clash",
			assigned_to: "WK-2086",
			due_at: "2026-07-16 00:55",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-461",
			observation_title: "Cable trailing across walkway — Podium Fit-out Area",
			severity_level: "Critical",
			observed_at: "2026-07-18 10:20",
			observation_status: "Closed",
			corrective_action: "Defective equipment quarantined",
			hazard_tags: "electrical",
			photo_ref: "media://obs/OBS-461.jpg",
			zone_id: "ZN-007",
			reported_by: "WK-2140",
			source: "BIM clash",
			assigned_to: "WK-2143",
			due_at: "2026-07-18 14:20",
			closed_at: "2026-07-19 20:20",
			closed_by: "WK-2142",
		},
		{
			observation_id: "OBS-462",
			observation_title: "Missing fire extinguisher at hot-work station — Basement Plant Room",
			severity_level: "Medium",
			observed_at: "2026-07-01 12:24",
			observation_status: "False Alarm",
			corrective_action: "Permit re-issued with additional controls",
			hazard_tags: "fire",
			photo_ref: "media://obs/OBS-462.jpg",
			zone_id: "ZN-008",
			reported_by: "WK-2104",
			source: "BIM clash",
			assigned_to: null,
			due_at: "2026-07-04 12:24",
			closed_at: "2026-07-02 04:24",
			closed_by: "WK-2140",
		},
		{
			observation_id: "OBS-463",
			observation_title: "Excavation edge not barricaded — Gate 2 Logistics Yard",
			severity_level: "Medium",
			observed_at: "2026-07-21 15:32",
			observation_status: "Open",
			corrective_action: "Awaiting corrective action",
			hazard_tags: "excavation",
			photo_ref: "media://obs/OBS-463.jpg",
			zone_id: "ZN-013",
			reported_by: "WK-2140",
			source: "Radar",
			assigned_to: "WK-2081",
			due_at: "2026-07-24 15:32",
			closed_at: null,
			closed_by: null,
		},
		{
			observation_id: "OBS-464",
			observation_title: "Load left suspended over walkway — Podium Fit-out Area",
			severity_level: "High",
			observed_at: "2026-07-17 15:17",
			observation_status: "Closed",
			corrective_action: "Permit re-issued with additional controls",
			hazard_tags: "lifting",
			photo_ref: "media://obs/OBS-464.jpg",
			zone_id: "ZN-007",
			reported_by: "WK-2145",
			source: "Connected Worker",
			assigned_to: "WK-2078",
			due_at: "2026-07-18 15:17",
			closed_at: "2026-07-19 20:17",
			closed_by: "WK-2142",
		},
		{
			observation_id: "OBS-465",
			observation_title: "Spoil stockpile too close to trench — Hoist Zone A",
			severity_level: "Medium",
			observed_at: "2026-06-15 05:49",
			observation_status: "Closed",
			corrective_action: "Area barriered and re-inspected",
			hazard_tags: "excavation",
			photo_ref: "media://obs/OBS-465.jpg",
			zone_id: "ZN-002",
			reported_by: "WK-2010",
			source: "Environmental sensor",
			assigned_to: "WK-2117",
			due_at: "2026-06-18 05:49",
			closed_at: "2026-06-15 19:49",
			closed_by: "WK-2010",
		},
	],
};

/** Edge colour per transition kind — the prototype's `kindColor` map, used by the canvas legend. */
export const WC3_PROCESS_KIND_COLOR: Record<Wc3ProcessTransitionKind, string> = {
	forward: "#3b82f6",
	reject_loop: "#dc2626",
	reopen: "#7c3aed",
	branch: "#d97706",
	extension_loop: "#0d9488",
	close_out: "#334155",
};

/** Aging histogram buckets used by the bottleneck panel, in the prototype's order. */
export const WC3_PROCESS_AGING_BUCKETS: {label: string; maxHours: number}[] = [
	{label: "<4 h", maxHours: 4},
	{label: "4–24 h", maxHours: 24},
	{label: "1–3 d", maxHours: 72},
	{label: "3–7 d", maxHours: 168},
	{label: ">7 d", maxHours: Infinity},
];

/* ---------------------------------------------------------------- helpers */

const HOUR = 3600000;
const PROC_BY_ID = new Map(WC3_PROCESSES.map((p) => [p.id, p]));

export const getProcess = (id: string) => PROC_BY_ID.get(id);

/** The process whose tokens are rows of `otId`, if one exists. */
export const processForObjectType = (otId: string) => WC3_PROCESSES.find((p) => p.objectTypeId === otId);

/**
 * The demo instance rows for a process, looked up by backing object type.
 *
 * FIXTURE ACCESSOR, not a library function. Every helper below takes its rows as an ARGUMENT — a
 * consumer passes its own, and the widget passes whatever came in through `instances`. This exists
 * so the stories and the demo pages can keep showing live-looking numbers, and it is the only thing
 * in this module that reaches into WC3_PROCESS_INSTANCES.
 *
 * It used to be what every helper called, which is why a process with a real `objectTypeId` showed
 * an empty Instances section, an empty Bottlenecks section and a 0 on every node.
 */
export function demoInstances(proc: Wc3Process): Wc3ProcessInstanceRow[] {
	const rows = (WC3_PROCESS_INSTANCES as Record<string, Wc3ProcessInstanceRow[]>)[proc.objectTypeId];
	return rows ?? [];
}

/** State a row currently sits in, matched on `statusProp`. */
export const processStateOf = (proc: Wc3Process, row: Wc3ProcessInstanceRow) =>
	proc.states.find((s) => s.value === row[proc.statusProp]);

/** Rows currently sitting in a state — the token count painted on the canvas. */
export function processTokens(
	proc: Wc3Process,
	stateId: string,
	rows: Wc3ProcessInstanceRow[],
): Wc3ProcessInstanceRow[] {
	const st = proc.states.find((s) => s.id === stateId);
	if (!st) return [];
	return rows.filter((r) => r[proc.statusProp] === st.value);
}

/** Age of a row in hours against the frozen fixture clock. */
export function processRowAgeHours(proc: Wc3Process, row: Wc3ProcessInstanceRow): number {
	const ref = proc.objectTypeId === "ot_observation" ? row.observed_at : row.created_at;
	if (typeof ref !== "string") return 0;
	const t = Date.parse(ref.replace(" ", "T"));
	return isNaN(t) ? 0 : Math.max(0, (WC3_PROCESS_FIXTURE_NOW_MS - t) / HOUR);
}

/** SLA that applies to a row: the severity table when the process has one, else the state's own SLA. */
export function processRowSlaHours(
	proc: Wc3Process,
	row: Wc3ProcessInstanceRow,
	state: Wc3ProcessState | undefined,
): number | null {
	const sev = row.severity_level;
	if (proc.slaBySeverity && typeof sev === "string") {
		return proc.slaBySeverity[sev as keyof Wc3ProcessSlaBySeverity] ?? null;
	}
	return state ? state.slaHours : null;
}

/** Whether a non-terminal row has been sitting longer than its SLA allows. */
export function processRowOverSla(proc: Wc3Process, row: Wc3ProcessInstanceRow): boolean {
	const st = processStateOf(proc, row);
	if (!st || st.type === "terminal") return false;
	const sla = processRowSlaHours(proc, row, st);
	if (!sla) return false;
	return processRowAgeHours(proc, row) > sla;
}

/** Rows that have not reached a terminal state — the live work in the process. */
export const processOpenRows = (proc: Wc3Process, rows: Wc3ProcessInstanceRow[]) =>
	rows.filter((r) => {
		const st = processStateOf(proc, r);
		return st !== undefined && st.type !== "terminal";
	});

/**
 * Graph validity, ported from the prototype's `processLint` — the subset of the DWP engine's
 * L1–L14 rules the editor enforces. An empty array means the graph is publishable.
 */
export function processLint(proc: Wc3Process): Wc3ProcessLintError[] {
	const errs: Wc3ProcessLintError[] = [];
	const initials = proc.states.filter((s) => s.type === "initial");
	if (initials.length !== 1) {
		errs.push({rule: "L1", msg: `Exactly one initial state required (found ${initials.length}).`});
	}
	if (!proc.states.some((s) => s.type === "terminal")) {
		errs.push({rule: "L2", msg: "At least one terminal state is required."});
	}
	if (!proc.states.some((s) => s.category === "active")) {
		errs.push({rule: "L3", msg: "At least one active (work-authorizing / monitored) state is required."});
	}
	const reach = new Set<string>();
	if (initials[0]) {
		const queue = [initials[0].id];
		while (queue.length) {
			const cur = queue.shift() as string;
			if (reach.has(cur)) continue;
			reach.add(cur);
			proc.transitions.forEach((t) => {
				if (t.from === cur && !reach.has(t.to)) queue.push(t.to);
			});
		}
		proc.states.forEach((s) => {
			if (!reach.has(s.id)) {
				errs.push({rule: "L4", msg: `State “${s.name}” is unreachable from the initial state.`});
			}
		});
	}
	proc.states.forEach((s) => {
		const outs = proc.transitions.filter((t) => t.from === s.id);
		if (s.type !== "terminal" && !outs.length) {
			errs.push({rule: "L5", msg: `Non-terminal state “${s.name}” needs at least one outgoing transition.`});
		}
		if (s.type === "terminal" && outs.some((t) => t.kind !== "reopen")) {
			errs.push({rule: "L6", msg: `Terminal state “${s.name}” may only have reopen transitions.`});
		}
	});
	return errs;
}

/**
 * Product a process belongs to. There is NO stored productKey on a process — provenance is resolved
 * through the backing object type's install record, so this returns undefined for a process whose
 * object type was never installed by a product.
 */
export const processProductKey = (proc: Wc3Process): string | undefined =>
	getObjectType(proc.objectTypeId)?.installedBy?.productKey;

/** Processes a product owns. A product may own several — `safety` owns both processes in this data. */
export const processesForProduct = (productKey: string) =>
	WC3_PROCESSES.filter((p) => processProductKey(p) === productKey);

/** Aging histogram for the bottleneck panel; pass a state id to scope it, else all open rows. */
export function processAgingBuckets(
	proc: Wc3Process,
	instances: Wc3ProcessInstanceRow[],
	stateId?: string,
): Wc3ProcessAgingBucket[] {
	const rows = stateId ? processTokens(proc, stateId, instances) : processOpenRows(proc, instances);
	const out = WC3_PROCESS_AGING_BUCKETS.map((b) => ({...b, count: 0, over: 0}));
	rows.forEach((r) => {
		const age = processRowAgeHours(proc, r);
		const i = out.findIndex((b) => age <= b.maxHours);
		const bucket = out[i < 0 ? out.length - 1 : i];
		if (!bucket) return;
		bucket.count++;
		if (processRowOverSla(proc, r)) bucket.over++;
	});
	return out;
}

/**
 * Non-terminal states ranked worst-first — the bottleneck analysis on the process page. Order is
 * share over SLA, then raw over-SLA count, then oldest token.
 */
export function processBottlenecks(proc: Wc3Process, instances: Wc3ProcessInstanceRow[]): Wc3ProcessBottleneck[] {
	return proc.states
		.filter((s) => s.type !== "terminal")
		.map((s) => {
			const rows = processTokens(proc, s.id, instances);
			const ages = rows.map((r) => processRowAgeHours(proc, r));
			const over = rows.filter((r) => processRowOverSla(proc, r)).length;
			return {
				state: s,
				tokens: rows.length,
				over,
				overShare: rows.length ? over / rows.length : 0,
				avgAgeHours: ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : 0,
				maxAgeHours: ages.length ? Math.max(...ages) : 0,
				slaHours: proc.slaBySeverity ? null : s.slaHours,
			};
		})
		.sort((a, b) => b.overShare - a.overShare || b.over - a.over || b.maxAgeHours - a.maxAgeHours);
}
