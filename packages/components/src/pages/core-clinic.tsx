import type {ColumnDef} from "@tanstack/react-table";
import type {EChartsOption} from "echarts";

import {cn} from "@corensystem/core-utils";
import {
	Activity,
	Archive,
	Building2,
	CalendarClock,
	ArrowRight,
	CalendarPlus,
	CircleCheck,
	CircleX,
	Clock,
	Download,
	Eye,
	HeartPulse,
	ListOrdered,
	Pencil,
	Plus,
	Save,
	Settings,
	ShieldCheck,
	Stethoscope,
	Box,
	Dna,
	Folder,
	Link2,
	Network,
	Puzzle,
	Trash2,
	TriangleAlert,
	Upload,
	UserCog,
	Users,
	Zap,
} from "lucide-react";
import {useMemo, useState} from "react";

import {AddClinicLocationDialog} from "../add-clinic-location-dialog";
import {AddClinicVisitDialog, type AddClinicVisitOption} from "../add-clinic-visit-dialog";
import {AssignDoctorDialog, type AssignDoctorOption} from "../assign-doctor-dialog";
import {AttentionList, AttentionListItem} from "../attention-list";
import {Avatar, AvatarFallback} from "../avatar";
import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import {Checkbox} from "../checkbox";
import {DataTable, DataTableColumnHeader, DataTableRowActions} from "../data-table";
import {Field, FieldLabel} from "../field";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {FormActionBar} from "../form-action-bar";
import {Input} from "../input";
import {MetricCard} from "../metric-card";
import {CoreAppSidebar, type SidebarNavGroup} from "../navigation/core-app-sidebar";
import {CoreAppTopBar} from "../navigation/core-app-top-bar";
import {PageContentHeader} from "../page-content-header";
import {ProgressStat} from "../progress-stat";
import {RuleList, RuleRow} from "../rule-row";
import {ScoreGauge} from "../score-gauge";
import {SectionHeader} from "../section-header";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {SideMenu, type SideMenuGroup} from "../side-menu";
import {Toaster} from "../sonner";
import {Tabs, TabsList, TabsTrigger} from "../tabs";
import {HoverTooltip} from "../tooltip";
import {TrendChart} from "../trend-chart";
import type {ViewTabItem} from "../view-tab-bar";
import {ontologyScopeCounts, type OntologyScope} from "./wc3-ontology-scope";
import {ONTOLOGY_VIEWS} from "./wc3-ontology-views";

// Clinic — the occupational-health template scaffold, built on the same bones as Safety Manager.
// A full app shell (CoreAppSidebar + CoreAppTopBar) with a single "Clinic" sidebar entry. The
// content area toggles between the route header (Overview / Worker Fitness tabs + a Settings
// action) and a Settings sub-surface (SideMenu + content). Overview is still a placeholder; Worker
// Fitness is a live list. Settings carries four panes — Visit Frequency and Age-Based Rules edit a
// draft and commit through the shared FormActionBar, while Clinics and Doctors act immediately.

type SidebarNavItemLite = {id: string; label: string; icon: React.ComponentType<{className?: string}>};

const NAV_ITEMS: SidebarNavItemLite[] = [{id: "clinic", label: "Clinic", icon: Stethoscope}];

const CLINIC_GROUPS: SidebarNavGroup[] = [{items: NAV_ITEMS}];

type ClinicTabId = "overview" | "worker-fitness";

const TABS: ViewTabItem<ClinicTabId>[] = [
	{id: "overview", label: "Overview", icon: Activity},
	{id: "worker-fitness", label: "Worker Fitness", icon: HeartPulse},
];

type SettingId =
	| "visit-frequency"
	| "age-rules"
	| "clinics"
	| "doctors"
	| "object-types"
	| "link-types"
	| "action-types"
	| "interfaces"
	| "shared-properties"
	| "type-groups"
	| "graph";

// The slice of the WC3 ontology this product owns. Clinic is about worker fitness to work, so it
// keeps the people and the credentials that gate them, plus the site context those hang off. Only
// object types are named — every other tab is DERIVED by wc3-ontology-scope.ts. Module-level on
// purpose: the shared views memoise on this object's identity.
const CLINIC_ONTOLOGY_SCOPE: OntologyScope = {
	objectTypeIds: ["ot_worker", "ot_cert", "ot_zone", "ot_site", "ot_project"],
};

// Counts come from the same derivation the tables use, so a badge cannot drift from its table.
const ONTOLOGY_COUNTS = ontologyScopeCounts(CLINIC_ONTOLOGY_SCOPE);

const SETTINGS_GROUPS: SideMenuGroup[] = [
	{
		label: "System",
		items: [
			{id: "visit-frequency", label: "Visit Frequency", icon: CalendarClock},
			{id: "age-rules", label: "Age-Based Rules", icon: ListOrdered},
			{id: "clinics", label: "Clinics", icon: Building2},
			{id: "doctors", label: "Doctors", icon: UserCog},
		],
	},
	{
		label: "Ontology",
		items: [
			{id: "object-types", label: "Object types", icon: Box, count: ONTOLOGY_COUNTS["object-types"]},
			{id: "link-types", label: "Link types", icon: Link2, count: ONTOLOGY_COUNTS["link-types"]},
			{id: "action-types", label: "Action types", icon: Zap, count: ONTOLOGY_COUNTS["action-types"]},
			{id: "interfaces", label: "Interfaces", icon: Dna, count: ONTOLOGY_COUNTS.interfaces},
			{id: "shared-properties", label: "Shared properties", icon: Puzzle, count: ONTOLOGY_COUNTS["shared-properties"]},
			{id: "type-groups", label: "Type groups", icon: Folder, count: ONTOLOGY_COUNTS["type-groups"]},
			{id: "graph", label: "Graph explorer", icon: Network, count: ONTOLOGY_COUNTS["link-types"]},
		],
	},
];

// Which shared ontology view backs each Settings item. The admin registry calls the groups tab
// "groups" while Settings calls it "type-groups", so the ids cannot simply be reused.
const ONTOLOGY_SETTING_VIEW_IDS: Record<string, string> = {
	"object-types": "object-types",
	"link-types": "link-types",
	"action-types": "action-types",
	interfaces: "interfaces",
	"shared-properties": "shared-properties",
	"type-groups": "groups",
	graph: "graph",
};

// Descriptions for the ontology settings header band, mirroring the admin's tab placeholders.
const ONTOLOGY_DESCRIPTION: Record<string, string> = {
	"object-types": "Define the object types this product works with.",
	"link-types": "Define how those object types relate to one another.",
	"action-types": "Configure the actions that can be run against them.",
	interfaces: "Manage shared interfaces object types can implement.",
	"shared-properties": "Manage properties reused across object types.",
	"type-groups": "Group related types for navigation and permissions.",
	graph: "Explore how this product's object types relate to one another.",
};

const SETTINGS_ITEMS = SETTINGS_GROUPS.flatMap((group) => group.items);

const settingLabel = (id: string) => SETTINGS_ITEMS.find((item) => item.id === id)?.label ?? "Settings";
const tabLabel = (id: ClinicTabId) => TABS.find((tab) => tab.id === id)?.label ?? "";

// ─── Worker Fitness (tab data) ───────────────────────────────────────────────

type FitnessStatus = "fit" | "unfit" | "pending" | "overdue";

const FITNESS_LABEL: Record<FitnessStatus, string> = {
	fit: "Fit",
	unfit: "Unfit",
	pending: "Pending re-eval",
	overdue: "Overdue",
};

// Status renders as a colored dot + label, not a Badge — matching the sample, where the dot is the
// only chrome and the "last seen" line sits under it.
const FITNESS_DOT: Record<FitnessStatus, string> = {
	fit: "wwc:bg-green-500",
	unfit: "wwc:bg-red-500",
	pending: "wwc:bg-amber-500",
	overdue: "wwc:bg-red-500",
};

type FitnessWorker = {
	id: string;
	name: string;
	/** Worker code shown under the name. */
	code: string;
	company: string;
	trade: string;
	status: FitnessStatus;
	/** Date the worker was last seen by the clinic, shown under the status. */
	lastSeen: string;
	totalVisits: number;
	lastVisit: string;
	nextDue: string;
};

const FITNESS_WORKERS: FitnessWorker[] = [
	{
		id: "w-1",
		name: "Chandra Bahadur Gurung",
		code: "2500796962",
		company: "TR-KAEFER",
		trade: "DIRECT-SCAFFOLDER",
		status: "fit",
		lastSeen: "20 Jul 2026",
		totalVisits: 1,
		lastVisit: "20 Jul 2026",
		nextDue: "20 Jan 2027",
	},
	{
		id: "w-2",
		name: "Mohammad Gulshad",
		code: "2563104617",
		company: "TR-KAEFER",
		trade: "DIRECT-SCAFFOLDING HELPER",
		status: "fit",
		lastSeen: "20 Jul 2026",
		totalVisits: 1,
		lastVisit: "20 Jul 2026",
		nextDue: "20 Jan 2027",
	},
	{
		id: "w-3",
		name: "SIKANDAR KHAN",
		code: "2554629937",
		company: "TR",
		trade: "Indirect-HVAC SUPERVISOR",
		status: "fit",
		lastSeen: "20 Jul 2026",
		totalVisits: 1,
		lastVisit: "20 Jul 2026",
		nextDue: "20 Jan 2027",
	},
	{
		id: "w-4",
		name: "DILIP BISWAS MATILAL BISWAS",
		code: "2272360658",
		company: "TR-SFEC",
		trade: "Direct-Carpenter",
		status: "fit",
		lastSeen: "20 Jul 2026",
		totalVisits: 1,
		lastVisit: "20 Jul 2026",
		nextDue: "20 Jan 2027",
	},
	{
		id: "w-5",
		name: "MD ASHRAF",
		code: "W3309449",
		company: "TR-AIC",
		trade: "DIRECT-Pipe Fitter",
		status: "fit",
		lastSeen: "19 Jul 2026",
		totalVisits: 1,
		lastVisit: "19 Jul 2026",
		nextDue: "19 Jan 2027",
	},
	{
		id: "w-6",
		name: "MOHAMMED JAMIL",
		code: "2533496325",
		company: "TR-ELECO",
		trade: "DIRECT-SCAFFOLDER",
		status: "fit",
		lastSeen: "18 Jul 2026",
		totalVisits: 1,
		lastVisit: "18 Jul 2026",
		nextDue: "18 Jan 2027",
	},
	{
		id: "w-7",
		name: "MD SAIFUL ISLAM MD",
		code: "2469410498",
		company: "TR-SFEC",
		trade: "Direct-Steel Fixer",
		status: "fit",
		lastSeen: "18 Jul 2026",
		totalVisits: 1,
		lastVisit: "18 Jul 2026",
		nextDue: "18 Jan 2027",
	},
	{
		id: "w-8",
		name: "NARAYAN DEEP CHAND",
		code: "2327348492",
		company: "TR-SFEC",
		trade: "Direct-Carpenter",
		status: "fit",
		lastSeen: "20 Jul 2026",
		totalVisits: 2,
		lastVisit: "20 Jul 2026",
		nextDue: "20 Jan 2027",
	},
	{
		id: "w-9",
		name: "SHAMSHAD ALI MOHAMMAD KHALIL",
		code: "2326588767",
		company: "TR-SFEC",
		trade: "Direct-Carpenter",
		status: "fit",
		lastSeen: "20 Jul 2026",
		totalVisits: 2,
		lastVisit: "20 Jul 2026",
		nextDue: "20 Jan 2027",
	},
	{
		id: "w-10",
		name: "RAJESH KUMAR YADAV",
		code: "2318874401",
		company: "TR-KAEFER",
		trade: "Direct-Welder",
		status: "pending",
		lastSeen: "02 Feb 2026",
		totalVisits: 3,
		lastVisit: "02 Feb 2026",
		nextDue: "02 Aug 2026",
	},
	{
		id: "w-11",
		name: "ABDUL RAHMAN SIDDIQUI",
		code: "2401553120",
		company: "TR-AIC",
		trade: "Indirect-Store Keeper",
		status: "overdue",
		lastSeen: "11 Sep 2025",
		totalVisits: 2,
		lastVisit: "11 Sep 2025",
		nextDue: "11 Mar 2026",
	},
	{
		id: "w-12",
		name: "SURESH CHANDRA PATEL",
		code: "2287410093",
		company: "TR-ELECO",
		trade: "Direct-Electrician",
		status: "overdue",
		lastSeen: "24 Jun 2025",
		totalVisits: 1,
		lastVisit: "24 Jun 2025",
		nextDue: "24 Dec 2025",
	},
];

// ─── Visit Logs (Worker Fitness sub-tab) ─────────────────────────────────────

type VisitLog = {
	id: string;
	workerName: string;
	/** Worker code, or the company name for visitors who have no code. */
	workerRef: string;
	/** Visitors are contractors/guests without a worker record — flagged with a badge. */
	isVisitor?: boolean;
	dateTime: string;
	duration: string;
	outcome: FitnessStatus;
	reason: string;
	clinic: string;
	loggedBy: string;
};

const VISIT_LOGS: VisitLog[] = [
	{
		id: "v-1",
		workerName: "NARAYAN DEEP CHAND",
		workerRef: "2327348492",
		dateTime: "20 Jul 2026, 16:25",
		duration: "10m",
		outcome: "fit",
		reason: "Illness / Symptoms",
		clinic: "TR-TCF CLINIC",
		loggedBy: "RIYASCLINIC",
	},
	{
		id: "v-2",
		workerName: "HASSAN SHEIKH",
		workerRef: "2444509018",
		dateTime: "20 Jul 2026, 16:20",
		duration: "5m",
		outcome: "fit",
		reason: "Illness / Symptoms",
		clinic: "TR-TCF CLINIC",
		loggedBy: "RIYASCLINIC",
	},
	{
		id: "v-3",
		workerName: "SHAMSHAD ALI MOHAMMAD KHALIL",
		workerRef: "2326588767",
		dateTime: "20 Jul 2026, 16:15",
		duration: "5m",
		outcome: "fit",
		reason: "Illness / Symptoms",
		clinic: "TR-TCF CLINIC",
		loggedBy: "RIYASCLINIC",
	},
	{
		id: "v-4",
		workerName: "IBRAHIM BAHAA",
		workerRef: "AERAMCO",
		isVisitor: true,
		dateTime: "20 Jul 2026, 15:30",
		duration: "10m",
		outcome: "fit",
		reason: "Illness / Symptoms",
		clinic: "TR-TCF CLINIC",
		loggedBy: "RIYASCLINIC",
	},
	{
		id: "v-5",
		workerName: "THOMAS THOMAS",
		workerRef: "W0892276",
		dateTime: "20 Jul 2026, 15:05",
		duration: "10m",
		outcome: "fit",
		reason: "Illness / Symptoms",
		clinic: "TR-TCF CLINIC",
		loggedBy: "RIYASCLINIC",
	},
	{
		id: "v-6",
		workerName: "VIJAYANATHAN",
		workerRef: "TR",
		isVisitor: true,
		dateTime: "20 Jul 2026, 12:30",
		duration: "15m",
		outcome: "fit",
		reason: "Illness / Symptoms",
		clinic: "TR-TCF CLINIC",
		loggedBy: "RIYASCLINIC",
	},
	{
		id: "v-7",
		workerName: "Chandra Bahadur Gurung",
		workerRef: "2500796962",
		dateTime: "20 Jul 2026, 09:40",
		duration: "20m",
		outcome: "fit",
		reason: "Illness / Symptoms",
		clinic: "TR-TCF CLINIC",
		loggedBy: "RIYASCLINIC",
	},
	{
		id: "v-8",
		workerName: "Mohammad Gulshad",
		workerRef: "2563104617",
		dateTime: "20 Jul 2026, 09:30",
		duration: "10m",
		outcome: "fit",
		reason: "Follow-up",
		clinic: "TR-TCF CLINIC",
		loggedBy: "RIYASCLINIC",
	},
	{
		id: "v-9",
		workerName: "MAHENDRA PUN MAGAR",
		workerRef: "2477320739",
		dateTime: "20 Jul 2026, 09:15",
		duration: "10m",
		outcome: "fit",
		reason: "Follow-up",
		clinic: "TR-TCF CLINIC",
		loggedBy: "RIYASCLINIC",
	},
	{
		id: "v-10",
		workerName: "RAJESH KUMAR YADAV",
		workerRef: "2318874401",
		dateTime: "19 Jul 2026, 14:50",
		duration: "25m",
		outcome: "pending",
		reason: "Periodic Medical",
		clinic: "TR-PKG2 CLINIC",
		loggedBy: "RIYASCLINIC",
	},
	{
		id: "v-11",
		workerName: "SURESH CHANDRA PATEL",
		workerRef: "2287410093",
		dateTime: "19 Jul 2026, 11:05",
		duration: "30m",
		outcome: "unfit",
		reason: "Injury / Incident",
		clinic: "TR-PKG2 CLINIC",
		loggedBy: "AHMEDCLINIC",
	},
];

const VISIT_REASONS = Array.from(new Set(VISIT_LOGS.map((visit) => visit.reason))).sort();
const VISIT_CLINICS = Array.from(new Set(VISIT_LOGS.map((visit) => visit.clinic))).sort();

// ─── New Clinic Visit form options ───────────────────────────────────────────

const VISIT_WORKER_OPTIONS: AddClinicVisitOption[] = FITNESS_WORKERS.map((worker) => ({
	value: worker.id,
	label: `${worker.name} — ${worker.code}`,
}));

const VISIT_CLINIC_OPTIONS: AddClinicVisitOption[] = VISIT_CLINICS.map((clinic) => ({value: clinic, label: clinic}));

const VISIT_REASON_OPTIONS: AddClinicVisitOption[] = VISIT_REASONS.map((reason) => ({value: reason, label: reason}));

const VISIT_OUTCOME_OPTIONS: AddClinicVisitOption[] = (Object.keys(FITNESS_LABEL) as FitnessStatus[])
	// "Overdue" is a derived scheduling state, not something a clinician records at the visit.
	.filter((status) => status !== "overdue")
	.map((status) => ({value: status, label: FITNESS_LABEL[status]}));

/** The New Visit dialog, shared by the Workers and Visit Logs toolbars. */
function NewVisitDialog() {
	return (
		<AddClinicVisitDialog
			workers={VISIT_WORKER_OPTIONS}
			clinics={VISIT_CLINIC_OPTIONS}
			reasons={VISIT_REASON_OPTIONS}
			fitnessOutcomes={VISIT_OUTCOME_OPTIONS}
			trigger={
				<Button>
					<Plus className="wwc:h-4 wwc:w-4" />
					New Visit
				</Button>
			}
		/>
	);
}

function makeVisitColumns(): ColumnDef<VisitLog>[] {
	return [
		{
			id: "select",
			enableSorting: false,
			enableHiding: false,
			meta: {cellClassName: "wwc:w-px wwc:pr-0"},
			header: ({table}) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false
					}
					onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
					aria-label="Select all"
				/>
			),
			cell: ({row}) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(v) => row.toggleSelected(!!v)}
					aria-label="Select row"
				/>
			),
		},
		{
			accessorKey: "workerName",
			header: ({column}) => <DataTableColumnHeader column={column} title="Worker" />,
			cell: ({row}) => (
				<div className="wwc:flex wwc:items-center wwc:gap-3">
					<Avatar className="wwc:h-7 wwc:w-7">
						<AvatarFallback className="wwc:text-[10px]">{initials(row.original.workerName)}</AvatarFallback>
					</Avatar>
					<div className="wwc:min-w-0">
						<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:font-medium">
							{row.original.workerName}
							{row.original.isVisitor && (
								<Badge variant="infoSoft" className="wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
									Visitor
								</Badge>
							)}
						</span>
						<span className="wwc:text-xs wwc:text-muted-foreground">{row.original.workerRef}</span>
					</div>
				</div>
			),
		},
		{
			accessorKey: "dateTime",
			header: ({column}) => <DataTableColumnHeader column={column} title="Date/Time" />,
		},
		{
			accessorKey: "duration",
			header: ({column}) => <DataTableColumnHeader column={column} title="Duration" />,
		},
		{
			accessorKey: "outcome",
			header: ({column}) => <DataTableColumnHeader column={column} title="Outcome" />,
			cell: ({row}) => (
				<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:font-medium">
					<span className={cn("wwc:h-2 wwc:w-2 wwc:shrink-0 wwc:rounded-full", FITNESS_DOT[row.original.outcome])} />
					{FITNESS_LABEL[row.original.outcome]}
				</span>
			),
		},
		{
			accessorKey: "reason",
			header: ({column}) => <DataTableColumnHeader column={column} title="Reason" />,
		},
		{
			accessorKey: "clinic",
			header: ({column}) => <DataTableColumnHeader column={column} title="Clinic" />,
		},
		{
			accessorKey: "loggedBy",
			header: ({column}) => <DataTableColumnHeader column={column} title="Logged by" />,
		},
		{
			id: "actions",
			enableSorting: false,
			enableHiding: false,
			meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:overflow-visible wwc:whitespace-nowrap wwc:text-right"},
			cell: () => (
				<DataTableRowActions
					actions={[
						{label: "View visit", icon: <Eye className="wwc:h-4 wwc:w-4" />},
						{label: "Schedule follow-up", icon: <CalendarPlus className="wwc:h-4 wwc:w-4" />},
					]}
				/>
			),
		},
	];
}

const FITNESS_KPIS: {
	title: string;
	value: string;
	status?: "success" | "warning" | "danger";
	icon: React.ElementType;
	trend?: "up";
	trendLabel?: string;
}[] = [
	{title: "Active Workers", value: "973", icon: Users},
	{title: "Fit", value: "955", status: "success", icon: ShieldCheck},
	{title: "Unfit", value: "0", status: "warning", icon: CircleX},
	{title: "Pending re-eval", value: "18", status: "warning", icon: Clock},
	{
		title: "Overdue Workers",
		value: "565",
		status: "danger",
		icon: TriangleAlert,
		trend: "up",
		trendLabel: "+10 vs last week",
	},
];

const FITNESS_COMPANIES = Array.from(new Set(FITNESS_WORKERS.map((worker) => worker.company))).sort();
const FITNESS_TRADES = Array.from(new Set(FITNESS_WORKERS.map((worker) => worker.trade))).sort();

/** Initials for the avatar fallback, mirroring the workforce worker table. */
function initials(name: string) {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");
}

/** Toolbar icon button with a tooltip standing in for the label. */
function IconAction({label, icon}: {label: string; icon: React.ReactNode}) {
	return (
		<HoverTooltip content={label}>
			<Button variant="outline" icon aria-label={label}>
				{icon}
			</Button>
		</HoverTooltip>
	);
}

function makeFitnessColumns(onView: (worker: FitnessWorker) => void): ColumnDef<FitnessWorker>[] {
	return [
		{
			id: "select",
			enableSorting: false,
			enableHiding: false,
			meta: {cellClassName: "wwc:w-px wwc:pr-0"},
			header: ({table}) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false
					}
					onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
					aria-label="Select all"
				/>
			),
			cell: ({row}) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(v) => row.toggleSelected(!!v)}
					aria-label="Select row"
				/>
			),
		},
		{
			accessorKey: "name",
			header: ({column}) => <DataTableColumnHeader column={column} title="Worker" />,
			cell: ({row}) => (
				<div className="wwc:flex wwc:items-center wwc:gap-3">
					<Avatar className="wwc:h-7 wwc:w-7">
						<AvatarFallback className="wwc:text-[10px]">{initials(row.original.name)}</AvatarFallback>
					</Avatar>
					<div className="wwc:min-w-0">
						<button
							type="button"
							onClick={() => onView(row.original)}
							className="wwc:block wwc:text-left wwc:font-medium wwc:transition-colors wwc:hover:text-primary"
						>
							{row.original.name}
						</button>
						<span className="wwc:text-xs wwc:text-muted-foreground">{row.original.code}</span>
					</div>
				</div>
			),
		},
		{
			accessorKey: "company",
			header: ({column}) => <DataTableColumnHeader column={column} title="Company" />,
		},
		{
			accessorKey: "trade",
			header: ({column}) => <DataTableColumnHeader column={column} title="Trade" />,
		},
		{
			accessorKey: "status",
			header: ({column}) => <DataTableColumnHeader column={column} title="Current Status" />,
			cell: ({row}) => (
				<div className="wwc:min-w-0">
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:font-medium">
						<span className={cn("wwc:h-2 wwc:w-2 wwc:shrink-0 wwc:rounded-full", FITNESS_DOT[row.original.status])} />
						{FITNESS_LABEL[row.original.status]}
					</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">last seen {row.original.lastSeen}</span>
				</div>
			),
		},
		{
			accessorKey: "totalVisits",
			header: ({column}) => <DataTableColumnHeader column={column} title="Total Visits" />,
		},
		{
			accessorKey: "lastVisit",
			header: ({column}) => <DataTableColumnHeader column={column} title="Last Visit" />,
		},
		{
			accessorKey: "nextDue",
			header: ({column}) => <DataTableColumnHeader column={column} title="Next Due" />,
		},
		{
			id: "actions",
			enableSorting: false,
			enableHiding: false,
			meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:overflow-visible wwc:whitespace-nowrap wwc:text-right"},
			cell: ({row}) => (
				<DataTableRowActions
					actions={[
						{label: "View worker", icon: <Eye className="wwc:h-4 wwc:w-4" />, onSelect: () => onView(row.original)},
						{label: "Log a visit", icon: <CalendarPlus className="wwc:h-4 wwc:w-4" />},
					]}
				/>
			),
		},
	];
}

/** Worker Fitness — KPI row, Workers/Visit Logs tabs, and the reusable DataTable. */
function WorkerFitnessView() {
	const [listTab, setListTab] = useState<"workers" | "visit-logs">("workers");
	const [filters, setFilters] = useState<FilterValue>({});

	const [visitFilters, setVisitFilters] = useState<FilterValue>({});

	const columns = useMemo(() => makeFitnessColumns(() => {}), []);
	const visitColumns = useMemo(() => makeVisitColumns(), []);

	const data = useMemo(
		() =>
			FITNESS_WORKERS.filter((worker) =>
				Object.entries(filters).every(([key, selected]) => {
					if (!selected || selected.length === 0) return true;
					return selected.includes(String(worker[key as keyof FitnessWorker]));
				}),
			),
		[filters],
	);

	const visits = useMemo(
		() =>
			VISIT_LOGS.filter((visit) =>
				Object.entries(visitFilters).every(([key, selected]) => {
					if (!selected || selected.length === 0) return true;
					return selected.includes(String(visit[key as keyof VisitLog]));
				}),
			),
		[visitFilters],
	);

	return (
		<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
			{/* Gaps are set per-child, not with space-y: DataTable's toolbar already carries its own
			    top padding, so a blanket space-y would double the gap under the tabs. */}
			<div className="wwc:w-full wwc:p-6">
				{/* Always one row — the five fitness KPIs read as a single band, so they don't reflow at
				    narrow widths; the row scrolls sideways instead of wrapping. */}
				<div className="wwc:mb-4 wwc:grid wwc:grid-cols-5 wwc:gap-4">
					{FITNESS_KPIS.map((kpi) => (
						<MetricCard
							key={kpi.title}
							title={kpi.title}
							value={kpi.value}
							status={kpi.status}
							icon={kpi.icon}
							trend={kpi.trend}
							trendLabel={kpi.trendLabel}
						/>
					))}
				</div>

				<Tabs value={listTab} onValueChange={(value) => setListTab(value as "workers" | "visit-logs")}>
					<TabsList>
						<TabsTrigger value="workers">
							Workers
							<Badge variant="secondary" className="wwc:ml-2 wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
								973
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="visit-logs">
							Visit Logs
							<Badge variant="secondary" className="wwc:ml-2 wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
								5478
							</Badge>
						</TabsTrigger>
					</TabsList>
				</Tabs>

				{listTab === "workers" ? (
					<Filter value={filters} onChange={setFilters}>
						<DataTable
							columns={columns}
							data={data}
							searchKey="name"
							searchPlaceholder="Search by name, code, company…"
							showColumnToggle
							recordLabel="worker"
							pageSize={10}
							getRowId={(row) => row.id}
							bulkActions={[
								{
									label: "Log visits",
									icon: <CalendarPlus className="wwc:h-4 wwc:w-4" />,
									onClick: () => {},
								},
								{
									label: "Export",
									icon: <Download className="wwc:h-4 wwc:w-4" />,
									variant: "outline",
									onClick: () => {},
								},
							]}
							toolbarExtra={
								<>
									<FilterTrigger />
									<FilterContent>
										<FilterCategory value="company" label="Company">
											{FITNESS_COMPANIES.map((company) => (
												<FilterOption key={company} value={company}>
													{company}
												</FilterOption>
											))}
										</FilterCategory>
										<FilterCategory value="trade" label="Trade">
											{FITNESS_TRADES.map((trade) => (
												<FilterOption key={trade} value={trade}>
													{trade}
												</FilterOption>
											))}
										</FilterCategory>
										<FilterCategory value="status" label="Current Status">
											{(Object.keys(FITNESS_LABEL) as FitnessStatus[]).map((status) => (
												<FilterOption key={status} value={status}>
													{FITNESS_LABEL[status]}
												</FilterOption>
											))}
										</FilterCategory>
									</FilterContent>
									<IconAction label="Bulk Upload" icon={<Upload className="wwc:h-4 wwc:w-4" />} />
									<IconAction label="Export (.xlsx)" icon={<Download className="wwc:h-4 wwc:w-4" />} />
									<NewVisitDialog />
								</>
							}
						/>
					</Filter>
				) : (
					<Filter value={visitFilters} onChange={setVisitFilters}>
						<DataTable
							columns={visitColumns}
							data={visits}
							searchKey="workerName"
							searchPlaceholder="Search by name, ID, company…"
							showColumnToggle
							recordLabel="visit"
							pageSize={10}
							getRowId={(row) => row.id}
							bulkActions={[
								{
									label: "Export",
									icon: <Download className="wwc:h-4 wwc:w-4" />,
									variant: "outline",
									onClick: () => {},
								},
							]}
							toolbarExtra={
								<>
									<FilterTrigger />
									<FilterContent>
										<FilterCategory value="outcome" label="Outcome">
											{(Object.keys(FITNESS_LABEL) as FitnessStatus[]).map((status) => (
												<FilterOption key={status} value={status}>
													{FITNESS_LABEL[status]}
												</FilterOption>
											))}
										</FilterCategory>
										<FilterCategory value="reason" label="Reason">
											{VISIT_REASONS.map((reason) => (
												<FilterOption key={reason} value={reason}>
													{reason}
												</FilterOption>
											))}
										</FilterCategory>
										<FilterCategory value="clinic" label="Clinic">
											{VISIT_CLINICS.map((clinic) => (
												<FilterOption key={clinic} value={clinic}>
													{clinic}
												</FilterOption>
											))}
										</FilterCategory>
									</FilterContent>
									<IconAction label="Bulk Upload" icon={<Upload className="wwc:h-4 wwc:w-4" />} />
									<IconAction label="Export (.xlsx)" icon={<Download className="wwc:h-4 wwc:w-4" />} />
									<NewVisitDialog />
								</>
							}
						/>
					</Filter>
				)}
			</div>
		</div>
	);
}

// ─── Overview (tab data) ─────────────────────────────────────────────────────

type OverviewKpi = {
	title: string;
	value: string;
	icon: React.ElementType;
	status?: "success" | "warning" | "danger";
	trend?: "up" | "down";
	trendLabel?: string;
};

const PEOPLE_KPIS: OverviewKpi[] = [
	{title: "Active Workers", value: "973", icon: Users},
	{title: "Currently Unfit", value: "0", icon: CircleX, status: "warning"},
	{title: "Pending Workers", value: "18", icon: Clock, status: "warning"},
	{
		title: "Overdue Workers",
		value: "567",
		icon: TriangleAlert,
		status: "danger",
		trend: "up",
		trendLabel: "+10 vs last week",
	},
];

const ACTIVITY_KPIS: OverviewKpi[] = [
	{title: "Visits Today", value: "0", icon: CalendarPlus, trend: "down", trendLabel: "-14 vs yesterday"},
	{title: "Visits This Month", value: "96", icon: Stethoscope, trend: "down", trendLabel: "-85 vs last month"},
	{title: "Fit Today", value: "0", icon: CircleCheck, status: "success", trend: "down", trendLabel: "-14 vs yesterday"},
];

// ─── Site Health Score ───────────────────────────────────────────────────────

type HealthMetric = {
	label: string;
	percent: number;
	caption: string;
	/** Drives the dot, the figure, and the bar — one tone per metric. */
	tone: "success" | "danger";
};

const HEALTH_SCORE = 79;

const HEALTH_METRICS: HealthMetric[] = [
	{label: "Up to date", percent: 42, caption: "567 overdue", tone: "danger"},
	{label: "Due soon (30d)", percent: 96, caption: "36 due in 30d", tone: "success"},
	{label: "Fit for work", percent: 98, caption: "18 unfit/pending", tone: "success"},
	{label: "Screening coverage", percent: 100, caption: "all screened", tone: "success"},
];

function SiteHealthScore() {
	return (
		<Card className="wwc:p-6">
			<div className="wwc:flex wwc:flex-wrap wwc:items-start wwc:gap-5">
				<ScoreGauge value={HEALTH_SCORE} tone="warning" size={120} />

				<div className="wwc:min-w-0 wwc:flex-1">
					<SectionHeader
						size="sm"
						className="wwc:mb-0"
						title={
							<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
								Site Health Score
								<Badge variant="warningSoft">
									<TriangleAlert className="wwc:h-3 wwc:w-3" />
									At risk
								</Badge>
							</span>
						}
						description="Weighted medical readiness across 973 active workers."
					/>
					<p className="wwc:mt-2 wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-sm wwc:text-amber-600">
						<TriangleAlert className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
						<span>
							<span className="wwc:font-medium">Biggest gap:</span> Up to date — 567 overdue
						</span>
					</p>
				</div>
			</div>

			<div className="wwc:mt-5 wwc:grid wwc:grid-cols-2 wwc:gap-4 wwc:lg:grid-cols-4">
				{HEALTH_METRICS.map((metric) => (
					<ProgressStat
						key={metric.label}
						title={metric.label}
						value={metric.percent}
						unit="%"
						caption={metric.caption}
						percent={metric.percent}
						tone={metric.tone}
					/>
				))}
			</div>
		</Card>
	);
}

// ─── Visit Analytics ─────────────────────────────────────────────────────────

const VISIT_VOLUME_DATES = [
	"06-23",
	"06-24",
	"06-25",
	"06-26",
	"06-27",
	"06-28",
	"06-29",
	"06-30",
	"07-01",
	"07-02",
	"07-03",
	"07-04",
	"07-05",
	"07-06",
	"07-07",
	"07-08",
	"07-09",
	"07-10",
	"07-11",
	"07-12",
	"07-13",
	"07-14",
	"07-15",
	"07-16",
	"07-17",
	"07-18",
	"07-19",
	"07-20",
	"07-21",
];
const VISIT_VOLUME = [15, 8, 19, 0, 33, 10, 15, 6, 1, 0, 0, 0, 3, 0, 0, 2, 0, 0, 2, 8, 12, 19, 6, 10, 15, 0, 16, 9, 14];

const OVERDUE_TREND = [
	540, 542, 543, 545, 546, 547, 549, 550, 551, 553, 554, 555, 556, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567,
	568, 569, 570, 571, 572, 573,
];
const COMPLIANCE_TREND = [
	45, 45, 45, 45, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 43, 43, 43, 43, 43, 43, 42, 42, 42, 42, 42, 42, 42, 42,
];

const areaChartOption = (dates: string[], values: number[], color: string, area: string): EChartsOption => ({
	grid: {left: 44, right: 12, top: 16, bottom: 28},
	tooltip: {trigger: "axis"},
	xAxis: {type: "category", data: dates, boundaryGap: false, axisTick: {show: false}},
	yAxis: {type: "value", splitLine: {lineStyle: {type: "dashed"}}},
	series: [
		{
			type: "line",
			data: values,
			smooth: true,
			showSymbol: false,
			lineStyle: {color, width: 2},
			areaStyle: {color: area},
		},
	],
});

const visitVolumeOption = areaChartOption(VISIT_VOLUME_DATES, VISIT_VOLUME, "#3b82f6", "rgba(59,130,246,0.25)");

const fitnessDistributionOption: EChartsOption = {
	tooltip: {trigger: "item"},
	legend: {bottom: 0, icon: "circle"},
	series: [
		{
			type: "pie",
			radius: ["55%", "78%"],
			center: ["50%", "45%"],
			label: {show: false},
			labelLine: {show: false},
			data: [
				{name: "Fit", value: 955, itemStyle: {color: "#16a34a"}},
				{name: "Pending", value: 18, itemStyle: {color: "#f59e0b"}},
				{name: "Unfit", value: 0, itemStyle: {color: "#dc2626"}},
			],
		},
	],
};

const overdueTrendOption: EChartsOption = {
	grid: {left: 44, right: 12, top: 16, bottom: 28},
	tooltip: {trigger: "axis"},
	xAxis: {type: "category", data: VISIT_VOLUME_DATES, axisTick: {show: false}},
	yAxis: {type: "value", min: 0, max: 600, splitLine: {lineStyle: {type: "dashed"}}},
	series: [
		{type: "line", data: OVERDUE_TREND, symbolSize: 6, lineStyle: {color: "#dc2626"}, itemStyle: {color: "#dc2626"}},
	],
};

const complianceRateOption: EChartsOption = {
	grid: {left: 48, right: 12, top: 16, bottom: 28},
	tooltip: {trigger: "axis", valueFormatter: (value) => `${value as number}%`},
	xAxis: {type: "category", data: VISIT_VOLUME_DATES, boundaryGap: false, axisTick: {show: false}},
	yAxis: {
		type: "value",
		min: 0,
		max: 100,
		axisLabel: {formatter: "{value}%"},
		splitLine: {lineStyle: {type: "dashed"}},
	},
	series: [
		{
			type: "line",
			data: COMPLIANCE_TREND,
			showSymbol: false,
			lineStyle: {color: "#16a34a", width: 2},
			areaStyle: {color: "rgba(22,163,74,0.12)"},
		},
	],
};

const visitsByClinicOption: EChartsOption = {
	grid: {left: 120, right: 24, top: 16, bottom: 28},
	tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
	xAxis: {type: "value", splitLine: {lineStyle: {type: "dashed"}}},
	yAxis: {
		type: "category",
		data: ["NGMSA-TCF CLINIC", "Default Clinic", "ZOMCO-SAPMT Camp Clinic", "SH-TCF Clinic", "TR-TCF CLINIC"],
		axisTick: {show: false},
	},
	series: [{type: "bar", data: [1, 2, 3, 9, 198], barWidth: 12, itemStyle: {color: "#3b82f6", borderRadius: 3}}],
};

const peakVisitHoursOption: EChartsOption = {
	grid: {left: 40, right: 12, top: 16, bottom: 28},
	tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
	xAxis: {
		type: "category",
		data: [
			"00:00",
			"01:00",
			"02:00",
			"03:00",
			"04:00",
			"05:00",
			"06:00",
			"07:00",
			"08:00",
			"09:00",
			"10:00",
			"11:00",
			"12:00",
			"13:00",
			"14:00",
			"15:00",
			"16:00",
			"17:00",
			"18:00",
			"19:00",
			"20:00",
		],
		axisTick: {show: false},
	},
	yAxis: {type: "value", splitLine: {lineStyle: {type: "dashed"}}},
	series: [
		{
			type: "bar",
			data: [1, 4, 12, 18, 19, 19, 24, 17, 14, 14, 7, 13, 20, 12, 10, 7, 2, 1, 3, 0, 0],
			barWidth: "60%",
			itemStyle: {color: "#8b5cf6", borderRadius: [3, 3, 0, 0]},
		},
	],
};

const visitReasonsOption: EChartsOption = {
	grid: {left: 110, right: 24, top: 16, bottom: 28},
	tooltip: {trigger: "axis", axisPointer: {type: "shadow"}, valueFormatter: (value) => `${value as number}%`},
	xAxis: {type: "value", max: 100, splitLine: {lineStyle: {type: "dashed"}}},
	yAxis: {type: "category", data: ["Other", "FollowUp", "Routine", "IllnessSymptoms"], axisTick: {show: false}},
	series: [{type: "bar", data: [2, 4, 10, 84], barWidth: 12, itemStyle: {color: "#0e7490", borderRadius: 3}}],
};

// ─── Needs attention today ───────────────────────────────────────────────────

type OverdueWorker = {id: string; name: string; code: string; company: string; daysOverdue: number; due: string};

const NEEDS_ATTENTION: OverdueWorker[] = [
	{
		id: "n-1",
		name: "NURUZZAMAN LATE TAMIZUDDIN",
		code: "2243476054",
		company: "TR-SFEC",
		daysOverdue: 548,
		due: "19 Jan 2025",
	},
	{
		id: "n-2",
		name: "SHAHZAD AHMED MUHAMMAD ISHAQ",
		code: "2464460803",
		company: "TR-SFEC",
		daysOverdue: 533,
		due: "03 Feb 2025",
	},
	{
		id: "n-3",
		name: "NAVEED AHMAD MUHAMMAD BASHIR",
		code: "2205134980",
		company: "TR",
		daysOverdue: 508,
		due: "28 Feb 2025",
	},
	{id: "n-4", name: "SUJON MIA", code: "2545882736", company: "TR-ELECO", daysOverdue: 496, due: "12 Mar 2025"},
	{
		id: "n-5",
		name: "MARK FERNANDO AROMIN BAUTISTA",
		code: "2472673504",
		company: "TR",
		daysOverdue: 493,
		due: "15 Mar 2025",
	},
];

function NeedsAttention() {
	return (
		<Card className="wwc:p-6">
			<SectionHeader
				title="Needs attention today"
				description="567 overdue · sorted by urgency"
				size="sm"
				actions={
					<Button variant="link">
						View all
						<ArrowRight className="wwc:h-4 wwc:w-4" />
					</Button>
				}
			/>

			<AttentionList>
				{NEEDS_ATTENTION.map((worker) => (
					<AttentionListItem
						key={worker.id}
						icon={<TriangleAlert className="wwc:h-4 wwc:w-4" />}
						title={worker.name}
						subtitle={`${worker.code} · ${worker.company}`}
						value={`${worker.daysOverdue} days overdue`}
						valueCaption={`Due: ${worker.due}`}
						action={<Button variant="link">History</Button>}
					/>
				))}
			</AttentionList>
		</Card>
	);
}

/** Section heading above a band of tiles. */
function OverviewSection({title, children}: {title: string; children: React.ReactNode}) {
	return (
		<section>
			<SectionHeader title={title} size="sm" className="wwc:mb-3" />
			{children}
		</section>
	);
}

/** Overview — KPI bands, the site health score, visit analytics, and the overdue worklist. */
function ClinicOverview() {
	return (
		<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
			<div className="wwc:flex wwc:w-full wwc:flex-col wwc:gap-6 wwc:p-6">
				<OverviewSection title="People right now">
					<div className="wwc:grid wwc:grid-cols-4 wwc:gap-4">
						{PEOPLE_KPIS.map((kpi) => (
							<MetricCard
								key={kpi.title}
								title={kpi.title}
								value={kpi.value}
								status={kpi.status}
								icon={kpi.icon}
								trend={kpi.trend}
								trendLabel={kpi.trendLabel}
							/>
						))}
					</div>
				</OverviewSection>

				<OverviewSection title="Activity">
					<div className="wwc:grid wwc:grid-cols-3 wwc:gap-4">
						{ACTIVITY_KPIS.map((kpi) => (
							<MetricCard
								key={kpi.title}
								title={kpi.title}
								value={kpi.value}
								status={kpi.status}
								icon={kpi.icon}
								trend={kpi.trend}
								trendLabel={kpi.trendLabel}
							/>
						))}
					</div>
				</OverviewSection>

				<SiteHealthScore />

				<OverviewSection title="Visit Analytics">
					<div className="wwc:flex wwc:flex-col wwc:gap-4">
						<div className="wwc:grid wwc:grid-cols-1 wwc:gap-4 wwc:lg:grid-cols-3">
							<TrendChart
								className="wwc:lg:col-span-2"
								title="Visit Volume"
								header={<p className="wwc:text-xs wwc:text-muted-foreground">Last 30 days</p>}
								option={visitVolumeOption}
								height={260}
							/>
							<TrendChart
								title="Fitness Distribution"
								header={<p className="wwc:text-xs wwc:text-muted-foreground">Active workers by current status</p>}
								option={fitnessDistributionOption}
								height={260}
							/>
						</div>

						<div className="wwc:grid wwc:grid-cols-1 wwc:gap-4 wwc:lg:grid-cols-3">
							<TrendChart
								title="Overdue Workers"
								header={<p className="wwc:text-xs wwc:text-muted-foreground">30-day trend</p>}
								option={overdueTrendOption}
							/>
							<TrendChart
								title="Compliance Rate"
								header={<p className="wwc:text-xs wwc:text-muted-foreground">30-day trend</p>}
								option={complianceRateOption}
							/>
							<TrendChart
								title="Visits by Clinic"
								header={<p className="wwc:text-xs wwc:text-muted-foreground">Active clinics</p>}
								option={visitsByClinicOption}
							/>
						</div>

						<div className="wwc:grid wwc:grid-cols-1 wwc:gap-4 wwc:lg:grid-cols-2">
							<TrendChart
								title="Peak Visit Hours"
								header={<p className="wwc:text-xs wwc:text-muted-foreground">Distribution across working hours</p>}
								option={peakVisitHoursOption}
							/>
							<TrendChart
								title="Visit Reasons"
								header={<p className="wwc:text-xs wwc:text-muted-foreground">Share of visits (%)</p>}
								option={visitReasonsOption}
							/>
						</div>
					</div>
				</OverviewSection>

				<NeedsAttention />
			</div>
		</div>
	);
}

// ─── Settings shared chrome ──────────────────────────────────────────────────

/**
 * The shared save/discard footer, shown only while a pane is dirty. Rendered as a sibling of the
 * padded content container — FormActionBar owns its own full-bleed background, so it must not sit
 * inside the padded div.
 */
function SettingsActionBar({
	changeCount,
	onDiscard,
	onSave,
}: {
	changeCount: number;
	onDiscard: () => void;
	onSave: () => void;
}) {
	if (changeCount === 0) return null;
	return (
		<FormActionBar
			maxWidth="1000px"
			// mt-auto pins the bar to the bottom of the pane; these panes are short enough not to
			// overflow, so sticky alone would leave it floating under the last row.
			className="wwc:mt-auto"
			status={
				<>
					<span className="wwc:font-medium wwc:text-foreground">{changeCount}</span> unsaved change
					{changeCount === 1 ? "" : "s"}
				</>
			}
		>
			<Button variant="ghost" size="sm" onClick={onDiscard}>
				Discard
			</Button>
			<Button size="sm" onClick={onSave}>
				<Save className="wwc:h-4 wwc:w-4" />
				Save changes
			</Button>
		</FormActionBar>
	);
}

// ─── Settings › Visit Frequency ──────────────────────────────────────────────

const INTERVAL_OPTIONS = [1, 2, 3, 6, 12];

const intervalLabel = (months: number) => (months === 1 ? "Every month" : `Every ${months} months`);

/** Project default routine-check interval. Rules and per-worker overrides take priority over it. */
function VisitFrequencySettings() {
	const [saved, setSaved] = useState(6);
	const [draft, setDraft] = useState(6);

	return (
		<>
			<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1000px] wwc:p-6">
				<SectionHeader
					title="Project Default Frequency"
					description="Workers without a matching rule or manual override follow this schedule. Rules and per-worker overrides take priority."
				/>
				<Card className="wwc:p-6">
					<Field className="wwc:max-w-sm">
						<FieldLabel htmlFor="routine-check-interval">Routine Check Interval</FieldLabel>
						<Select value={String(draft)} onValueChange={(value) => setDraft(Number(value))}>
							<SelectTrigger id="routine-check-interval">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{INTERVAL_OPTIONS.map((months) => (
									<SelectItem key={months} value={String(months)}>
										{intervalLabel(months)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				</Card>
			</div>

			<SettingsActionBar
				changeCount={draft === saved ? 0 : 1}
				onDiscard={() => setDraft(saved)}
				onSave={() => setSaved(draft)}
			/>
		</>
	);
}

// ─── Settings › Age-Based Rules ──────────────────────────────────────────────

type AgeRule = {
	id: string;
	operator: "gte" | "lte";
	age: number;
	months: number;
	/** How many workers currently match this rule — computed server-side in the real app. */
	affected: number;
};

const AGE_OPERATORS: {value: AgeRule["operator"]; label: string}[] = [
	{value: "gte", label: "Age ≥"},
	{value: "lte", label: "Age ≤"},
];

const INITIAL_AGE_RULES: AgeRule[] = [{id: "rule-1", operator: "gte", age: 40, months: 3, affected: 0}];

const ruleKey = (rule: AgeRule) => `${rule.operator}:${rule.age}:${rule.months}`;

/** Ordered age rules — priority is row order, so the first match wins. Manual overrides beat all. */
function AgeRulesSettings() {
	const [saved, setSaved] = useState<AgeRule[]>(INITIAL_AGE_RULES);
	const [draft, setDraft] = useState<AgeRule[]>(INITIAL_AGE_RULES);
	// Suffix for generated ids; Date.now()/random would break screenshot determinism.
	const [nextId, setNextId] = useState(INITIAL_AGE_RULES.length + 1);

	// A dirty row, an added row, or a removed row each count as one change.
	const changeCount = useMemo(() => {
		const savedKeys = saved.map(ruleKey);
		const draftKeys = draft.map(ruleKey);
		const changed = draftKeys.filter((key, index) => savedKeys[index] !== key).length;
		return changed + Math.abs(savedKeys.length - draftKeys.length) - Math.max(0, draftKeys.length - savedKeys.length);
	}, [saved, draft]);

	const update = (id: string, patch: Partial<AgeRule>) =>
		setDraft((prev) => prev.map((rule) => (rule.id === id ? {...rule, ...patch} : rule)));

	const move = (index: number, direction: -1 | 1) =>
		setDraft((prev) => {
			const next = [...prev];
			const target = index + direction;
			if (target < 0 || target >= next.length) return prev;
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});

	const addRule = () => {
		setDraft((prev) => [...prev, {id: `rule-${nextId}`, operator: "gte", age: 50, months: 6, affected: 0}]);
		setNextId((n) => n + 1);
	};

	return (
		<>
			<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1000px] wwc:p-6">
				<SectionHeader
					title="Age-Based Rules"
					description="Rule priority determines which rule wins when a worker matches multiple. Manual overrides always win."
				/>
				<Card className="wwc:p-6">
					<RuleList onAdd={addRule} addLabel="Add Rule">
						{draft.map((rule, index) => (
							<RuleRow
								key={rule.id}
								meta={<Badge variant="infoSoft">{rule.affected} affected</Badge>}
								disableMoveUp={index === 0}
								disableMoveDown={index === draft.length - 1}
								onMoveUp={() => move(index, -1)}
								onMoveDown={() => move(index, 1)}
								onDelete={() => setDraft((prev) => prev.filter((r) => r.id !== rule.id))}
							>
								<Select
									value={rule.operator}
									onValueChange={(value) => update(rule.id, {operator: value as AgeRule["operator"]})}
								>
									<SelectTrigger className="wwc:w-32" aria-label="Age comparison">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{AGE_OPERATORS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Input
									type="number"
									aria-label="Age threshold"
									value={rule.age}
									onChange={(e) => update(rule.id, {age: Number(e.target.value)})}
									className="wwc:w-24"
								/>

								<span className="wwc:shrink-0 wwc:text-sm wwc:text-muted-foreground">→ every</span>

								<Select value={String(rule.months)} onValueChange={(value) => update(rule.id, {months: Number(value)})}>
									<SelectTrigger className="wwc:w-24" aria-label="Interval in months">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{INTERVAL_OPTIONS.map((months) => (
											<SelectItem key={months} value={String(months)}>
												{months}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<span className="wwc:shrink-0 wwc:text-sm">months</span>
							</RuleRow>
						))}
					</RuleList>
				</Card>
			</div>

			<SettingsActionBar changeCount={changeCount} onDiscard={() => setDraft(saved)} onSave={() => setSaved(draft)} />
		</>
	);
}

// ─── Settings › Clinics ──────────────────────────────────────────────────────

type SiteClinic = {id: string; name: string; isDefault?: boolean; status: "active" | "archived"};

const SITE_CLINICS: SiteClinic[] = [
	{id: "c-1", name: "Default Clinic", isDefault: true, status: "active"},
	{id: "c-2", name: "DSCO-TCF CLINIC", status: "active"},
	{id: "c-3", name: "MAH-Pioneer Camp", status: "active"},
	{id: "c-4", name: "MAH-SP Clinic", status: "active"},
	{id: "c-5", name: "NGMSA-TCF CLINIC", status: "active"},
	{id: "c-6", name: "SH-TCF Clinic", status: "active"},
	{id: "c-7", name: "TR-TCF CLINIC", status: "active"},
	{id: "c-8", name: "ZOMCO-SAPMT Camp Clinic", status: "active"},
];

const CLINIC_COLUMNS: ColumnDef<SiteClinic>[] = [
	{
		accessorKey: "name",
		header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
		cell: ({row}) => (
			<span className="wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:font-medium">{row.original.name}</span>
				{row.original.isDefault && (
					<Badge variant="outline" className="wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
						Default
					</Badge>
				)}
			</span>
		),
	},
	{
		accessorKey: "status",
		header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
		cell: ({row}) => (
			<Badge variant={row.original.status === "active" ? "successSoft" : "neutralSoft"}>
				{row.original.status === "active" ? "Active" : "Archived"}
			</Badge>
		),
	},
	{
		id: "actions",
		enableSorting: false,
		enableHiding: false,
		meta: {cellClassName: "wwc:w-px wwc:whitespace-nowrap wwc:text-right"},
		cell: () => (
			<DataTableRowActions
				actions={[
					{label: "Edit clinic", icon: <Pencil className="wwc:h-4 wwc:w-4" />},
					{label: "Archive clinic", icon: <Archive className="wwc:h-4 wwc:w-4" />},
				]}
			/>
		),
	},
];

/** Site clinic list. Rows act immediately — there is no draft state, so no save bar. */
function ClinicsSettings() {
	return (
		<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1200px] wwc:p-6">
			<SectionHeader title="Site Clinics" description="Manage clinic locations available for this site." />
			<DataTable
				columns={CLINIC_COLUMNS}
				data={SITE_CLINICS}
				searchKey="name"
				searchPlaceholder="Search clinics…"
				recordLabel="clinic"
				pageSize={10}
				toolbarExtra={
					<AddClinicLocationDialog
						trigger={
							<Button>
								<Plus className="wwc:h-4 wwc:w-4" />
								Add Clinic
							</Button>
						}
					/>
				}
			/>
		</div>
	);
}

// ─── Settings › Doctors ──────────────────────────────────────────────────────

type DoctorPermission = {
	id: string;
	name: string;
	email: string;
	/** Companies whose workers this doctor can see; the list is truncated in the cell. */
	companies: string[];
	clinics: string[];
	updated: string;
};

const DOCTOR_PERMISSIONS: DoctorPermission[] = [
	{
		id: "d-1",
		name: "MALATESHA HARIJANA",
		email: "Malatesha.Hari@sinohydro.sa",
		companies: ["SH-FAC", "Sinohydr-Al Quadri", "Sinohydro"],
		clinics: ["SH-TCF Clinic"],
		updated: "12 Jul 2026",
	},
	{
		id: "d-2",
		name: "NGMSA CLINIC",
		email: "Clinic.RNGL@ngmsa.com",
		companies: ["NGMSA"],
		clinics: ["NGMSA-TCF CLINIC"],
		updated: "13 Jul 2026",
	},
	{
		id: "d-3",
		name: "RIYASCLINIC",
		email: "riyasclinic@tecnicasreunidas.es",
		companies: ["TR", "TR- IIT SAUDI", "TR-ACTAVO", ...Array.from({length: 37}, (_, i) => `TR-EXTRA-${i + 1}`)],
		clinics: ["TR-TCF CLINIC"],
		updated: "12 Jul 2026",
	},
	{
		id: "d-4",
		name: "Yves Uy",
		email: "zriyas@twareat.com",
		companies: [
			"Aramco PMT PKG5",
			"BQ",
			"Moffareh Al Harbi and",
			...Array.from({length: 7}, (_, i) => `PKG5-${i + 1}`),
		],
		clinics: ["ZOMCO-SAPMT Camp"],
		updated: "12 Jul 2026",
	},
];

/** Chip list that shows the first `visible` entries and rolls the rest into a "+N" chip. */
function ChipList({items, visible = 3}: {items: string[]; visible?: number}) {
	const overflow = items.length - visible;
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
			{items.slice(0, visible).map((item) => (
				<Badge key={item} variant="outline" className="wwc:h-6 wwc:font-normal">
					{item}
				</Badge>
			))}
			{overflow > 0 && <Badge variant="neutralSoft" className="wwc:h-6 wwc:font-normal">{`+${overflow}`}</Badge>}
		</div>
	);
}

const DOCTOR_OPTIONS: AssignDoctorOption[] = DOCTOR_PERMISSIONS.map((doctor) => ({
	value: doctor.id,
	label: `${doctor.name} — ${doctor.email}`,
}));

const CLINIC_OPTIONS: AssignDoctorOption[] = SITE_CLINICS.map((clinic) => ({value: clinic.id, label: clinic.name}));

// Every company any doctor is already scoped to, deduped — stands in for the org's company list.
const DOCTOR_COMPANY_OPTIONS: AssignDoctorOption[] = Array.from(
	new Set(DOCTOR_PERMISSIONS.flatMap((doctor) => doctor.companies)),
)
	.sort((a, b) => a.localeCompare(b))
	.map((company) => ({value: company, label: company}));

const DOCTOR_COLUMNS: ColumnDef<DoctorPermission>[] = [
	{
		accessorKey: "name",
		header: ({column}) => <DataTableColumnHeader column={column} title="Doctor" />,
		cell: ({row}) => (
			<div className="wwc:flex wwc:items-center wwc:gap-3">
				<Avatar className="wwc:h-7 wwc:w-7">
					<AvatarFallback className="wwc:text-[10px]">{initials(row.original.name)}</AvatarFallback>
				</Avatar>
				<div className="wwc:min-w-0">
					<span className="wwc:block wwc:font-medium">{row.original.name}</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">{row.original.email}</span>
				</div>
			</div>
		),
	},
	{
		id: "companies",
		header: () => <span className="wwc:text-xs wwc:font-medium">Companies</span>,
		cell: ({row}) => <ChipList items={row.original.companies} />,
	},
	{
		id: "clinics",
		header: () => <span className="wwc:text-xs wwc:font-medium">Clinics</span>,
		cell: ({row}) => <ChipList items={row.original.clinics} visible={2} />,
	},
	{
		accessorKey: "updated",
		header: ({column}) => <DataTableColumnHeader column={column} title="Updated" />,
	},
	{
		id: "actions",
		enableSorting: false,
		enableHiding: false,
		meta: {cellClassName: "wwc:w-px wwc:whitespace-nowrap wwc:text-right"},
		cell: () => (
			<DataTableRowActions
				actions={[
					{label: "Edit permissions", icon: <Pencil className="wwc:h-4 wwc:w-4" />},
					{label: "Remove doctor", icon: <Trash2 className="wwc:h-4 wwc:w-4" />, destructive: true},
				]}
			/>
		),
	},
];

/** Doctor permission list. Rows act immediately — there is no draft state, so no save bar. */
function DoctorsSettings() {
	return (
		<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1200px] wwc:p-6">
			<SectionHeader
				title="Doctor Permissions"
				description="Control which companies' workers and which clinics' visitor-visits each doctor can see."
			/>
			<DataTable
				columns={DOCTOR_COLUMNS}
				data={DOCTOR_PERMISSIONS}
				searchKey="name"
				searchPlaceholder="Search doctors, companies, clinics…"
				recordLabel="doctor"
				pageSize={10}
				toolbarExtra={
					<AssignDoctorDialog
						doctors={DOCTOR_OPTIONS}
						companies={DOCTOR_COMPANY_OPTIONS}
						clinics={CLINIC_OPTIONS}
						trigger={
							<Button>
								<Plus className="wwc:h-4 wwc:w-4" />
								Assign Doctor
							</Button>
						}
					/>
				}
			/>
		</div>
	);
}

/**
 * Clinic occupational-health template. Renders its own app shell and a content area that toggles
 * between the route header (Overview / Worker Fitness tabs + a Settings action) and a Settings
 * sub-surface (SideMenu + content).
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the CoreClinic template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function Clinic() {
	const [mode, setMode] = useState<"default" | "settings">("default");
	const [activeTab, setActiveTab] = useState<ClinicTabId>("overview");
	const [activeSetting, setActiveSetting] = useState<SettingId>("visit-frequency");

	const [detailLabel, setDetailLabel] = useState<string | null>(null);
	const activeSettingLabel = settingLabel(activeSetting);

	// Ontology settings render the shared admin views; every other setting keeps its own body.
	const ontologyViewId = ONTOLOGY_SETTING_VIEW_IDS[activeSetting];
	const OntologyView = ontologyViewId ? ONTOLOGY_VIEWS[ontologyViewId] : undefined;

	const breadcrumb =
		mode === "settings"
			? `Clinic / Settings / ${activeSettingLabel}${detailLabel ? ` / ${detailLabel}` : ""}`
			: `Clinic / ${tabLabel(activeTab)}`;

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:bg-background wwc:text-foreground">
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={CLINIC_GROUPS}
				activeItemId="clinic"
				showSearch={false}
				showNotifications={false}
			/>

			<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
				<CoreAppTopBar activeLabel={breadcrumb} showProjectSwitcher={false} showNotifications notificationCount={2} />

				<main className="wwc:relative wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-hidden">
					{mode === "default" ? (
						<>
							<PageContentHeader
								variant="navigation"
								title="Clinic"
								tabs={TABS}
								activeTab={activeTab}
								onTabChange={(tab) => setActiveTab(tab as ClinicTabId)}
								actions={[
									{
										id: "settings",
										label: "Settings",
										icon: <Settings className="wwc:h-4 wwc:w-4" />,
										presentation: "icon",
										onSelect: () => setMode("settings"),
									},
								]}
							/>

							{activeTab === "worker-fitness" ? <WorkerFitnessView /> : <ClinicOverview />}
						</>
					) : (
						<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:md:flex-row">
							<SideMenu
								title="Settings"
								onBack={() => setMode("default")}
								backLabel="Back to Clinic"
								showSearch={false}
								groups={SETTINGS_GROUPS}
								activeItemId={activeSetting}
								onItemSelect={(id) => setActiveSetting(id as SettingId)}
							/>

							{/* Ontology views own their scrolling (the table body scrolls, the header band does not), so
							    this column must not scroll as a whole — hence overflow-hidden on that branch only. */}
							<div
								className={cn(
									"wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col",
									OntologyView ? "wwc:overflow-hidden" : "wwc:overflow-auto",
								)}
							>
								{OntologyView ? (
									<>
										<PageContentHeader
											variant="title-actions"
											density="compact"
											title={activeSettingLabel}
											description={ONTOLOGY_DESCRIPTION[activeSetting]}
										/>
										<OntologyView scope={CLINIC_ONTOLOGY_SCOPE} onDetailChange={setDetailLabel} />
										{/* SharedPropertiesView fires undoable toasts and needs a host for them. */}
										<Toaster position="top-right" />
									</>
								) : activeSetting === "visit-frequency" ? (
									<VisitFrequencySettings />
								) : activeSetting === "age-rules" ? (
									<AgeRulesSettings />
								) : activeSetting === "clinics" ? (
									<ClinicsSettings />
								) : (
									<DoctorsSettings />
								)}
							</div>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
