import type {ColumnDef} from "@tanstack/react-table";

import {
	BarChart3,
	Box,
	ClipboardCheck,
	CreditCard,
	Dna,
	Download,
	Eye,
	FileText,
	Folder,
	ImageUp,
	Link2,
	Map,
	MoreHorizontal,
	Network,
	Plus,
	Puzzle,
	Settings,
	ShieldCheck,
	SlidersHorizontal,
	UserCheck,
	UserMinus,
	Users,
	UsersRound,
	X,
	Zap,
} from "lucide-react";
import {useMemo, useState} from "react";

import {Avatar, AvatarFallback} from "../avatar";
import {Badge} from "../badge";
import {Button} from "../button";
import {Checkbox} from "../checkbox";
import {ConfirmDialog} from "../confirm-dialog";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {Empty} from "../empty";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {MetricCard} from "../metric-card";
import {CoreAppSidebar, type SidebarNavGroup} from "../navigation/core-app-sidebar";
import {CoreAppTopBar} from "../navigation/core-app-top-bar";
import {PageContentHeader} from "../page-content-header";
import {Progress} from "../progress";
import {
	PushPanel,
	PushPanelClose,
	PushPanelContainer,
	PushPanelHeader,
	PushPanelHeaderActions,
	PushPanelHeaderTitle,
	PushPanelMain,
	PushPanelProvider,
	PushPanelTitle,
} from "../push-panel";
import {SideMenu, type SideMenuGroup} from "../side-menu";
import {Toaster} from "../sonner";
import {Tabs, TabsList, TabsTrigger} from "../tabs";
import {HoverTooltip} from "../tooltip";
import {usePersistentState} from "../use-persistent-state";
import type {ViewTabItem} from "../view-tab-bar";
import {
	WorkerProfile,
	type WorkerProfileCompliance,
	type WorkerProfileField,
	type WorkerProfileFieldGroup,
} from "../worker-profile";
import {ontologyScopeCounts, type OntologyScope} from "./wc3-ontology-scope";
import {ONTOLOGY_VIEWS} from "./wc3-ontology-views";
import {AnalyticsView} from "./workforce-analytics";
import {ComplianceView, type ComplianceRule, DEFAULT_COMPLIANCE_RULES} from "./workforce-compliance";
import {ComplianceSettings} from "./workforce-compliance-settings";
import {CrewsView} from "./workforce-crews";
import {WorkforceMapView} from "./workforce-map-view";
import {ObsView} from "./workforce-obs";

// Workforce — the workforce-management template scaffold. Same shell as Safety Manager
// (CoreAppSidebar + CoreAppTopBar + PageContentHeader) with a single "Workforce" sidebar
// entry. The content area toggles between the route header (Analytics / Workers List / Crews / OBS /
// Map View / Submissions / Compliance tabs + a Settings action) and a Settings sub-surface (SideMenu +
// content). Settings carries the workforce config (Trade, Workshifts, …) plus an Ontology section that
// mounts the SHARED WC3 ontology views (ONTOLOGY_VIEWS, the same registry core-wc3-workspace.tsx
// renders) narrowed by WORKFORCE_ONTOLOGY_SCOPE — same tables, columns, filters and in-place detail
// pages as the administrator workspace, with scope the only difference. The remaining tab and setting
// bodies are placeholders until the real workforce surfaces land. The top bar breadcrumb tracks the
// active content, down to the ontology record a row drills into.

type SidebarNavItemLite = {id: string; label: string; icon: React.ComponentType<{className?: string}>};

const NAV_ITEMS: SidebarNavItemLite[] = [{id: "workforce", label: "Workforce", icon: Users}];

const WORKFORCE_GROUPS: SidebarNavGroup[] = [{items: NAV_ITEMS}];

// Projects for the top-bar switcher (sample fixtures). The selection persists across reloads.
const PROJECTS = ["Uptown Tower", "Marina Heights", "Riyadh Metro — Line 3", "NEOM Site 4", "Jeddah Waterfront"];

type WorkforceTabId = "analytics" | "workers-list" | "crews" | "obs" | "map-view" | "submissions" | "compliance";

const TABS: ViewTabItem<WorkforceTabId>[] = [
	{id: "analytics", label: "Analytics", icon: BarChart3},
	{id: "workers-list", label: "Workers List", icon: Users},
	{id: "crews", label: "Crews", icon: UsersRound},
	{id: "obs", label: "OBS", icon: Network},
	{id: "map-view", label: "Map View", icon: Map},
	{id: "submissions", label: "Submissions", icon: FileText},
	{id: "compliance", label: "Compliance", icon: ClipboardCheck},
];

const TAB_PLACEHOLDER: Record<
	Exclude<WorkforceTabId, "workers-list">,
	{title: string; description: string; icon: React.ReactNode}
> = {
	analytics: {
		title: "Analytics",
		description: "Workforce analytics and trends will appear here.",
		icon: <BarChart3 className="wwc:h-6 wwc:w-6" />,
	},
	crews: {
		title: "Crews",
		description: "Crew rosters and their assignments will appear here.",
		icon: <UsersRound className="wwc:h-6 wwc:w-6" />,
	},
	obs: {
		title: "OBS",
		description: "The organizational breakdown structure will appear here.",
		icon: <Network className="wwc:h-6 wwc:w-6" />,
	},
	"map-view": {
		title: "Map View",
		description: "Live worker positions on the site map will appear here.",
		icon: <Map className="wwc:h-6 wwc:w-6" />,
	},
	submissions: {
		title: "Submissions",
		description: "Worker submissions and their review state will appear here.",
		icon: <FileText className="wwc:h-6 wwc:w-6" />,
	},
	compliance: {
		title: "Compliance",
		description: "Certifications, inductions, and compliance status will appear here.",
		icon: <ClipboardCheck className="wwc:h-6 wwc:w-6" />,
	},
};

type SettingId =
	| "general"
	| "compliance"
	| "card-generator"
	| "object-types"
	| "link-types"
	| "action-types"
	| "interfaces"
	| "shared-properties"
	| "type-groups"
	| "graph";

// The slice of the WC3 ontology this product owns. Only object types are named — link types, action
// types, interfaces, shared properties and groups are DERIVED from them by wc3-ontology-scope.ts, so
// the scope never has to be maintained per tab. Module-level on purpose: every seed/facet memo inside
// the shared views keys on this object's identity.
const WORKFORCE_ONTOLOGY_SCOPE: OntologyScope = {
	objectTypeIds: [
		"ot_project",
		"ot_site",
		"ot_zone",
		"ot_worker",
		"ot_crew",
		"ot_activity",
		"ot_equipment",
		"ot_observation",
		"ot_access_grant",
		"ot_permit",
		"ot_cert",
	],
};

// Counts come from the same derivation the tables use, so a badge can never drift from its table.
// Derived: 11 object types, 17 link types, 20 action types, 4 interfaces, 5 shared properties, 5 groups.
const ONTOLOGY_COUNTS = ontologyScopeCounts(WORKFORCE_ONTOLOGY_SCOPE);

const SETTINGS_GROUPS: SideMenuGroup[] = [
	{
		label: "System",
		items: [
			{id: "general", label: "General", icon: SlidersHorizontal},
			{id: "compliance", label: "Compliance", icon: ShieldCheck},
			{id: "card-generator", label: "Card Generator", icon: CreditCard},
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

const SETTINGS_ITEMS = SETTINGS_GROUPS.flatMap((group) => group.items);

// Which shared ontology view backs each Settings item. The admin registry calls the groups tab
// "groups"; Settings calls it "type-groups" — indexing ONTOLOGY_VIEWS with the setting id directly
// would silently return undefined for that one item and fall through to the Empty placeholder.
const ONTOLOGY_SETTING_VIEW_IDS: Partial<Record<SettingId, string>> = {
	"object-types": "object-types",
	"link-types": "link-types",
	"action-types": "action-types",
	interfaces: "interfaces",
	"shared-properties": "shared-properties",
	"type-groups": "groups",
	graph: "graph",
};

const SETTING_PLACEHOLDER: Record<SettingId, string> = {
	general: "General workforce settings — trades, workshifts, disciplines, and location groups.",
	compliance: "Configure the conditions that determine worker compliance on this project.",
	"card-generator": "Configure worker ID card templates and issuing rules.",
	"object-types": "Define the object types in the workforce ontology.",
	"link-types": "Define how object types relate to one another.",
	"action-types": "Configure the actions that can be run against objects.",
	interfaces: "Manage shared interfaces object types can implement.",
	"shared-properties": "Manage properties reused across object types.",
	"type-groups": "Group related types for navigation and permissions.",
	graph: "Explore how this product's object types relate to one another.",
};

const settingLabel = (id: string) => SETTINGS_ITEMS.find((item) => item.id === id)?.label ?? "Settings";
const tabLabel = (id: WorkforceTabId) => TABS.find((tab) => tab.id === id)?.label ?? "";

// ─── Workers (Workers List data) ─────────────────────────────────────────────

type Worker = {
	id: string;
	name: string;
	code: string;
	title: string | null;
	trade: string;
	department: string | null;
	company: string;
	package: string;
	deviceId: string | null;
	batteryVoltage: number | null;
	mobilizedDate: string | null;
	nationality: string | null;
	status: "mobilized" | "demobilized";
	/** Compliance checks passed, out of {@link COMPLIANCE_TOTAL}. */
	complianceScore: number;
};

/** How many compliance checks make up a full score (Background Check, SST Card, Apex ID Badge, Core Asset). */
const COMPLIANCE_TOTAL = 4;

const WORKERS: Worker[] = [
	{
		id: "w-1",
		name: "AASHISH CHAUDHARY",
		code: "PA3741326",
		title: null,
		trade: "Direct-Helper",
		department: null,
		company: "TR-SINOPEC5",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: "H9435",
		batteryVoltage: 3.01,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 4,
		status: "mobilized",
	},
	{
		id: "w-2",
		name: "AASHODIN SHESH",
		code: "2587770112",
		title: null,
		trade: "DIRECT-SCAFFOLDER",
		department: null,
		company: "TR-SINOPEC5",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: "H2376",
		batteryVoltage: 2.99,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 3,
		status: "mobilized",
	},
	{
		id: "w-3",
		name: "AAS MOHAMMED",
		code: "2602043396",
		title: null,
		trade: "Indirect-HEAVY TRUCK DRIVER",
		department: null,
		company: "TR-SFEC",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: "H9283",
		batteryVoltage: 2.2,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 4,
		status: "mobilized",
	},
	{
		id: "w-4",
		name: "AAS MUHAMMAD ANSARI",
		code: "2583434150",
		title: null,
		trade: "DIRECT-Welder",
		department: null,
		company: "TR-SINOPEC4",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: "H2568",
		batteryVoltage: 2.06,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 2,
		status: "mobilized",
	},
	{
		id: "w-5",
		name: "AAVESH RAHIM AHMED QURESHI",
		code: "2592258632",
		title: null,
		trade: "Indirect-PROJECT SECRETARY",
		department: null,
		company: "TR-MMC",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: null,
		batteryVoltage: null,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 4,
		status: "mobilized",
	},
	{
		id: "w-6",
		name: "Aayush Rai",
		code: "11032218",
		title: null,
		trade: "DIRECT-SCAFFOLDER",
		department: null,
		company: "TR-SINOPEC5",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: "H11707",
		batteryVoltage: 2.55,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 3,
		status: "mobilized",
	},
	{
		id: "w-7",
		name: "ABADAT ALI IMAM DIN",
		code: "2498562269",
		title: null,
		trade: "Indirect-SCAFFOLDING FOREMAN",
		department: null,
		company: "TR-SINOPEC4",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: "H15904",
		batteryVoltage: 2.26,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 1,
		status: "mobilized",
	},
	{
		id: "w-8",
		name: "ABALLA IBRAHIM",
		code: "2406901534",
		title: null,
		trade: "Direct-MECHANIC",
		department: null,
		company: "TR-AIC",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: null,
		batteryVoltage: null,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 4,
		status: "mobilized",
	},
	{
		id: "w-9",
		name: "ABASAHEB MOHITE",
		code: "2473364855",
		title: null,
		trade: "Direct-CRANE OPERATOR",
		department: null,
		company: "Sinohydro",
		package: "Industrial Support Facilities",
		deviceId: "H3383",
		batteryVoltage: 2.81,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 3,
		status: "mobilized",
	},
	{
		id: "w-10",
		name: "Abas Mohamed",
		code: "2290800511",
		title: null,
		trade: "Indirect-WATER TANK DRIVER",
		department: null,
		company: "Sinohydro",
		package: "Industrial Support Facilities",
		deviceId: "H2576",
		batteryVoltage: 3.0,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 4,
		status: "mobilized",
	},
	{
		id: "w-11",
		name: "ABBAIDULLAH SIDDIQUE",
		code: "2607904279",
		title: null,
		trade: "Indirect-Admin Officer",
		department: null,
		company: "TR-ELECO",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: null,
		batteryVoltage: null,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 2,
		status: "mobilized",
	},
	{
		id: "w-12",
		name: "ABBAS ALI",
		code: "2562618278",
		title: null,
		trade: "Indirect-WPR",
		department: null,
		company: "TR-SINOPEC4",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: "H12923",
		batteryVoltage: 2.64,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 3,
		status: "mobilized",
	},
	{
		id: "w-13",
		name: "Abbas aly",
		code: "10194",
		title: null,
		trade: "Def-trd",
		department: null,
		company: "Moffareh Al Harbi and Partners",
		package: "Facility Site Preparation",
		deviceId: null,
		batteryVoltage: null,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 4,
		status: "mobilized",
	},
	{
		id: "w-14",
		name: "ABBAS ISMAIL",
		code: "2581408438",
		title: null,
		trade: "INDIRECT-PAINTING FOREMAN",
		department: null,
		company: "TR-SINOHYDRO",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: "H14426",
		batteryVoltage: 2.46,
		mobilizedDate: "27 Sep, 2025 03:00 am",
		nationality: null,
		complianceScore: 1,
		status: "mobilized",
	},
	{
		id: "w-15",
		name: "ABBAS JURAN ALI REZIA",
		code: "2469410001",
		title: null,
		trade: "Direct-Carpenter",
		department: null,
		company: "TR-SFEC",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: "H4668",
		batteryVoltage: 2.3,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 4,
		status: "mobilized",
	},
	{
		id: "w-16",
		name: "ABBAS KHALID NIZAM",
		code: "2567341975",
		title: null,
		trade: "Direct-MANLIFT OPERATOR",
		department: null,
		company: "TR-ELECO",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: null,
		batteryVoltage: null,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 3,
		status: "mobilized",
	},
	{
		id: "w-17",
		name: "ABBAS KOLLANCHERY",
		code: "2535445254",
		title: null,
		trade: "DIRECT-RIGGER III",
		department: null,
		company: "TR-SINOPEC5",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: "H4512",
		batteryVoltage: 2.25,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 4,
		status: "demobilized",
	},
	{
		id: "w-18",
		name: "ABBAS NIKTHAS",
		code: "2535131771",
		title: null,
		trade: "Indirect-QC Civil Inspector",
		department: null,
		company: "TR-SINOHYDRO",
		package: "NGL Fractionation Trains & Utilities",
		deviceId: "H6444",
		batteryVoltage: 2.23,
		mobilizedDate: null,
		nationality: null,
		complianceScore: 2,
		status: "demobilized",
	},
];

const WORKER_KPIS: {title: string; value: string; status?: "success" | "warning" | "danger"}[] = [
	{title: "Total Workers", value: "25,841"},
	{title: "Workers with Helmets", value: "16,247"},
	{title: "Offline Workers", value: "11,068"},
	{title: "Online Workers", value: "5,179", status: "success"},
	{title: "Active Workers", value: "4,082", status: "success"},
	{title: "Inactive Workers", value: "1,097", status: "danger"},
];

/** Empty cells render as a muted dash, matching the live workforce table. */
function dash(value: React.ReactNode) {
	if (value === null || value === undefined || value === "")
		return <span className="wwc:text-muted-foreground">-</span>;
	return value;
}

function initials(name: string) {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");
}

function makeWorkerColumns(
	onView: (worker: Worker) => void,
	onToggleStatus: (worker: Worker) => void,
): ColumnDef<Worker>[] {
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
			id: "image",
			enableSorting: false,
			header: () => <span className="wwc:text-xs wwc:font-medium">Worker Image</span>,
			meta: {cellClassName: "wwc:w-px"},
			cell: ({row}) => (
				<Avatar className="wwc:h-7 wwc:w-7">
					<AvatarFallback className="wwc:text-[10px]">{initials(row.original.name)}</AvatarFallback>
				</Avatar>
			),
		},
		{
			accessorKey: "name",
			header: ({column}) => <DataTableColumnHeader column={column} title="Worker" />,
			cell: ({row}) => (
				<button
					type="button"
					onClick={() => onView(row.original)}
					className="wwc:text-left wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
				>
					{row.original.name}
				</button>
			),
		},
		{
			accessorKey: "code",
			header: ({column}) => <DataTableColumnHeader column={column} title="Worker Code" />,
			cell: ({row}) => dash(row.original.code),
		},
		{
			accessorKey: "title",
			header: ({column}) => <DataTableColumnHeader column={column} title="Title" />,
			cell: ({row}) => dash(row.original.title),
		},
		{
			accessorKey: "trade",
			header: ({column}) => <DataTableColumnHeader column={column} title="Trade" />,
			cell: ({row}) => dash(row.original.trade),
		},
		{
			accessorKey: "complianceScore",
			header: ({column}) => <DataTableColumnHeader column={column} title="Compliance Score" />,
			cell: ({row}) => {
				const score = row.original.complianceScore;
				const tone = score >= COMPLIANCE_TOTAL ? "success" : score >= COMPLIANCE_TOTAL / 2 ? "warning" : "danger";
				return (
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Progress value={(score / COMPLIANCE_TOTAL) * 100} tone={tone} className="wwc:h-1.5 wwc:w-16" />
						<span className="wwc:text-xs wwc:tabular-nums wwc:text-muted-foreground">
							{score} / {COMPLIANCE_TOTAL}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "department",
			header: ({column}) => <DataTableColumnHeader column={column} title="Department" />,
			cell: ({row}) => dash(row.original.department),
		},
		{
			accessorKey: "company",
			header: ({column}) => <DataTableColumnHeader column={column} title="Company" />,
			cell: ({row}) => dash(row.original.company),
		},
		{
			accessorKey: "package",
			header: ({column}) => <DataTableColumnHeader column={column} title="Package" />,
			cell: ({row}) => dash(row.original.package),
		},
		{
			accessorKey: "deviceId",
			header: ({column}) => <DataTableColumnHeader column={column} title="Device ID" />,
			cell: ({row}) => dash(row.original.deviceId),
		},
		{
			accessorKey: "batteryVoltage",
			header: ({column}) => <DataTableColumnHeader column={column} title="Battery Voltage" />,
			cell: ({row}) =>
				dash(row.original.batteryVoltage === null ? null : `${row.original.batteryVoltage.toFixed(2)} V`),
		},
		{
			accessorKey: "mobilizedDate",
			header: ({column}) => <DataTableColumnHeader column={column} title="Mobilized Date" />,
			cell: ({row}) => dash(row.original.mobilizedDate),
		},
		{
			accessorKey: "nationality",
			header: ({column}) => <DataTableColumnHeader column={column} title="Nationality" />,
			cell: ({row}) => dash(row.original.nationality),
		},
		{
			id: "actions",
			enableSorting: false,
			enableHiding: false,
			meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:overflow-visible wwc:whitespace-nowrap wwc:text-right"},
			cell: ({row}) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" icon aria-label="Row actions" className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground">
							<MoreHorizontal className="wwc:h-4 wwc:w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="wwc:w-44">
						<DropdownMenuItem onClick={() => onView(row.original)}>
							<Eye className="wwc:h-4 wwc:w-4" />
							View worker
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onToggleStatus(row.original)}>
							{row.original.status === "mobilized" ? (
								<>
									<UserMinus className="wwc:h-4 wwc:w-4" />
									Demobilize worker
								</>
							) : (
								<>
									<UserCheck className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									Mobilize worker
								</>
							)}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}

const uniqueBy = <K extends keyof Worker>(key: K) =>
	Array.from(new Set(WORKERS.map((worker) => String(worker[key])))).sort();

const TRADES = uniqueBy("trade");
const COMPANIES = uniqueBy("company");
const PACKAGES = uniqueBy("package");

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

/** Maps a Worker record onto the WorkerProfile widget's field groups. */
function workerProfileGroups(worker: Worker): WorkerProfileFieldGroup[] {
	return [
		{
			id: "identity",
			fields: [
				{label: "Name", value: worker.name},
				{label: "Code", value: worker.code},
				{label: "Company", value: dash(worker.company)},
				{label: "Trade", value: dash(worker.trade)},
				{
					label: "Mobilization",
					value: (
						<Badge variant={worker.status === "mobilized" ? "default" : "secondary"} className="wwc:h-5 wwc:text-xs">
							{worker.status === "mobilized" ? "Mobilized" : "Demobilized"}
						</Badge>
					),
				},
				{label: "Title", value: dash(worker.title)},
				{label: "Department", value: dash(worker.department)},
			],
		},
		{
			id: "personal",
			fields: [
				{label: "Package", value: dash(worker.package)},
				{label: "Nationality", value: dash(worker.nationality)},
				{label: "Mobilized Date", value: dash(worker.mobilizedDate)},
			],
		},
	];
}

function workerDeviceFields(worker: Worker): WorkerProfileField[] {
	if (worker.deviceId === null) return [];
	return [
		{label: "Device ID", value: worker.deviceId},
		{
			label: "Battery Voltage",
			value: dash(worker.batteryVoltage === null ? null : `${worker.batteryVoltage.toFixed(2)} V`),
		},
	];
}

/** Builds the mock compliance record shown in the worker profile's Compliance tab. */
function workerCompliance(
	worker: Worker,
	verdicts: Record<string, string>,
	onVerdict: (id: string, option: string) => void,
	onUpload: (id: string) => void,
): WorkerProfileCompliance {
	const doc = (suffix: string) => ({name: `pplid-${worker.code}-cert-${suffix}`, attached: false});
	return {
		score: {value: worker.complianceScore, total: COMPLIANCE_TOTAL},
		items: [
			{
				id: "background-check",
				selectedOption: verdicts["background-check"],
				onOptionChange: (option) => onVerdict("background-check", option),
				title: "Background Check",
				status: "Not set",
				options: ["Pass", "Fail", "Pending"],
				document: doc("image.png"),
				uploadable: true,
				onUploadDocument: () => onUpload("background-check"),
			},
			{
				id: "sst-card",
				title: "SST Card",
				status: (
					<Badge variant="successSoft" className="wwc:h-5 wwc:text-xs">
						Valid
					</Badge>
				),
				document: doc("technip-energies.png"),
				fields: [{label: "Expires", value: "21 Oct 26"}],
				uploadable: true,
				onUploadDocument: () => onUpload("sst-card"),
			},
			{
				id: "apex-id-badge",
				selectedOption: verdicts["apex-id-badge"],
				onOptionChange: (option) => onVerdict("apex-id-badge", option),
				title: "Apex ID Badge",
				status: "Not set",
				options: ["Issued", "Denied", "Returned", "Not Required"],
				document: doc("scrnli_1gpyqbbqlorfu7.png"),
				uploadable: true,
				onUploadDocument: () => onUpload("apex-id-badge"),
			},
			{
				id: "core-asset",
				title: "Core Asset",
				auto: true,
				status: (
					<Badge variant="successSoft" className="wwc:h-5 wwc:text-xs">
						Linked
					</Badge>
				),
				fields: [{label: "Assigned", value: "Yes · I5"}],
			},
			{
				id: "active-on-site",
				title: "Active on Site",
				auto: true,
				status: (
					<Badge variant="infoSoft" className="wwc:h-5 wwc:text-xs">
						Not on Site
					</Badge>
				),
				note: "Derived from the worker's on-site activity — not manually editable.",
			},
			{
				id: "release-tracking",
				title: "Release Tracking",
				fields: [{label: "Release Date", value: "—"}],
			},
		],
	};
}

/** Workers List — KPI row, Mobilized/Demobilized tabs, and the reusable DataTable. */
function WorkersListView() {
	const [workers, setWorkers] = useState<Worker[]>(WORKERS);
	const [statusTab, setStatusTab] = useState<Worker["status"]>("mobilized");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [filters, setFilters] = useState<FilterValue>({});
	// Mobilization changes are staged here until the confirm dialog is accepted.
	const [pending, setPending] = useState<{ids: string[]; to: Worker["status"]} | null>(null);
	// The compliance tab is host-owned: the widget reports a verdict and holds none of its own. Keyed by
	// worker as well as check — one map would show worker A's decision on worker B's record.
	const [verdicts, setVerdicts] = useState<Record<string, Record<string, string>>>({});
	const [uploadNotice, setUploadNotice] = useState<string | null>(null);

	const columns = useMemo(
		() =>
			makeWorkerColumns(
				(worker) => setSelectedId(worker.id),
				(worker) => setPending({ids: [worker.id], to: worker.status === "mobilized" ? "demobilized" : "mobilized"}),
			),
		[],
	);

	// Filters apply to both tabs, so the counts track the active filter set — only the
	// status split differs between them.
	const filtered = useMemo(
		() =>
			workers.filter((worker) =>
				Object.entries(filters).every(([key, selected]) => {
					if (!selected || selected.length === 0) return true;
					return selected.includes(String(worker[key as keyof Worker]));
				}),
			),
		[workers, filters],
	);

	const statusCounts = useMemo(
		() => ({
			mobilized: filtered.filter((worker) => worker.status === "mobilized").length,
			demobilized: filtered.filter((worker) => worker.status === "demobilized").length,
		}),
		[filtered],
	);

	const data = useMemo(() => filtered.filter((worker) => worker.status === statusTab), [filtered, statusTab]);
	const selected = workers.find((worker) => worker.id === selectedId);

	const pendingLabel = (() => {
		if (!pending) return "";
		if (pending.ids.length > 1) return `${pending.ids.length} workers`;
		return workers.find((worker) => worker.id === pending.ids[0])?.name ?? "This worker";
	})();

	return (
		<PushPanelProvider
			open={!!selected}
			onOpenChange={(open) => {
				if (open) return;
				setSelectedId(null);
				setUploadNotice(null);
			}}
			side="right"
		>
			<PushPanelContainer className="wwc:min-h-0 wwc:flex-1">
				<PushPanelMain className="wwc:h-full wwc:overflow-auto">
					{/* Gaps are set per-child, not with space-y: DataTable's toolbar already carries its own
					    top padding, so a blanket space-y would stack on top of it and push the search row
					    twice as far from the tabs as the tabs sit from the KPI cards. */}
					<div className="wwc:w-full wwc:p-6">
						<div className="wwc:mb-4 wwc:grid wwc:grid-cols-2 wwc:md:grid-cols-3 wwc:lg:grid-cols-6 wwc:gap-4">
							{WORKER_KPIS.map((kpi) => (
								<MetricCard key={kpi.title} title={kpi.title} value={kpi.value} status={kpi.status} />
							))}
						</div>

						<Tabs value={statusTab} onValueChange={(value) => setStatusTab(value as Worker["status"])}>
							<TabsList>
								<TabsTrigger value="mobilized">
									Mobilized
									<Badge variant="secondary" className="wwc:ml-2 wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
										{statusCounts.mobilized}
									</Badge>
								</TabsTrigger>
								<TabsTrigger value="demobilized">
									Demobilized
									<Badge variant="secondary" className="wwc:ml-2 wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
										{statusCounts.demobilized}
									</Badge>
								</TabsTrigger>
							</TabsList>
						</Tabs>

						<Filter value={filters} onChange={setFilters}>
							<DataTable
								key={statusTab}
								columns={columns}
								data={data}
								searchKey="name"
								searchPlaceholder="Search workers…"
								showColumnToggle
								recordLabel="worker"
								pageSize={10}
								toolbarExtra={
									<>
										<FilterTrigger />
										<FilterContent>
											<FilterCategory value="trade" label="Trade">
												{TRADES.map((trade) => (
													<FilterOption key={trade} value={trade}>
														{trade}
													</FilterOption>
												))}
											</FilterCategory>
											<FilterCategory value="company" label="Company">
												{COMPANIES.map((company) => (
													<FilterOption key={company} value={company}>
														{company}
													</FilterOption>
												))}
											</FilterCategory>
											<FilterCategory value="package" label="Package">
												{PACKAGES.map((pkg) => (
													<FilterOption key={pkg} value={pkg}>
														{pkg}
													</FilterOption>
												))}
											</FilterCategory>
										</FilterContent>
										<IconAction label="Upload Images" icon={<ImageUp className="wwc:h-4 wwc:w-4" />} />
										<IconAction label="Export" icon={<Download className="wwc:h-4 wwc:w-4" />} />
										<Button>
											<Plus className="wwc:h-4 wwc:w-4" />
											Add Worker(s)
										</Button>
									</>
								}
								bulkActions={[
									{
										label: statusTab === "mobilized" ? "Demobilize" : "Mobilize",
										variant: statusTab === "mobilized" ? "destructive" : "default",
										icon:
											statusTab === "mobilized" ? (
												<UserMinus className="wwc:h-4 wwc:w-4" />
											) : (
												<UserCheck className="wwc:h-4 wwc:w-4" />
											),
										onClick: (selectedIds) => {
											const ids = selectedIds
												.map((index) => data[Number(index)]?.id)
												.filter((id): id is string => id !== undefined);
											if (ids.length === 0) return;
											setPending({ids, to: statusTab === "mobilized" ? "demobilized" : "mobilized"});
										},
									},
								]}
							/>
						</Filter>
					</div>
				</PushPanelMain>

				<PushPanel width={360} className="wwc:h-full">
					<PushPanelHeader>
						<PushPanelHeaderTitle>
							<Avatar className="wwc:h-7 wwc:w-7">
								<AvatarFallback className="wwc:text-xs">{selected ? initials(selected.name) : "?"}</AvatarFallback>
							</Avatar>
							<PushPanelTitle className="wwc:truncate">{selected?.name ?? "Worker"}</PushPanelTitle>
						</PushPanelHeaderTitle>
						<PushPanelHeaderActions>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" icon aria-label="Profile actions" className="wwc:h-6 wwc:w-6">
										<MoreHorizontal className="wwc:h-4 wwc:w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" side="bottom">
									<DropdownMenuItem>
										<Download className="wwc:h-4 wwc:w-4" />
										Export
									</DropdownMenuItem>
									<DropdownMenuItem
										className={
											selected?.status === "mobilized" ? "wwc:text-destructive wwc:focus:text-destructive" : undefined
										}
										onClick={() => {
											if (!selected) return;
											setPending({
												ids: [selected.id],
												to: selected.status === "mobilized" ? "demobilized" : "mobilized",
											});
										}}
									>
										{selected?.status === "mobilized" ? (
											<>
												<UserMinus className="wwc:mr-2 wwc:h-4 wwc:w-4" />
												Demobilize worker
											</>
										) : (
											<>
												<UserCheck className="wwc:mr-2 wwc:h-4 wwc:w-4" />
												Mobilize worker
											</>
										)}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<PushPanelClose asChild>
								<Button variant="ghost" icon aria-label="Close profile" className="wwc:h-6 wwc:w-6">
									<X className="wwc:h-4 wwc:w-4" />
								</Button>
							</PushPanelClose>
						</PushPanelHeaderActions>
					</PushPanelHeader>

					{selected && (
						<WorkerProfile
							general={workerProfileGroups(selected)}
							compliance={{
								...workerCompliance(
									selected,
									verdicts[selected.id] ?? {},
									(id, option) =>
										setVerdicts((current) => ({
											...current,
											[selected.id]: {...current[selected.id], [id]: option},
										})),
									(id) => setUploadNotice(`Upload requested for ${id}`),
								),
								footer: uploadNotice ? <p className="wwc:text-xs wwc:text-muted-foreground">{uploadNotice}</p> : null,
							}}
							device={workerDeviceFields(selected)}
						/>
					)}
				</PushPanel>
			</PushPanelContainer>

			<ConfirmDialog
				open={pending !== null}
				onOpenChange={(open) => !open && setPending(null)}
				destructive={pending?.to === "demobilized"}
				title={pending?.to === "demobilized" ? "Demobilize workers?" : "Mobilize workers?"}
				description={
					pending?.to === "demobilized" ? (
						<>
							{pendingLabel} will be moved to the Demobilized list. Their records stay intact and they can be
							remobilized later.
						</>
					) : (
						<>{pendingLabel} will be moved back to the Mobilized list.</>
					)
				}
				confirmLabel={pending?.to === "demobilized" ? "Demobilize" : "Mobilize"}
				onConfirm={() => {
					if (!pending) return;
					const ids = new Set(pending.ids);
					setWorkers((prev) => prev.map((worker) => (ids.has(worker.id) ? {...worker, status: pending.to} : worker)));
					setPending(null);
				}}
			/>
		</PushPanelProvider>
	);
}

export interface WorkforceProps {
	/**
	 * What fills the Map View tab — a 3D/map engine mounted by the consuming app (e.g. a
	 * FragmentViewer, the same way Site Reality takes a `stage`). The template can't resolve the
	 * engine's worker URL itself, so the app supplies the ready-made stage. Falls back to a
	 * placeholder when omitted.
	 */
	mapStage?: React.ReactNode;
}

/**
 * Workforce template scaffold. Renders its own app shell and a content area that toggles
 * between the route header (tabs + a Settings action) and a Settings sub-surface (SideMenu +
 * content). Live surfaces fill Workers List, Crews, OBS, Compliance, and — when `mapStage` is
 * provided — Map View; the rest stay placeholders.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the CoreWorkforce template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function Workforce({mapStage}: WorkforceProps = {}) {
	const [mode, setMode] = useState<"default" | "settings">("default");
	// Persisted so a reload keeps the same tab and selected project.
	const [activeTab, setActiveTab] = usePersistentState<WorkforceTabId>("wc3.workforce.tab", "analytics");
	const [project, setProject] = usePersistentState<string>("wc3.project", PROJECTS[0]);
	const [activeSetting, setActiveSetting] = useState<SettingId>("general");
	// A drilled-into ontology record reports its title here so the breadcrumb can show it — same wiring
	// as core-wc3-workspace.tsx:383. The views clear it on unmount, so leaving a record or switching
	// setting restores the plain breadcrumb without any reset logic here.
	const [detailLabel, setDetailLabel] = useState<string | null>(null);
	// Project compliance config, shared between the Compliance settings tab and the Compliance table.
	const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>(DEFAULT_COMPLIANCE_RULES);
	// Mobile navigation drawer — the top-bar hamburger opens the sidebar as a left sheet.
	const [navOpen, setNavOpen] = useState(false);

	const activeSettingLabel = settingLabel(activeSetting);
	const placeholder = activeTab === "workers-list" ? null : TAB_PLACEHOLDER[activeTab];

	// Ontology settings render the shared admin views; every other setting keeps its own body.
	const ontologyViewId = ONTOLOGY_SETTING_VIEW_IDS[activeSetting];
	const OntologyView = ontologyViewId ? ONTOLOGY_VIEWS[ontologyViewId] : undefined;

	const breadcrumb =
		mode === "settings"
			? `Workforce / Settings / ${activeSettingLabel}${detailLabel ? ` / ${detailLabel}` : ""}`
			: `Workforce / ${tabLabel(activeTab)}`;

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:bg-background wwc:text-foreground">
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={WORKFORCE_GROUPS}
				activeItemId="workforce"
				showSearch={false}
				showNotifications={false}
				mobileOpen={navOpen}
				onMobileOpenChange={setNavOpen}
			/>

			<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
				<CoreAppTopBar
					activeLabel={breadcrumb}
					showProjectSwitcher
					projects={PROJECTS}
					selectedProject={project}
					onSelectProject={setProject}
					showNotifications
					notificationCount={3}
					onMenuClick={() => setNavOpen(true)}
				/>

				<main className="wwc:relative wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-hidden">
					{mode === "default" ? (
						<>
							<PageContentHeader
								variant="navigation"
								title="Workforce"
								tabs={TABS}
								activeTab={activeTab}
								onTabChange={(tab) => setActiveTab(tab as WorkforceTabId)}
								actions={[
									{
										id: "settings",
										label: "Settings",
										icon: <Settings className="wwc:h-4 wwc:w-4" />,
										presentation: "icon",
										priority: "persistent",
										onSelect: () => setMode("settings"),
									},
								]}
							/>

							{activeTab === "analytics" ? (
								<AnalyticsView onNavigate={(tab) => setActiveTab(tab as WorkforceTabId)} />
							) : activeTab === "workers-list" ? (
								<WorkersListView />
							) : activeTab === "crews" ? (
								<CrewsView />
							) : activeTab === "obs" ? (
								<ObsView />
							) : activeTab === "compliance" ? (
								<ComplianceView rules={complianceRules} />
							) : activeTab === "map-view" && mapStage ? (
								// Collapsible workers menu beside the injected 3D/map engine.
								<WorkforceMapView stage={mapStage} />
							) : (
								<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
									<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1200px] wwc:p-6">
										<div className="wwc:flex wwc:min-h-[320px] wwc:items-center wwc:justify-center">
											{placeholder && (
												<Empty
													icon={placeholder.icon}
													title={placeholder.title}
													description={placeholder.description}
												/>
											)}
										</div>
									</div>
								</div>
							)}
						</>
					) : (
						<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:md:flex-row">
							<SideMenu
								title="Settings"
								onBack={() => setMode("default")}
								backLabel="Back to Workforce"
								showSearch={false}
								groups={SETTINGS_GROUPS}
								activeItemId={activeSetting}
								onItemSelect={(id) => setActiveSetting(id as SettingId)}
							/>

							{/*
							 * Flex column, not a plain overflow-auto box: every ontology view returns a flush `Pane`
							 * (flex min-h-0 flex-1) and every detail page a flex column, so the table only fills and
							 * scrolls correctly inside a flex parent. Non-ontology settings keep their own scroll box.
							 */}
							<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-hidden">
								{OntologyView ? (
									<>
										{/* `Pane flush` sets pt-0 because it assumes a header band above it — this is that band,
										    and it replaces the <h1> the removed Workforce forks drew. compact matches the admin. */}
										<PageContentHeader
											variant="title-actions"
											density="compact"
											title={activeSettingLabel}
											description={SETTING_PLACEHOLDER[activeSetting]}
										/>
										{/* Distinct component types per setting id, so switching remounts and the view's own
										    effect cleanup clears the breadcrumb segment — no key or reset needed here. */}
										<OntologyView scope={WORKFORCE_ONTOLOGY_SCOPE} onDetailChange={setDetailLabel} />
										{/* SharedPropertiesView fires undoable toasts; the removed forks each mounted their own
										    Toaster. This branch is mutually exclusive with the compliance one, so no duplicate. */}
										<Toaster position="top-right" />
									</>
								) : (
									<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
										{activeSetting === "compliance" ? (
											<ComplianceSettings rules={complianceRules} onRulesChange={setComplianceRules} />
										) : (
											<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1000px] wwc:p-6">
												<h1 className="wwc:text-xl wwc:font-semibold wwc:tracking-tight">{activeSettingLabel}</h1>
												<div className="wwc:mt-4 wwc:flex wwc:min-h-[320px] wwc:items-center wwc:justify-center">
													<Empty
														icon={<Settings className="wwc:h-6 wwc:w-6" />}
														title={activeSettingLabel}
														description={SETTING_PLACEHOLDER[activeSetting]}
													/>
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
