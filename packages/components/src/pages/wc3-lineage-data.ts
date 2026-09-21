// WC3 lineage fixture — extracted verbatim from window.__STORE__.state of the unified-workspace
// prototype (apps/wc3-platform-web/prototypes/ontology-manager/06-unified-workspace.html, the
// "m7-lineage.js" module) plus its PROJECTION_USAGE / NODE_KINDS / PRODUCT_TYPE_META globals.
//
// Not hand-authored: dumped from the running prototype so the Lineage perspective renders the same
// 3 pipelines (16 nodes), 2 action runs, 4 product installs, 6 consuming projections and
// 15 pipeline node kinds the prototype was reviewed against. Every id, label, timestamp and count
// matches the prototype exactly. All data is fictional (PROTOTYPE FIXTURE).
//
// Object-type provenance (installedBy) is NOT duplicated here — it already ships on WC3_OBJECT_TYPES
// in wc3-ontology-data.ts and was verified identical to the prototype (13 of 16 types carry it).

import {WC3_OBJECT_TYPES, type Wc3ObjectType} from "./wc3-ontology-data";

/* ------------------------------------------------------------------ types */

/** Palette category a pipeline node kind belongs to. */
export type Wc3NodeKindCategory = "Sources" | "BHoM" | "Transforms" | "Sinks";

/** A kind of pipeline node — the prototype's NODE_KINDS palette entry. */
export type Wc3NodeKind = {
	label: string;
	cat: Wc3NodeKindCategory;
	icon: string;
	inPorts: string[];
	outPorts: string[];
	/** Object types this node kind touches without being a sync sink (drives impact). */
	refs?: string[];
};

/** A node placed on a pipeline canvas. `params.targetOt` on a `sink_sync` names the synced type. */
export type Wc3PipelineNode = {
	id: string;
	kind: string;
	label: string;
	x: number;
	y: number;
	params: Record<string, string>;
};

/** A wire between two node ports, encoded "<nodeId>:<portIndex>". */
export type Wc3PipelineWire = {id: string; from: string; to: string};

/** One execution of a pipeline. The seeded fixture has no runs; the shape mirrors runPipeline(). */
export type Wc3PipelineRun = {
	id: string;
	at: string;
	rev: number;
	/** Rows produced per node id. */
	stats: Record<string, number>;
	/** Topological node order the run executed in. */
	order: string[];
	summary: string[];
};

/** A data pipeline: datasource nodes → transforms → sync/topic sinks. */
export type Wc3Pipeline = {
	id: string;
	name: string;
	icon: string;
	dropRev: number;
	desc: string;
	nodes: Wc3PipelineNode[];
	wires: Wc3PipelineWire[];
	runs: Wc3PipelineRun[];
};

/** One run of an action type — what the Workflow lineage tab traces. */
export type Wc3ActionRun = {
	id: string;
	/** Action type id; resolves against WC3_ACTION_TYPES. */
	atId: string;
	user: string;
	/** Wall-clock label the prototype renders, e.g. "07:02:11". */
	when: string;
	ts: number;
	/** false when the action was blocked by a rule — `effects` then holds the errors. */
	ok: boolean;
	args: Record<string, string | number | boolean>;
	/** Side-effect lines. "[bell] …" / "[globe] …" prefixes mark notification and webhook effects. */
	effects: string[];
};

/** One step in an install's lifecycle history. */
export type Wc3InstallLifecycleStep = {step: string; by: string; when: string; detail: string};

/** Ontology entities an install added, and those it skipped. */
export type Wc3InstallChangeSet = {objectTypes: string[]; linkTypes: string[]; actionTypes: string[]};

/** A product install — the provenance root of the data lineage DAG. */
export type Wc3Install = {
	id: string;
	productKey: string;
	version: string;
	productType: string;
	environment: string;
	status: string;
	baseline: boolean;
	approvedBy: string;
	releaseChannel: string;
	promotionRunbookRef: string;
	rollbackRunbookRef: string;
	installedBy: string;
	installedByLens: string;
	when: string;
	ts: number;
	addedObjectTypes: string[];
	addedLinkTypes: string[];
	addedActionTypes: string[];
	skipped: Wc3InstallChangeSet;
	plan: unknown | null;
	lifecycle: Wc3InstallLifecycleStep[];
};

/** A downstream projection (product surface) and the object types it consumes. */
export type Wc3ProjectionUsage = {label: string; icon: string; uses: string[]};

/** The product a install came from, reduced to what the lineage tabs render. */
export type Wc3LineageProduct = {productKey: string; displayName: string; productType: string};

/** Display metadata for a product type. */
export type Wc3ProductTypeMeta = {label: string; icon: string};

/** A business process, reduced to what the Impact tab needs to caption a row. */
export type Wc3LineageProcess = {
	id: string;
	name: string;
	objectTypeId: string;
	transitions: {actionTypeId: string}[];
};

/** Blast radius of deleting/changing one object type — ids only, resolve against the ontology data. */
export type Wc3Impact = {
	pipelines: string[];
	processes: string[];
	actions: string[];
	linkTypes: string[];
	interfaces: string[];
	projections: string[];
};

/* ------------------------------------------------------------------- data */

/** The pipeline node palette (prototype global NODE_KINDS). */
export const WC3_NODE_KINDS: Record<string, Wc3NodeKind> = {
	src_ifc: {label: "IFC model drop", cat: "Sources", icon: "cube", inPorts: [], outPorts: ["Geometry"]},
	src_xer: {label: "XER schedule", cat: "Sources", icon: "calendar", inPorts: [], outPorts: ["Table"]},
	src_hr: {label: "HR roster CSV", cat: "Sources", icon: "folder", inPorts: [], outPorts: ["Table"]},
	src_wear: {label: "Wearable stream", cat: "Sources", icon: "signal", inPorts: [], outPorts: ["Stream"]},
	src_drone: {label: "Drone capture", cat: "Sources", icon: "drone", inPorts: [], outPorts: ["Geometry"]},
	bhom_revit: {label: "Revit→BHoM adapter", cat: "BHoM", icon: "process", inPorts: ["Geometry"], outPorts: ["Objects"]},
	bhom_map: {label: "BHoM→WC3 mapper", cat: "BHoM", icon: "pipeline", inPorts: ["Objects"], outPorts: ["Objects"]},
	tx_uniclass: {
		label: "Uniclass classifier",
		cat: "Transforms",
		icon: "tag",
		inPorts: ["Objects"],
		outPorts: ["Objects"],
	},
	tx_clash: {label: "Clash filter", cat: "Transforms", icon: "impact", inPorts: ["Objects"], outPorts: ["Objects"]},
	tx_qto: {label: "QTO takeoff", cat: "Transforms", icon: "ruler", inPorts: ["Objects"], outPorts: ["Table"]},
	tx_geofence: {
		label: "Zone geofencer",
		cat: "Transforms",
		icon: "mapPin",
		inPorts: ["Stream"],
		outPorts: ["Stream"],
		refs: ["ot_zone", "ot_worker"],
	},
	tx_rostermap: {
		label: "Roster mapper",
		cat: "Transforms",
		icon: "users",
		inPorts: ["Table"],
		outPorts: ["Objects"],
		refs: ["ot_worker", "ot_crew"],
	},
	tx_actmap: {
		label: "Activity mapper",
		cat: "Transforms",
		icon: "map",
		inPorts: ["Table"],
		outPorts: ["Objects"],
		refs: ["ot_activity", "ot_project"],
	},
	sink_sync: {label: "Object-type sync", cat: "Sinks", icon: "download", inPorts: ["Objects"], outPorts: []},
	sink_topic: {label: "Stream topic", cat: "Sinks", icon: "upload", inPorts: ["Stream"], outPorts: []},
};

/** Data pipelines, in prototype order. */
export const WC3_PIPELINES: Wc3Pipeline[] = [
	{
		id: "pipe_bim",
		name: "BIM intake — IFC → WC3 elements",
		icon: "cube",
		dropRev: 1,
		desc: "Receives IFC model drops, adapts them through BHoM, classifies with Uniclass 2015 and syncs Built Elements + Equipment into the ontology.",
		nodes: [
			{
				id: "n_ifc",
				kind: "src_ifc",
				label: "IFC model drop",
				x: 40,
				y: 120,
				params: {source: "falcon-heights-str.ifc"},
			},
			{
				id: "n_revit",
				kind: "bhom_revit",
				label: "Revit→BHoM adapter",
				x: 250,
				y: 120,
				params: {adapter: "BHoM.Revit 6.3"},
			},
			{id: "n_map", kind: "bhom_map", label: "BHoM→WC3 mapper", x: 460, y: 120, params: {profile: "wc3-core"}},
			{id: "n_uni", kind: "tx_uniclass", label: "Uniclass classifier", x: 670, y: 60, params: {table: "Ss"}},
			{id: "n_qto", kind: "tx_qto", label: "QTO takeoff", x: 670, y: 190, params: {unit: "m³"}},
			{
				id: "n_sink_el",
				kind: "sink_sync",
				label: "Element sync",
				x: 880,
				y: 60,
				params: {targetOt: "ot_element"},
			},
			{
				id: "n_sink_eq",
				kind: "sink_sync",
				label: "Equipment sync",
				x: 880,
				y: 190,
				params: {targetOt: "ot_equipment"},
			},
		],
		wires: [
			{id: "w1", from: "n_ifc:0", to: "n_revit:0"},
			{id: "w2", from: "n_revit:0", to: "n_map:0"},
			{id: "w3", from: "n_map:0", to: "n_uni:0"},
			{id: "w4", from: "n_uni:0", to: "n_sink_el:0"},
			{id: "w5", from: "n_map:0", to: "n_qto:0"},
			{id: "w6", from: "n_map:0", to: "n_sink_eq:0"},
		],
		runs: [],
	},
	{
		id: "pipe_sched",
		name: "P6 schedule sync — XER → activities",
		icon: "calendar",
		dropRev: 1,
		desc: "Parses the weekly XER export, normalizes WBS codes and syncs Activities.",
		nodes: [
			{
				id: "n_xer",
				kind: "src_xer",
				label: "XER schedule export",
				x: 40,
				y: 110,
				params: {source: "FHMT-wk30.xer"},
			},
			{id: "n_actmap", kind: "tx_actmap", label: "Activity mapper", x: 290, y: 110, params: {calendar: "6d"}},
			{
				id: "n_sink_act",
				kind: "sink_sync",
				label: "Activity sync",
				x: 540,
				y: 110,
				params: {targetOt: "ot_activity"},
			},
		],
		wires: [
			{id: "w1", from: "n_xer:0", to: "n_actmap:0"},
			{id: "w2", from: "n_actmap:0", to: "n_sink_act:0"},
		],
		runs: [],
	},
	{
		id: "pipe_tel",
		name: "Telemetry & roster — wearables → presence",
		icon: "signal",
		dropRev: 1,
		desc: "Geofences the wearable stream into zone presence events (feeds live occupancy) and refreshes the worker roster.",
		nodes: [
			{
				id: "n_wear",
				kind: "src_wear",
				label: "Wearable stream",
				x: 40,
				y: 60,
				params: {gateway: "WC-G2 mesh"},
			},
			{id: "n_geo", kind: "tx_geofence", label: "Zone geofencer", x: 290, y: 60, params: {radius: "per-zone"}},
			{
				id: "n_topic",
				kind: "sink_topic",
				label: "presence_events topic",
				x: 540,
				y: 60,
				params: {topic: "presence_events"},
			},
			{
				id: "n_hr",
				kind: "src_hr",
				label: "HR roster CSV",
				x: 40,
				y: 190,
				params: {source: "roster-2026-07.csv"},
			},
			{
				id: "n_rmap",
				kind: "tx_rostermap",
				label: "Roster mapper",
				x: 290,
				y: 190,
				params: {dedupe: "badge_id"},
			},
			{
				id: "n_sink_wk",
				kind: "sink_sync",
				label: "Worker sync",
				x: 540,
				y: 190,
				params: {targetOt: "ot_worker"},
			},
		],
		wires: [
			{id: "w1", from: "n_wear:0", to: "n_geo:0"},
			{id: "w2", from: "n_geo:0", to: "n_topic:0"},
			{id: "w3", from: "n_hr:0", to: "n_rmap:0"},
			{id: "w4", from: "n_rmap:0", to: "n_sink_wk:0"},
		],
		runs: [],
	},
];

/** Seeded action runs, oldest first — the Workflow tab reverses this. */
export const WC3_ACTION_RUNS: Wc3ActionRun[] = [
	{
		id: "run_seed_1",
		atId: "at_record_observation",
		user: "Nadia Boulos",
		when: "07:02:11",
		ts: 1784689200000,
		ok: true,
		args: {
			observation_title: "Slab pour crew missing hi-viz",
			severity_level: "Medium",
			zone: "ZN-005",
			reported_by: "WK-2010",
		},
		effects: [
			"Created Safety Observation “Slab pour crew missing hi-viz”",
			"Created link “Zone”: OBS-405 ↔ ZN-005",
			"Created link “Reported by”: OBS-405 ↔ WK-2010",
			"[bell] Notification sent to Safety Team: “Medium observation logged”",
			"[globe] Webhook POST https://hooks.core.example/safety-intake (simulated)",
		],
	},
	{
		id: "run_seed_2",
		atId: "at_issue_permit",
		user: "Farid Mansour",
		when: "06:04:40",
		ts: 1784685600000,
		ok: true,
		args: {
			permit: "PT-704",
			valid_from: "2026-07-22",
			valid_to: "2026-07-22",
			gas_test_confirmed: true,
			isolations_confirmed: true,
		},
		effects: [
			"Modified Work Permit “Hot work — rebar cutting L11 core” (permit_status, valid_from, valid_to)",
			"[bell] Notification sent to receiver: “Permit PT-704 issued”",
			"[globe] Webhook POST https://hooks.core.example/dwp-issued (simulated)",
		],
	},
];

/** Product installs. Only `status === "applied"` ones appear in the lineage DAG. */
export const WC3_INSTALLS: Wc3Install[] = [
	{
		id: "inst_seed_capture",
		productKey: "capture",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		environment: "Test",
		status: "applied",
		baseline: true,
		approvedBy: "Hana Al-Sayed",
		releaseChannel: "STABLE",
		promotionRunbookRef: "runbooks/product-release-promotion.md",
		rollbackRunbookRef: "runbooks/product-rollback.md",
		installedBy: "Hana Al-Sayed",
		installedByLens: "Admin lens",
		when: "2026-07-18",
		ts: 1784350800000,
		addedObjectTypes: ["ot_project", "ot_activity", "ot_element", "ot_delivery"],
		addedLinkTypes: ["lt_activity_project", "lt_delivery_activity", "lt_element_activity"],
		addedActionTypes: ["at_report_progress", "at_update_install_status"],
		skipped: {objectTypes: [], linkTypes: [], actionTypes: []},
		plan: null,
		lifecycle: [
			{
				step: "apply",
				by: "Hana Al-Sayed",
				when: "2026-07-18",
				detail: "baseline provisioning of the fixture workspace — 4 object type(s), 3 link type(s), 2 action type(s)",
			},
		],
	},
	{
		id: "inst_seed_labour",
		productKey: "labour",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		environment: "Test",
		status: "applied",
		baseline: true,
		approvedBy: "Hana Al-Sayed",
		releaseChannel: "STABLE",
		promotionRunbookRef: "runbooks/product-release-promotion.md",
		rollbackRunbookRef: "runbooks/product-rollback.md",
		installedBy: "Hana Al-Sayed",
		installedByLens: "Admin lens",
		when: "2026-07-19",
		ts: 1784437200000,
		addedObjectTypes: ["ot_worker", "ot_crew", "ot_cert", "ot_access_grant"],
		addedLinkTypes: ["lt_crew_members", "lt_cert_worker"],
		addedActionTypes: ["at_grant_access", "at_renew_certification"],
		skipped: {objectTypes: [], linkTypes: [], actionTypes: []},
		plan: null,
		lifecycle: [
			{
				step: "apply",
				by: "Hana Al-Sayed",
				when: "2026-07-19",
				detail: "baseline provisioning of the fixture workspace — 4 object type(s), 2 link type(s), 2 action type(s)",
			},
		],
	},
	{
		id: "inst_seed_safety",
		productKey: "safety",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		environment: "Test",
		status: "applied",
		baseline: true,
		approvedBy: "Hana Al-Sayed",
		releaseChannel: "STABLE",
		promotionRunbookRef: "runbooks/product-release-promotion.md",
		rollbackRunbookRef: "runbooks/product-rollback.md",
		installedBy: "Hana Al-Sayed",
		installedByLens: "Admin lens",
		when: "2026-07-20",
		ts: 1784523600000,
		addedObjectTypes: ["ot_observation", "ot_permit"],
		addedLinkTypes: [],
		addedActionTypes: [
			"at_record_observation",
			"at_submit_permit",
			"at_start_permit_review",
			"at_reject_permit",
			"at_issue_permit",
			"at_resume_permit",
			"at_close_permit",
			"at_open_observation",
			"at_close_observation",
			"at_mark_false_alarm",
			"at_reopen_observation",
			"at_escalate_observation",
		],
		skipped: {objectTypes: [], linkTypes: [], actionTypes: []},
		plan: null,
		lifecycle: [
			{
				step: "apply",
				by: "Hana Al-Sayed",
				when: "2026-07-20",
				detail: "baseline provisioning of the fixture workspace — 2 object type(s), 0 link type(s), 12 action type(s)",
			},
		],
	},
	{
		id: "inst_seed_mapmanagement",
		productKey: "mapmanagement",
		version: "2026-06-02.v1",
		productType: "ontology-product",
		environment: "Test",
		status: "applied",
		baseline: true,
		approvedBy: "Hana Al-Sayed",
		releaseChannel: "STABLE",
		promotionRunbookRef: "runbooks/product-release-promotion.md",
		rollbackRunbookRef: "runbooks/product-rollback.md",
		installedBy: "Hana Al-Sayed",
		installedByLens: "Admin lens",
		when: "2026-07-21",
		ts: 1784610000000,
		addedObjectTypes: ["ot_site", "ot_zone", "ot_storey"],
		addedLinkTypes: ["lt_site_zones", "lt_storey_site"],
		addedActionTypes: [],
		skipped: {objectTypes: [], linkTypes: [], actionTypes: []},
		plan: null,
		lifecycle: [
			{
				step: "apply",
				by: "Hana Al-Sayed",
				when: "2026-07-21",
				detail: "baseline provisioning of the fixture workspace — 3 object type(s), 2 link type(s), 0 action type(s)",
			},
		],
	},
];

/** Consuming projections keyed by route segment (prototype global PROJECTION_USAGE). */
export const WC3_PROJECTION_USAGE: Record<string, Wc3ProjectionUsage> = {
	command: {
		label: "Command Center",
		icon: "sliders",
		uses: ["ot_worker", "ot_permit", "ot_observation", "ot_activity", "ot_element", "ot_cert", "ot_zone"],
	},
	twin: {
		label: "Twin",
		icon: "cube",
		uses: [
			"ot_element",
			"ot_storey",
			"ot_zone",
			"ot_equipment",
			"ot_observation",
			"ot_permit",
			"ot_worker",
			"ot_activity",
		],
	},
	schedule: {
		label: "Schedule",
		icon: "calendar",
		uses: ["ot_activity", "ot_project", "ot_crew", "ot_element"],
	},
	workforce: {
		label: "Workforce",
		icon: "users",
		uses: ["ot_worker", "ot_crew", "ot_cert", "ot_zone", "ot_access_grant"],
	},
	processes: {
		label: "Processes",
		icon: "process",
		uses: ["ot_permit", "ot_observation", "ot_zone", "ot_worker"],
	},
	pipelines: {
		label: "Pipelines",
		icon: "pipeline",
		uses: ["ot_element", "ot_equipment", "ot_activity", "ot_worker"],
	},
};

/** Product catalog reduced to the fields the lineage tabs render. */
export const WC3_LINEAGE_PRODUCTS: Wc3LineageProduct[] = [
	{productKey: "capture", displayName: "Capture", productType: "ontology-product"},
	{productKey: "contracts", displayName: "Contracts", productType: "ontology-product"},
	{productKey: "datamanagement", displayName: "Datamanagement", productType: "ontology-product"},
	{productKey: "equipment", displayName: "Equipment", productType: "ontology-product"},
	{productKey: "gateway-mqtt-ingress", displayName: "Gateway MQTT Ingress", productType: "source-product"},
	{productKey: "labour", displayName: "Labour & Workforce", productType: "ontology-product"},
	{productKey: "mapmanagement", displayName: "Map Management", productType: "ontology-product"},
	{productKey: "media", displayName: "Media", productType: "ontology-product"},
	{productKey: "raw-device-events", displayName: "Raw Device Events", productType: "ontology-product"},
	{
		productKey: "reset-baseline-governed-action",
		displayName: "Reset Baseline Governed Action",
		productType: "ontology-product",
	},
	{productKey: "safety", displayName: "Safety & Compliance", productType: "ontology-product"},
	{productKey: "verifyprogress", displayName: "Verifyprogress", productType: "ontology-product"},
	{productKey: "verifytime", displayName: "Verifytime", productType: "ontology-product"},
	{
		productKey: "wirepas-device-simulator",
		displayName: "Wirepas Device Simulator",
		productType: "runtime-product",
	},
	{
		productKey: "wirepas-nms-ontology",
		displayName: "Wirepas NMS Ontology Product",
		productType: "ontology-product",
	},
	{productKey: "wirepas-nms-source", displayName: "Wirepas NMS Source Product", productType: "source-product"},
	{productKey: "wirepas-nms", displayName: "Wirepas NMS Product", productType: "composite-product"},
];

/** Product-type display metadata. The prototype's hex colours are dropped — use theme tokens. */
export const WC3_PRODUCT_TYPE_META: Record<string, Wc3ProductTypeMeta> = {
	"ontology-product": {label: "Ontology", icon: "layers"},
	"source-product": {label: "Source", icon: "database"},
	"runtime-product": {label: "Runtime", icon: "bolt"},
	"composite-product": {label: "Composite", icon: "component"},
	"application-product": {label: "Application", icon: "grid"},
	"pipeline-product": {label: "Pipeline", icon: "pipeline"},
	"compatibility-product": {label: "Compatibility", icon: "puzzle"},
};

/** Processes referenced by the impact map. */
export const WC3_LINEAGE_PROCESSES: Wc3LineageProcess[] = [
	{
		id: "proc_permit",
		name: "Digital Work Permit",
		objectTypeId: "ot_permit",
		transitions: [
			{actionTypeId: "at_submit_permit"},
			{actionTypeId: "at_start_permit_review"},
			{actionTypeId: "at_reject_permit"},
			{actionTypeId: "at_reject_permit"},
			{actionTypeId: "at_issue_permit"},
			{actionTypeId: "at_suspend_permit"},
			{actionTypeId: "at_resume_permit"},
			{actionTypeId: "at_extend_permit"},
			{actionTypeId: "at_close_permit"},
			{actionTypeId: "at_start_permit_review"},
		],
	},
	{
		id: "proc_obs",
		name: "Observation Manager",
		objectTypeId: "ot_observation",
		transitions: [
			{actionTypeId: "at_open_observation"},
			{actionTypeId: "at_close_observation"},
			{actionTypeId: "at_mark_false_alarm"},
			{actionTypeId: "at_mark_false_alarm"},
			{actionTypeId: "at_reopen_observation"},
			{actionTypeId: "at_reopen_observation"},
			{actionTypeId: "at_escalate_observation"},
			{actionTypeId: "at_close_observation"},
		],
	},
];

/**
 * Precomputed blast radius per object type, captured from the prototype's own impactOf() so the
 * Impact tab's counts match it exactly rather than being re-derived from a partial fixture.
 */
export const WC3_IMPACT: Record<string, Wc3Impact> = {
	ot_project: {
		pipelines: ["pipe_sched"],
		processes: [],
		actions: [],
		linkTypes: ["lt_project_sites", "lt_activity_project"],
		interfaces: [],
		projections: ["schedule"],
	},
	ot_site: {
		pipelines: [],
		processes: [],
		actions: [],
		linkTypes: ["lt_project_sites", "lt_site_zones", "lt_equipment_site", "lt_storey_site"],
		interfaces: ["if_locatable"],
		projections: [],
	},
	ot_zone: {
		pipelines: ["pipe_tel"],
		processes: ["proc_permit", "proc_obs"],
		actions: ["at_record_observation", "at_grant_access"],
		linkTypes: [
			"lt_site_zones",
			"lt_activity_zone",
			"lt_worker_zone_access",
			"lt_sensor_zone",
			"lt_obs_zone",
			"lt_delivery_zone",
			"lt_crew_zone",
			"lt_element_zone",
			"lt_permit_zone",
		],
		interfaces: [],
		projections: ["command", "twin", "workforce", "processes"],
	},
	ot_worker: {
		pipelines: ["pipe_tel"],
		processes: ["proc_permit", "proc_obs"],
		actions: ["at_record_observation", "at_grant_access", "at_reassign_sensor", "at_close_observation"],
		linkTypes: [
			"lt_crew_members",
			"lt_worker_zone_access",
			"lt_sensor_assignment",
			"lt_obs_reporter",
			"lt_permit_receiver",
			"lt_cert_worker",
		],
		interfaces: [],
		projections: ["command", "twin", "workforce", "processes", "pipelines"],
	},
	ot_crew: {
		pipelines: ["pipe_tel"],
		processes: [],
		actions: ["at_assign_crew"],
		linkTypes: ["lt_crew_members", "lt_crew_assignments", "lt_crew_zone", "lt_equipment_crew"],
		interfaces: [],
		projections: ["schedule", "workforce"],
	},
	ot_activity: {
		pipelines: ["pipe_sched"],
		processes: [],
		actions: ["at_assign_crew", "at_report_progress", "at_report_delay"],
		linkTypes: [
			"lt_crew_assignments",
			"lt_activity_zone",
			"lt_activity_project",
			"lt_delivery_activity",
			"lt_element_activity",
			"lt_activity_equipment",
		],
		interfaces: [],
		projections: ["command", "twin", "schedule", "pipelines"],
	},
	ot_equipment: {
		pipelines: ["pipe_bim"],
		processes: [],
		actions: ["at_retire_equipment"],
		linkTypes: ["lt_equipment_site", "lt_permit_equipment", "lt_activity_equipment", "lt_equipment_crew"],
		interfaces: [],
		projections: ["twin", "pipelines"],
	},
	ot_sensor: {
		pipelines: [],
		processes: [],
		actions: ["at_reassign_sensor"],
		linkTypes: ["lt_sensor_assignment", "lt_sensor_zone"],
		interfaces: [],
		projections: [],
	},
	ot_observation: {
		pipelines: [],
		processes: ["proc_obs"],
		actions: [
			"at_record_observation",
			"at_open_observation",
			"at_close_observation",
			"at_mark_false_alarm",
			"at_reopen_observation",
			"at_escalate_observation",
		],
		linkTypes: ["lt_obs_zone", "lt_obs_reporter"],
		interfaces: [],
		projections: ["command", "twin", "processes"],
	},
	ot_access_grant: {
		pipelines: [],
		processes: [],
		actions: ["at_grant_access"],
		linkTypes: [],
		interfaces: [],
		projections: ["workforce"],
	},
	ot_lint_demo: {pipelines: [], processes: [], actions: [], linkTypes: [], interfaces: [], projections: []},
	ot_storey: {
		pipelines: [],
		processes: [],
		actions: [],
		linkTypes: ["lt_storey_site", "lt_element_storey"],
		interfaces: [],
		projections: ["twin"],
	},
	ot_element: {
		pipelines: ["pipe_bim"],
		processes: [],
		actions: ["at_update_install_status", "at_verify_element_qty"],
		linkTypes: ["lt_element_storey", "lt_element_activity", "lt_element_zone"],
		interfaces: [],
		projections: ["command", "twin", "schedule", "pipelines"],
	},
	ot_permit: {
		pipelines: [],
		processes: ["proc_permit"],
		actions: [
			"at_submit_permit",
			"at_start_permit_review",
			"at_reject_permit",
			"at_issue_permit",
			"at_suspend_permit",
			"at_resume_permit",
			"at_close_permit",
			"at_extend_permit",
		],
		linkTypes: ["lt_permit_zone", "lt_permit_receiver", "lt_permit_equipment"],
		interfaces: [],
		projections: ["command", "twin", "processes"],
	},
	ot_cert: {
		pipelines: [],
		processes: ["proc_permit"],
		actions: ["at_renew_certification"],
		linkTypes: ["lt_cert_worker"],
		interfaces: [],
		projections: ["command", "workforce"],
	},
	ot_delivery: {
		pipelines: [],
		processes: [],
		actions: [],
		linkTypes: ["lt_delivery_zone", "lt_delivery_activity"],
		interfaces: [],
		projections: [],
	},
};

/* ---------------------------------------------------------------- helpers */

const PIPE_BY_ID = new Map(WC3_PIPELINES.map((p) => [p.id, p]));
const PROC_BY_ID = new Map(WC3_LINEAGE_PROCESSES.map((p) => [p.id, p]));
const INSTALL_BY_ID = new Map(WC3_INSTALLS.map((i) => [i.id, i]));
const PRODUCT_BY_KEY = new Map(WC3_LINEAGE_PRODUCTS.map((p) => [p.productKey, p]));

export const getPipeline = (id: string) => PIPE_BY_ID.get(id);
export const getLineageProcess = (id: string) => PROC_BY_ID.get(id);
export const getInstall = (id: string) => INSTALL_BY_ID.get(id);
export const getLineageProduct = (key: string) => PRODUCT_BY_KEY.get(key);
export const productTypeMeta = (t: string): Wc3ProductTypeMeta =>
	WC3_PRODUCT_TYPE_META[t] ?? {label: t || "product", icon: "box"};

/** Installs that actually shaped the store — the roots of the data lineage DAG. */
export const appliedInstalls = () => WC3_INSTALLS.filter((i) => i.status === "applied");

/** Object types a product install put in the store (reads provenance off WC3_OBJECT_TYPES). */
export function typesFromProduct(productKey: string): Wc3ObjectType[] {
	return WC3_OBJECT_TYPES.filter((o) => o.installedBy?.productKey === productKey);
}

/** A datasource/drop node, paired with the pipeline it belongs to. `id` is "<pipelineId>:<nodeId>". */
export type Wc3LineageSource = {id: string; name: string; pipeline: Wc3Pipeline; node: Wc3PipelineNode};

/** Every node in the "Sources" category across all pipelines, in prototype order. */
export function lineageSources(): Wc3LineageSource[] {
	const out: Wc3LineageSource[] = [];
	for (const pipeline of WC3_PIPELINES)
		for (const node of pipeline.nodes)
			if (WC3_NODE_KINDS[node.kind]?.cat === "Sources")
				out.push({id: `${pipeline.id}:${node.id}`, name: node.label, pipeline, node});
	return out;
}

/** Object type ids that some pipeline syncs into, deduped, in first-seen order. */
export function syncedObjectTypeIds(): string[] {
	const seen = new Set<string>();
	for (const p of WC3_PIPELINES)
		for (const n of p.nodes) if (n.kind === "sink_sync" && n.params.targetOt) seen.add(n.params.targetOt);
	return [...seen];
}

/** Pipelines that touch an object type — as a sync target or through a node kind's declared refs. */
export function pipelinesForObjectType(otId: string): Wc3Pipeline[] {
	return WC3_PIPELINES.filter((p) =>
		p.nodes.some((n) => n.params.targetOt === otId || (WC3_NODE_KINDS[n.kind]?.refs ?? []).includes(otId)),
	);
}

/** Projection keys that consume an object type. */
export function projectionsForObjectType(otId: string): string[] {
	return Object.keys(WC3_PROJECTION_USAGE).filter((k) => (WC3_PROJECTION_USAGE[k]?.uses ?? []).includes(otId));
}

/** Runs of one action type, newest first. */
export function runsForActionType(atId: string): Wc3ActionRun[] {
	return WC3_ACTION_RUNS.filter((r) => r.atId === atId).sort((a, b) => b.ts - a.ts);
}

/** All action runs, newest first — the order the Workflow lineage list renders in. */
export const actionRunsNewestFirst = () => WC3_ACTION_RUNS.slice().sort((a, b) => b.ts - a.ts);

/** Blast radius for an object type; empty (not undefined) for a type with no references. */
export function impactFor(otId: string): Wc3Impact {
	return (
		WC3_IMPACT[otId] ?? {pipelines: [], processes: [], actions: [], linkTypes: [], interfaces: [], projections: []}
	);
}
