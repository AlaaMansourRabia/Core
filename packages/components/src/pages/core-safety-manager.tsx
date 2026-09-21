import type {ColumnDef} from "@tanstack/react-table";

import {cn} from "@wakecap/core-utils";
import {format} from "date-fns";
import {
	BarChart3,
	CheckCircle2,
	ChevronDown,
	Clock,
	Copy,
	Download,
	FileDown,
	Flag,
	Layers,
	List,
	Map as MapIcon,
	MapPin,
	Plus,
	Radio,
	Save,
	Settings,
	Share2,
	ShieldCheck,
	ShieldX,
	SquarePen,
	Box,
	Dna,
	Folder,
	Link2,
	Network,
	Puzzle,
	SlidersHorizontal,
	Tags,
	Trash2,
	UserCheck,
	UserPlus,
	Users,
	MonitorSmartphone,
	Phone,
	Gauge,
	TrendingUp,
	MoreHorizontal,
	Filter as FunnelIcon,
	X,
	Workflow,
	Zap,
} from "lucide-react";
import {useMemo, useState} from "react";

import {AddObservationDialog, type AddObservationOption} from "../add-observation-dialog";
import {Avatar, AvatarFallback} from "../avatar";
import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import type {CommentBadgeTone, CommentItem} from "../comment-thread";
import {DataTable, DataTableColumnHeader, DataTableRowActions} from "../data-table";
import {DateRangeTimePicker} from "../date-picker";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import {Empty} from "../empty";
import {ExportDialog, type ExportTemplateOption} from "../export-dialog";
import {Field, FieldError, FieldLabel} from "../field";
import {
	Filter,
	FilterCategory,
	FilterChips,
	FilterContent,
	FilterOption,
	FilterTrigger,
	type FilterValue,
} from "../filter";
import {FormActionBar} from "../form-action-bar";
import {Input} from "../input";
import {KPISummary, type KpiMetric} from "../kpi-summary";
import {Map as SiteMap} from "../map";
import {MultiSelect, type MultiSelectOption} from "../multi-select";
import {CoreAppSidebar, type SidebarNavGroup} from "../navigation/core-app-sidebar";
import {CoreAppTopBar} from "../navigation/core-app-top-bar";
import {PageContentHeader} from "../page-content-header";
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
import {RadioGroup, RadioGroupItem} from "../radio-group";
import {SearchableSelect, Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {Separator} from "../separator";
import {SideMenu, type SideMenuGroup} from "../side-menu";
import {Toaster} from "../sonner";
import {Switch} from "../switch";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../tabs";
import {TaskMonitor, type TaskMonitorItem} from "../task-monitor";
import {Textarea} from "../textarea";
import {HoverTooltip} from "../tooltip";
import {type ViewTabItem} from "../view-tab-bar";
import {ObservationsMapView} from "./core-observations-map-view";
import {ontologyScopeCounts, type OntologyScope} from "./wc3-ontology-scope";
import {ONTOLOGY_VIEWS} from "./wc3-ontology-views";

// Safety Manager — the observation-manager template scaffold. A full app shell
// (CoreAppSidebar + CoreAppTopBar) with a single "Safety Manager" sidebar entry.
// The content area toggles between the route header (Analytics / List View / Map View
// tabs + a Settings action) and a Settings sub-surface (SideMenu + content). The List
// View embeds the reusable TaskMonitor component with observation data — all task-
// management behaviour lives in TaskMonitor/BrowserTabs, not in this template. The Map
// View pins the same observations on ObservationsMap. The top bar breadcrumb tracks the
// active content.

type SidebarNavItemLite = {id: string; label: string; icon: React.ComponentType<{className?: string}>};

const NAV_ITEMS: SidebarNavItemLite[] = [{id: "safety-manager", label: "Safety Manager", icon: ShieldCheck}];

const SAFETY_GROUPS: SidebarNavGroup[] = [{items: NAV_ITEMS}];

type SafetyTabId = "analytics" | "list-view" | "map-view" | "verify-response";

const TABS: ViewTabItem<SafetyTabId>[] = [
	{id: "analytics", label: "Analytics", icon: BarChart3},
	{id: "list-view", label: "List View", icon: List},
	{id: "map-view", label: "Map View", icon: MapIcon},
	{id: "verify-response", label: "Responder List", icon: Users},
];

const TAB_PLACEHOLDER: Record<
	Exclude<SafetyTabId, "list-view" | "map-view" | "verify-response">,
	{title: string; description: string; icon: React.ReactNode}
> = {
	analytics: {
		title: "Analytics",
		description: "Safety analytics and trends will appear here.",
		icon: <BarChart3 className="wwc:h-6 wwc:w-6" />,
	},
};

type SettingId =
	| "general"
	| "categories"
	| "workflow"
	| "object-types"
	| "link-types"
	| "action-types"
	| "interfaces"
	| "shared-properties"
	| "type-groups"
	| "graph";

// The slice of the WC3 ontology this product owns. Safety Manager is about observations raised
// against people, crews and places, and the permits that govern them. Only object types are named —
// every other tab is DERIVED by wc3-ontology-scope.ts. Module-level on purpose: the shared views
// memoise on this object's identity.
const SAFETY_ONTOLOGY_SCOPE: OntologyScope = {
	objectTypeIds: [
		"ot_observation",
		"ot_worker",
		"ot_crew",
		"ot_zone",
		"ot_site",
		"ot_project",
		"ot_permit",
		"ot_access_grant",
		"ot_equipment",
	],
};

// Counts come from the same derivation the tables use, so a badge cannot drift from its table.
const ONTOLOGY_COUNTS = ontologyScopeCounts(SAFETY_ONTOLOGY_SCOPE);

const SETTINGS_GROUPS: SideMenuGroup[] = [
	{
		label: "System",
		items: [
			{id: "general", label: "General", icon: SlidersHorizontal},
			{id: "categories", label: "Categories", icon: Tags},
			{id: "workflow", label: "Workflow", icon: Workflow},
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

// General and Categories render real content; the rest are still scaffold placeholders.
const SETTING_PLACEHOLDER: Record<string, string> = {
	workflow: "Configure the observation workflow — stages, approvals, and routing.",
};

const settingLabel = (id: string) => SETTINGS_ITEMS.find((item) => item.id === id)?.label ?? "Settings";
const tabLabel = (id: SafetyTabId) => TABS.find((tab) => tab.id === id)?.label ?? "";

// ─── Observations (List View data) ───────────────────────────────────────────

type ObservationStatus = "pending" | "open" | "closed";

const STATUS_LABEL: Record<ObservationStatus, string> = {
	pending: "Pending",
	open: "Open",
	closed: "Closed",
};

function statusVariant(status: ObservationStatus): "dangerSoft" | "warningSoft" | "successSoft" {
	if (status === "closed") return "successSoft";
	if (status === "pending") return "dangerSoft";
	return "warningSoft";
}

// Full severity ladder from the observation manager: "Not Determined" is the unset state.
type Severity = "Not Determined" | "Low" | "Medium" | "High" | "Emergency";

const SEVERITIES: Severity[] = ["Not Determined", "Low", "Medium", "High", "Emergency"];

// Severities a user can assign (Not Determined is the system's unset placeholder, never chosen).
const ASSIGNABLE_SEVERITIES: Severity[] = ["Low", "Medium", "High", "Emergency"];

function severityVariant(severity: Severity): "neutralSoft" | "successSoft" | "warningSoft" | "dangerSoft" {
	if (severity === "Emergency" || severity === "High") return "dangerSoft";
	if (severity === "Medium") return "warningSoft";
	if (severity === "Low") return "successSoft";
	return "neutralSoft";
}

type Observation = {
	id: string;
	/** Event type — the card heading (e.g. "Speed Violation"). */
	title: string;
	/** Full sentence describing what was detected. */
	description: string;
	status: ObservationStatus;
	severity: Severity;
	/** System that raised the observation (AVL, ConnectedWorker, CCTV, ClinicViolation…). */
	source: string;
	/** Observation category/type, used by the Category filter. */
	category?: string;
	/** Contractor the event is attributed to; undefined renders as "Not Determined". */
	company?: string;
	/** Number of identical events rolled up into this one, when > 0. */
	groupCount?: number;
	/** Good Practice observations hide False Alarm / False Positive and skip the severity step. */
	isGoodPractice?: boolean;
	/** Set when a CCTV observation was closed as a false positive — drives the header badge. */
	falsePositive?: boolean;
	/** False until the detail has been opened; an unviewed row shows a leading dot. */
	viewed?: boolean;
	/** Responder assigned to work an open observation; undefined = not yet assigned. */
	assignedTo?: string;
	/** Responder who closed the observation; undefined for desk dismissals (false alarm / false positive). */
	closedBy?: string;
	updatedAt: string;
};

const OBSERVATIONS: Observation[] = [
	{
		id: "o-1",
		title: "Speed Violation",
		description: "Speed violation detected at MAR Entrance.",
		status: "pending",
		severity: "Medium",
		source: "AVL",
		category: "Vehicle & Traffic Safety",
		updatedAt: "less than a minute ago",
	},
	{
		id: "o-2",
		title: "Head Impact",
		description:
			"A Head Impact was received from worker ID 2607463938 from Company TR-SFEC. Please verify the incident and provide assistance immediately.",
		status: "pending",
		severity: "High",
		source: "ConnectedWorker",
		category: "Fall Protection",
		company: "TR-SFEC",
		updatedAt: "3 minutes ago",
	},
	{
		id: "o-3",
		title: "PPE Non-Compliance",
		description: "CCTV flagged a worker without a hard hat at the Gate 4 walkway. Please verify the footage.",
		status: "pending",
		severity: "Medium",
		source: "CCTV",
		category: "PPE Non-Compliance",
		company: "TR-SFEC",
		updatedAt: "6 minutes ago",
	},
	{
		id: "o-4",
		title: "Unfit Worker",
		description:
			"Unfit for Work violation: worker ANIL PUN MAGAR (ID PA3623851) is present in Zone TR-PKG2-TCF Camp despite medical restrictions. Immediate action is required.",
		status: "pending",
		severity: "High",
		source: "ClinicViolation",
		category: "Unfit for Work",
		company: "TR-SINOPEC5",
		groupCount: 98,
		updatedAt: "18 days ago",
	},
	{
		id: "o-5",
		title: "Good Housekeeping",
		description: "Crew proactively cleared and organised the laydown yard ahead of the weekend shift.",
		status: "pending",
		severity: "Not Determined",
		source: "Manual",
		category: "Housekeeping",
		company: "TR-SFEC",
		isGoodPractice: true,
		updatedAt: "25 minutes ago",
	},
	{
		id: "o-6",
		title: "Unfit Worker",
		description:
			"Unfit for Work violation: worker MUHAMED SHIHAB (ID 2267834220) is present in Zone TR-PKG2/887-Storage and Metering Area(34)-1 despite medical restrictions. Immediate action is required.",
		status: "open",
		severity: "Medium",
		source: "ClinicViolation",
		category: "Unfit for Work",
		company: "TR",
		groupCount: 122,
		viewed: true,
		updatedAt: "about 1 month ago",
	},
	{
		id: "o-7",
		title: "Missing Guardrail",
		description: "Fall-protection guardrail missing on level 3, Zone B. Area roped off pending repair.",
		status: "open",
		severity: "High",
		source: "Inspection",
		category: "Fall Protection",
		company: "TR-SFEC",
		viewed: true,
		assignedTo: "Muhammad Aqeel",
		updatedAt: "2 hours ago",
	},
	{
		id: "o-8",
		title: "PPE Compliance",
		description: "PPE compliance spot check completed at Site A. All findings corrected on site.",
		status: "closed",
		severity: "Low",
		source: "Inspection",
		category: "PPE Non-Compliance",
		company: "TR",
		viewed: true,
		closedBy: "Roberto Cruz Tuazon",
		updatedAt: "3 days ago",
	},
	{
		id: "o-9",
		title: "PPE Non-Compliance",
		description: "CCTV alert reviewed and dismissed — the flagged worker was wearing a compliant bump cap.",
		status: "closed",
		severity: "Low",
		source: "CCTV",
		category: "PPE Non-Compliance",
		company: "TR-SFEC",
		falsePositive: true,
		viewed: true,
		updatedAt: "4 days ago",
	},
];

const COMPANIES = Array.from(new Set(OBSERVATIONS.map((o) => o.company ?? "Not Determined")));
const SOURCES = Array.from(new Set(OBSERVATIONS.map((o) => o.source)));
const OBSERVATION_CATEGORIES = Array.from(new Set(OBSERVATIONS.map((o) => o.category).filter((c): c is string => !!c)));

// Responders an observation can be assigned to / closed by. Mirrors the names in the Verify Response
// responder list; kept as a literal here to avoid depending on that block's initialisation order.
const RESPONDER_NAMES = [
	"Miguel",
	"Mohammad Junaid Raza",
	"Abhilash Sadanandan",
	"Muhammad Aqeel",
	"Melandro Dalisay Mapili",
	"Roberto Cruz Tuazon",
	"Ahsan Nadeem",
];

const EXPORT_TEMPLATES: ExportTemplateOption[] = [
	{
		id: "incident-log",
		label: "Incident log",
		description: "One row per observation with status, severity, and source.",
		fileType: "excel",
		includeFilters: true,
	},
	{
		id: "weekly-summary",
		label: "Weekly safety summary",
		description: "Counts by status and severity for the period.",
		fileType: "pdf",
		includeFilters: false,
	},
	{
		id: "contractor-breakdown",
		label: "Contractor breakdown",
		description: "Observations grouped by company.",
		fileType: "excel",
		includeFilters: false,
	},
];

// ─── Add Observation form options ────────────────────────────────────────────

const ZONE_OPTIONS: AddObservationOption[] = [
	{value: "mar-entrance", label: "MAR Entrance"},
	{value: "tcf-camp", label: "TR-PKG2-TCF Camp"},
	{value: "storage-metering", label: "TR-PKG2/887-Storage and Metering Area(34)-1"},
	{value: "level-3-zone-b", label: "Level 3 — Zone B"},
	{value: "laydown-yard", label: "Laydown Yard"},
];

const CATEGORY_OPTIONS: AddObservationOption[] = [
	{value: "ppe", label: "PPE Non-Compliance"},
	{value: "fall-protection", label: "Fall Protection"},
	{value: "vehicle-safety", label: "Vehicle & Traffic Safety"},
	{value: "housekeeping", label: "Housekeeping"},
	{value: "hot-work", label: "Hot Work"},
	{value: "unfit-for-work", label: "Unfit for Work"},
];

const WORKER_OPTIONS: AddObservationOption[] = [
	{value: "pa3623851", label: "Anil Pun Magar (PA3623851)"},
	{value: "2267834220", label: "Muhamed Shihab (2267834220)"},
	{value: "2607463938", label: "Worker 2607463938"},
];

// A system-authored activity entry for the comment log — assignment, closure, severity changes, etc.
// The comment thread doubles as the observation's audit trail, so every lifecycle action drops one.
function systemActivity(id: string, body: string, timestamp: string, tone: CommentBadgeTone = "info"): CommentItem {
	return {
		id,
		author: {name: "System", initials: "SY"},
		timestamp,
		body,
		badges: [{id: "activity", icon: <Radio className="wwc:h-3 wwc:w-3" />, label: "Activity", tone}],
	};
}

const INITIAL_COMMENTS: Record<string, CommentItem[]> = {
	// Seeded on the guardrail observation, whose thread the copy refers to.
	"o-5": [
		{
			id: "c-seed-1",
			author: {name: "Layla N."},
			timestamp: "2 hours ago",
			body: "Roped off the area. Maintenance needs to install a permanent guardrail before the next shift.",
			badges: [{id: "flag", icon: <Flag className="wwc:h-3 wwc:w-3" />, label: "Flagged", tone: "warning"}],
		},
	],
	// Activity history for the already-assigned / already-closed observations, newest first.
	"o-7": [systemActivity("c-o7-act", "Opened and assigned to Muhammad Aqeel.", "2 hours ago")],
	"o-8": [systemActivity("c-o8-act", "Closed by Roberto Cruz Tuazon.", "3 days ago", "success")],
	"o-9": [
		systemActivity(
			"c-o9-act",
			"Marked as false positive and dismissed — no responder response required.",
			"4 days ago",
			"muted",
		),
	],
};

function DetailRow({label, value}: {label: string; value: React.ReactNode}) {
	return (
		<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:py-2 wwc:last:border-b-0">
			<span className="wwc:text-xs wwc:text-muted-foreground">{label}</span>
			<span className="wwc:text-right wwc:text-sm wwc:font-medium">{value}</span>
		</div>
	);
}

/** List View — the reusable TaskMonitor wired to observation data. */
// ─── Lifecycle actions ───────────────────────────────────────────────────────

// The project-level "Require company selection" setting. Mirrors the Settings › General toggle,
// which defaults on; a company must be chosen before Open, Close, False Alarm, or False Positive.
const COMPANY_REQUIRED = true;

type LifecycleActionKey =
	| "open"
	| "false-alarm"
	| "false-positive"
	| "change-severity"
	| "set-company"
	| "close"
	| "reopen"
	| "delete";

type LifecycleActionMeta = {
	/** Button label in the list/detail, matching the observation manager wording. */
	label: string;
	/** Dialog heading. */
	title: string;
	/** Confirm button label. */
	confirm: string;
	icon: React.ReactNode;
	tone?: "default" | "destructive";
};

const LIFECYCLE_META: Record<LifecycleActionKey, LifecycleActionMeta> = {
	open: {
		label: "Mark as Opened",
		title: "Mark as Opened",
		confirm: "Mark as Opened",
		icon: <CheckCircle2 className="wwc:h-4 wwc:w-4" />,
	},
	"false-alarm": {
		label: "Mark as False Alarm",
		title: "Mark as False Alarm",
		confirm: "Confirm False Alarm",
		icon: <ShieldX className="wwc:h-4 wwc:w-4" />,
	},
	"false-positive": {
		label: "Mark as False Positive",
		title: "Mark as False Positive",
		confirm: "Confirm False Positive",
		icon: <ShieldX className="wwc:h-4 wwc:w-4" />,
	},
	"change-severity": {
		label: "Change Severity",
		title: "Change Severity",
		confirm: "Save Severity",
		icon: <Flag className="wwc:h-4 wwc:w-4" />,
	},
	"set-company": {
		label: "Set Company",
		title: "Set Company",
		confirm: "Save Company",
		icon: <Tags className="wwc:h-4 wwc:w-4" />,
	},
	close: {
		label: "Close Issue",
		title: "Close Issue",
		confirm: "Close Issue",
		icon: <CheckCircle2 className="wwc:h-4 wwc:w-4" />,
	},
	reopen: {
		label: "Reopen",
		title: "Reopen Observation",
		confirm: "Reopen",
		icon: <CheckCircle2 className="wwc:h-4 wwc:w-4" />,
	},
	delete: {
		label: "Delete",
		title: "Delete Observation",
		confirm: "Yes, Delete",
		icon: <Trash2 className="wwc:h-4 wwc:w-4" />,
		tone: "destructive",
	},
};

/** The status- and source-aware action set for one observation, split into primary + secondaries. */
function lifecycleActionsFor(o: Observation): {primary: LifecycleActionKey; secondary: LifecycleActionKey[]} {
	if (o.status === "pending") {
		const secondary: LifecycleActionKey[] = [];
		// Good Practice observations are affirmations — there is nothing to dispute.
		if (!o.isGoodPractice) secondary.push("false-alarm");
		// False Positive is a CCTV-only escape hatch.
		if (o.source === "CCTV" && !o.isGoodPractice) secondary.push("false-positive");
		secondary.push("delete");
		return {primary: "open", secondary};
	}
	if (o.status === "open") {
		const secondary: LifecycleActionKey[] = [];
		if (!o.isGoodPractice) secondary.push("change-severity");
		secondary.push("set-company", "delete");
		return {primary: "close", secondary};
	}
	return {primary: "reopen", secondary: ["delete"]};
}

/** Which inputs a given action collects. */
function actionNeeds(key: LifecycleActionKey, o: Observation) {
	return {
		severity: (key === "open" && !o.isGoodPractice) || key === "change-severity" || key === "reopen",
		company:
			(key === "open" && COMPANY_REQUIRED) ||
			(key === "false-alarm" && COMPANY_REQUIRED) ||
			(key === "close" && COMPANY_REQUIRED) ||
			key === "set-company",
		note: key === "false-alarm" || key === "false-positive" || key === "close" || key === "reopen",
		// Opening assigns a responder; closing records who closed it. Both are optional.
		responder: key === "open" || key === "close",
	};
}

type ActionForm = {severity: Severity | ""; company: string; note: string; responder: string};

// Human-readable audit-log line for a confirmed lifecycle action, appended to the comment thread.
function actionActivityMessage(key: LifecycleActionKey, form: ActionForm, o: Observation): string | null {
	const withNote = (base: string) => (form.note.trim() ? `${base} — ${form.note.trim()}` : base);
	switch (key) {
		case "open":
			return form.responder ? `Marked as opened and assigned to ${form.responder}.` : "Marked as opened.";
		case "close":
			return withNote(form.responder ? `Closed by ${form.responder}.` : "Closed.");
		case "false-alarm":
			return withNote("Marked as false alarm.");
		case "false-positive":
			return "Marked as false positive and dismissed.";
		case "change-severity":
			return `Severity changed to ${form.severity || o.severity}.`;
		case "set-company":
			return `Company set to ${form.company || o.company || "Not Determined"}.`;
		case "reopen":
			return withNote("Reopened.");
		default:
			return null;
	}
}

/**
 * Confirmation dialog shared by every lifecycle action. Its fields adapt to the action, and it
 * validates on click (never disables the confirm button) to match the rest of the template.
 */
function ObservationActionDialog({
	observation,
	actionKey,
	form,
	onFormChange,
	onConfirm,
	onCancel,
}: {
	observation: Observation | null;
	actionKey: LifecycleActionKey | null;
	form: ActionForm;
	onFormChange: (patch: Partial<ActionForm>) => void;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	const [showErrors, setShowErrors] = useState(false);
	const open = observation !== null && actionKey !== null;

	if (!observation || !actionKey) {
		return <Dialog open={false} onOpenChange={onCancel} />;
	}

	const meta = LIFECYCLE_META[actionKey];
	const needs = actionNeeds(actionKey, observation);

	const errors = {
		severity: needs.severity && form.severity === "" ? "Select a severity." : undefined,
		company: needs.company && form.company === "" ? "Please select a company first." : undefined,
	};
	const hasErrors = !!errors.severity || !!errors.company;

	const noteLabel = actionKey === "reopen" ? "Reopen note" : actionKey === "close" ? "Closing note" : "Note";
	const responderLabel = actionKey === "close" ? "Closed by" : "Assign to responder";

	const handleConfirm = () => {
		if (hasErrors) {
			setShowErrors(true);
			return;
		}
		setShowErrors(false);
		onConfirm();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) {
					setShowErrors(false);
					onCancel();
				}
			}}
		>
			<DialogContent className="wwc:gap-0 wwc:p-0 wwc:sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>{meta.title}</DialogTitle>
					<DialogDescription className="wwc:sr-only">
						Confirm the {meta.label.toLowerCase()} action for this observation.
					</DialogDescription>
				</DialogHeader>

				<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:px-4 wwc:py-4">
					<p className="wwc:text-sm wwc:text-muted-foreground">
						<span className="wwc:font-medium wwc:text-foreground">{observation.title}</span>
						{" — "}
						{actionKey === "delete"
							? "This permanently removes the observation and cannot be undone."
							: "Confirm the details below to continue."}
					</p>

					{needs.severity && (
						<Field>
							<FieldLabel htmlFor="action-severity">Severity</FieldLabel>
							<Select value={form.severity} onValueChange={(v) => onFormChange({severity: v as Severity})}>
								<SelectTrigger id="action-severity" aria-invalid={showErrors && !!errors.severity}>
									<SelectValue placeholder="Select severity" />
								</SelectTrigger>
								<SelectContent>
									{ASSIGNABLE_SEVERITIES.map((s) => (
										<SelectItem key={s} value={s}>
											{s}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{showErrors && errors.severity && <FieldError>{errors.severity}</FieldError>}
						</Field>
					)}

					{needs.company && (
						<Field>
							<FieldLabel htmlFor="action-company">Company</FieldLabel>
							<Select value={form.company} onValueChange={(v) => onFormChange({company: v})}>
								<SelectTrigger id="action-company" aria-invalid={showErrors && !!errors.company}>
									<SelectValue placeholder="Select company" />
								</SelectTrigger>
								<SelectContent>
									{COMPANIES.map((c) => (
										<SelectItem key={c} value={c}>
											{c}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{showErrors && errors.company && <FieldError>{errors.company}</FieldError>}
						</Field>
					)}

					{needs.responder && (
						<Field>
							<FieldLabel htmlFor="action-responder">{responderLabel}</FieldLabel>
							<Select value={form.responder} onValueChange={(v) => onFormChange({responder: v})}>
								<SelectTrigger id="action-responder">
									<SelectValue placeholder="Select responder" />
								</SelectTrigger>
								<SelectContent>
									{RESPONDER_NAMES.map((name) => (
										<SelectItem key={name} value={name}>
											{name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					)}

					{needs.note && (
						<Field>
							<FieldLabel htmlFor="action-note">{noteLabel}</FieldLabel>
							<Textarea
								id="action-note"
								value={form.note}
								onChange={(e) => onFormChange({note: e.target.value})}
								placeholder="Add a note…"
								className="wwc:min-h-20 wwc:resize-y"
							/>
						</Field>
					)}
				</div>

				<DialogFooter className="wwc:border-t wwc:border-border wwc:px-4 wwc:py-2">
					<Button variant="outline" size="sm" onClick={onCancel}>
						Cancel
					</Button>
					<Button size="sm" variant={meta.tone === "destructive" ? "destructive" : "default"} onClick={handleConfirm}>
						{meta.icon}
						{meta.confirm}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ─── Grouped observations dialog ─────────────────────────────────────────────

type GroupedRow = {id: string; received: string; generated: string; zone: string; location: string};

// A small synthetic set standing in for the grouped-observations endpoint.
function groupedRowsFor(o: Observation): GroupedRow[] {
	const count = Math.min(o.groupCount ?? 0, 8);
	return Array.from({length: count}, (_, i) => ({
		id: `${o.id}-g${i + 1}`,
		received: `20 Jul 2026, ${String(9 + (i % 8)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
		generated: `20 Jul 2026, ${String(9 + (i % 8)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
		zone: o.source === "AVL" ? "MAR Entrance" : "TR-PKG2-TCF Camp",
		location: "24.7136, 46.6753",
	}));
}

const GROUPED_COLUMNS: ColumnDef<GroupedRow>[] = [
	{accessorKey: "received", header: ({column}) => <DataTableColumnHeader column={column} title="Received" />},
	{accessorKey: "generated", header: ({column}) => <DataTableColumnHeader column={column} title="Generated" />},
	{accessorKey: "zone", header: ({column}) => <DataTableColumnHeader column={column} title="Zone" />},
	{accessorKey: "location", header: ({column}) => <DataTableColumnHeader column={column} title="Location" />},
];

function GroupedObservationsDialog({observation, onClose}: {observation: Observation | null; onClose: () => void}) {
	return (
		<Dialog open={observation !== null} onOpenChange={(next) => !next && onClose()}>
			<DialogContent className="wwc:gap-0 wwc:p-0 wwc:sm:max-w-[720px]">
				<DialogHeader>
					<DialogTitle>Grouped observations{observation ? ` (${observation.groupCount})` : ""}</DialogTitle>
					<DialogDescription className="wwc:sr-only">
						The individual events rolled up into this observation.
					</DialogDescription>
				</DialogHeader>
				<div className="wwc:px-4 wwc:py-4">
					{observation && (
						<DataTable columns={GROUPED_COLUMNS} data={groupedRowsFor(observation)} recordLabel="event" pageSize={5} />
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ─── Location dialog ─────────────────────────────────────────────────────────

function LocationDialog({observation, onClose}: {observation: Observation | null; onClose: () => void}) {
	return (
		<Dialog open={observation !== null} onOpenChange={(next) => !next && onClose()}>
			<DialogContent className="wwc:gap-0 wwc:p-0 wwc:sm:max-w-[640px]">
				<DialogHeader>
					<DialogTitle>Location Details</DialogTitle>
					<DialogDescription className="wwc:sr-only">
						The observation and worker location on the site map.
					</DialogDescription>
				</DialogHeader>
				<div className="wwc:h-[360px]">
					<SiteMap className="wwc:h-full wwc:w-full wwc:rounded-none" center={[46.6753, 24.7136]} zoom={15} />
				</div>
			</DialogContent>
		</Dialog>
	);
}

function ObservationsListView() {
	const [items, setItems] = useState<Observation[]>(OBSERVATIONS);
	const [search, setSearch] = useState("");
	const [filterId, setFilterId] = useState<string | undefined>("all");
	const [applied, setApplied] = useState<FilterValue>({});
	const [dateRange, setDateRange] = useState<{from: Date | undefined; to: Date | undefined}>({
		from: undefined,
		to: undefined,
	});
	const [openIds, setOpenIds] = useState<string[]>(["o-1"]);
	const [activeId, setActiveId] = useState<string | undefined>("o-1");
	const [comment, setComment] = useState("");
	const [commentFlagged, setCommentFlagged] = useState(false);
	const [commentDate, setCommentDate] = useState<Date | undefined>();
	const [commentsByItem, setCommentsByItem] = useState<Record<string, CommentItem[]>>(INITIAL_COMMENTS);

	// Lifecycle dialog: which action is confirming, against which observation, and its inputs.
	const [actionKey, setActionKey] = useState<LifecycleActionKey | null>(null);
	const [actionTargetId, setActionTargetId] = useState<string | undefined>();
	const [actionForm, setActionForm] = useState<ActionForm>({severity: "", company: "", note: "", responder: ""});
	const [groupedForId, setGroupedForId] = useState<string | undefined>();
	const [locationForId, setLocationForId] = useState<string | undefined>();

	// Open a lifecycle action against the active observation, seeding the form from its current values.
	const startAction = (key: LifecycleActionKey, target: Observation) => {
		setActionTargetId(target.id);
		setActionKey(key);
		setActionForm({
			severity: target.severity === "Not Determined" ? "" : target.severity,
			company: target.company ?? "",
			note: "",
			responder: key === "close" ? (target.closedBy ?? "") : (target.assignedTo ?? ""),
		});
	};

	const closeAction = () => {
		setActionKey(null);
		setActionTargetId(undefined);
	};

	// Apply the confirmed action to the observation, mirroring the observation-manager mutations.
	const confirmAction = () => {
		if (!actionKey || !actionTargetId) return;
		const key = actionKey;
		const targetId = actionTargetId;
		if (key === "delete") {
			setItems((prev) => prev.filter((o) => o.id !== targetId));
			setOpenIds((prev) => prev.filter((x) => x !== targetId));
			if (activeId === targetId) setActiveId(undefined);
			closeAction();
			return;
		}
		const target = byId.get(targetId);
		const responder = actionForm.responder;
		setItems((prev) =>
			prev.map((o) => {
				if (o.id !== targetId) return o;
				const company = actionForm.company || o.company;
				const severity = (actionForm.severity || o.severity) as Severity;
				switch (key) {
					case "open":
						return {
							...o,
							status: "open",
							company,
							severity: o.isGoodPractice ? o.severity : severity,
							assignedTo: responder || o.assignedTo,
						};
					case "false-alarm":
						return {...o, status: "closed", company};
					case "false-positive":
						return {...o, status: "closed", falsePositive: true};
					case "change-severity":
						return {...o, severity};
					case "set-company":
						return {...o, company};
					case "close":
						return {...o, status: "closed", company, closedBy: responder || o.closedBy};
					case "reopen":
						// Back to active work — the prior closure no longer applies.
						return {...o, status: "open", severity, falsePositive: false, closedBy: undefined};
					default:
						return o;
				}
			}),
		);

		// Drop a matching entry into the observation's comment log so it doubles as an audit trail.
		if (target) {
			const message = actionActivityMessage(key, actionForm, target);
			if (message) {
				const tone: CommentBadgeTone =
					key === "close" ? "success" : key === "false-alarm" || key === "false-positive" ? "muted" : "info";
				setCommentsByItem((prev) => ({
					...prev,
					[targetId]: [
						systemActivity(`c-${targetId}-a${prev[targetId]?.length ?? 0}`, message, "just now", tone),
						...(prev[targetId] ?? []),
					],
				}));
			}
		}

		closeAction();
	};

	// Controlled Filter: Apply commits into `applied`, the chips strip removes from it.
	const removeApplied = (categoryId: string, optionValue: string) =>
		setApplied((prev) => {
			const rest = (prev[categoryId] ?? []).filter((v) => v !== optionValue);
			const next = {...prev};
			if (rest.length === 0) delete next[categoryId];
			else next[categoryId] = rest;
			return next;
		});

	const appliedLabel = (categoryId: string, optionValue: string) =>
		categoryId === "status" ? (STATUS_LABEL[optionValue as ObservationStatus] ?? optionValue) : optionValue;

	// The date range rides in the same chips strip as a synthetic "date" category, so a picked
	// range reads and clears exactly like a filter selection.
	const dateChipLabel = dateRange.from
		? dateRange.to
			? `${format(dateRange.from, "MMM dd, p")} — ${format(dateRange.to, "MMM dd, p")}`
			: format(dateRange.from, "MMM dd, p")
		: undefined;

	const clearDateRange = () => setDateRange({from: undefined, to: undefined});

	const chipValue: FilterValue = dateChipLabel ? {...applied, date: [dateChipLabel]} : applied;

	const appliedFilterCount = Object.values(chipValue).reduce((sum, values) => sum + values.length, 0);

	const byId = useMemo(() => new Map(items.map((observation) => [observation.id, observation])), [items]);

	const filters = useMemo(
		() => [
			{id: "all", label: "All", count: items.length},
			{id: "pending", label: "Pending", count: items.filter((o) => o.status === "pending").length},
			{id: "open", label: "Open", count: items.filter((o) => o.status === "open").length},
			{id: "closed", label: "Closed", count: items.filter((o) => o.status === "closed").length},
		],
		[items],
	);

	const monitorItems: TaskMonitorItem[] = useMemo(
		() =>
			items
				.filter((o) => {
					if (filterId !== undefined && filterId !== "all" && o.status !== filterId) return false;
					const haystack = `${o.title} ${o.description}`.toLowerCase();
					return haystack.includes(search.toLowerCase());
				})
				.map((o) => ({
					id: o.id,
					title: o.title,
					subtitle: o.description,
					// Grouped observations carry a clickable layers icon into their open tab; it opens the
					// grouped-violations dialog without switching tab (stopPropagation).
					icon:
						o.groupCount !== undefined ? (
							<button
								type="button"
								aria-label={`View ${o.groupCount} grouped observations`}
								onClick={(e) => {
									e.stopPropagation();
									setGroupedForId(o.id);
								}}
								className="wwc:flex wwc:items-center wwc:justify-center wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground"
							>
								<Layers className="wwc:h-3.5 wwc:w-3.5" />
							</button>
						) : undefined,
				})),
		[items, filterId, search],
	);

	const active = activeId !== undefined ? byId.get(activeId) : undefined;
	const actionTarget = actionTargetId !== undefined ? (byId.get(actionTargetId) ?? null) : null;
	const groupedTarget = groupedForId !== undefined ? (byId.get(groupedForId) ?? null) : null;
	const locationTarget = locationForId !== undefined ? (byId.get(locationForId) ?? null) : null;

	// Opening an observation marks it viewed, exactly as the detail auto-mark-viewed mutation does.
	const selectItem = (id: string | undefined) => {
		setActiveId(id);
		if (id !== undefined) setItems((prev) => prev.map((o) => (o.id === id ? {...o, viewed: true} : o)));
	};

	return (
		<>
			<TaskMonitor
				className="wwc:min-h-0 wwc:flex-1"
				itemNoun="observation"
				listTitle="Observations"
				items={monitorItems}
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search observations..."
				listFilterStrip={
					// Undefined when nothing is applied so the strip's border/padding doesn't render empty.
					Object.keys(chipValue).length > 0 ? (
						<FilterChips
							value={chipValue}
							onRemove={(categoryId, optionValue) => {
								if (categoryId === "date") clearDateRange();
								else removeApplied(categoryId, optionValue);
							}}
							onClear={() => {
								setApplied({});
								clearDateRange();
							}}
							renderLabel={appliedLabel}
						/>
					) : undefined
				}
				listTrailing={
					<>
						{/* All four share FilterTrigger's outline icon-button shape so the row reads as one control group. */}
						<AddObservationDialog
							trigger={
								<Button variant="outline" icon aria-label="Add observation" tooltip="Add observation">
									<Plus className="wwc:h-4 wwc:w-4" />
								</Button>
							}
							zones={ZONE_OPTIONS}
							categories={CATEGORY_OPTIONS}
							workers={WORKER_OPTIONS}
							onSave={() => undefined}
						/>
						<ExportDialog
							trigger={
								<Button variant="outline" icon aria-label="Export" tooltip="Export">
									<Download className="wwc:h-4 wwc:w-4" />
								</Button>
							}
							templates={EXPORT_TEMPLATES}
							activeFilterCount={appliedFilterCount}
							defaultDateRange={dateRange}
							onCreateTemplate={() => undefined}
						/>
						{/* Short tooltip, descriptive aria-label — the hint is a hover glance, not a screen-reader label. */}
						<DateRangeTimePicker
							iconOnly
							aria-label="Filter by date & time range"
							tooltip="Date & time"
							dateRange={dateRange}
							onDateRangeChange={setDateRange}
						/>
						<Filter value={applied} onChange={setApplied}>
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="severity" label="Severity">
									{SEVERITIES.map((severity) => (
										<FilterOption key={severity} value={severity}>
											{severity}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="source" label="Source">
									{SOURCES.map((source) => (
										<FilterOption key={source} value={source}>
											{source}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="category" label="Category">
									{OBSERVATION_CATEGORIES.map((category) => (
										<FilterOption key={category} value={category}>
											{category}
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
							</FilterContent>
						</Filter>
					</>
				}
				renderListRow={(item, isSelected) => {
					const o = byId.get(item.id);
					if (!o) return null;
					return (
						<Card
							className={cn(
								"wwc:cursor-pointer wwc:space-y-2 wwc:p-3 wwc:shadow-none wwc:transition-colors",
								isSelected ? "wwc:border-primary wwc:bg-accent" : "wwc:border-border wwc:hover:bg-accent/50",
							)}
						>
							{/* Heading row: unviewed dot · type · rolled-up count · status — timestamp trails right. */}
							<div className="wwc:flex wwc:items-start wwc:gap-2">
								{!o.viewed && (
									<span
										aria-label="Unviewed"
										className="wwc:mt-1.5 wwc:h-2 wwc:w-2 wwc:shrink-0 wwc:rounded-full wwc:bg-primary"
									/>
								)}
								<span className="wwc:text-sm wwc:font-semibold wwc:text-foreground">{o.title}</span>
								{o.groupCount !== undefined && (
									<button
										type="button"
										onClick={(e) => {
											// Stop the card's own selection so "+N" only opens the group dialog.
											e.stopPropagation();
											setGroupedForId(o.id);
										}}
										className="wwc:transition-opacity wwc:hover:opacity-80"
									>
										<Badge variant="outline" className="wwc:gap-1 wwc:px-1.5 wwc:py-0 wwc:text-[11px] wwc:font-medium">
											<Layers className="wwc:h-3 wwc:w-3" />+{o.groupCount}
										</Badge>
									</button>
								)}
								{/* One neutral tone for every status — inside the card, color is reserved for severity. */}
								<Badge variant="neutralSoft" className="wwc:px-1.5 wwc:py-0 wwc:text-[11px]">
									{STATUS_LABEL[o.status]}
								</Badge>
								{o.falsePositive && (
									<Badge variant="dangerSoft" className="wwc:px-1.5 wwc:py-0 wwc:text-[11px]">
										False Positive
									</Badge>
								)}
								<span className="wwc:ml-auto wwc:shrink-0 wwc:text-xs wwc:text-muted-foreground">{o.updatedAt}</span>
							</div>

							<p className="wwc:text-xs wwc:text-muted-foreground">{o.description}</p>

							{/* Footer: provenance left, severity badge right — replaces the icon-only severity marker. */}
							<div className="wwc:flex wwc:items-center wwc:gap-3">
								<span className="wwc:text-xs wwc:text-muted-foreground">
									Source: <span className="wwc:text-foreground">{o.source}</span>
								</span>
								<span className="wwc:text-xs wwc:text-muted-foreground">
									Company:{" "}
									<span className={o.company ? "wwc:text-foreground" : "wwc:text-muted-foreground/60"}>
										{o.company ?? "Not Determined"}
									</span>
								</span>
								<Badge
									variant={severityVariant(o.severity)}
									className="wwc:ml-auto wwc:px-1.5 wwc:py-0 wwc:text-[11px]"
								>
									{o.severity}
								</Badge>
							</div>

							{/* Responsibility line: who an open alert is assigned to, or who closed it. Pending has neither. */}
							{o.status === "open" && (
								<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs wwc:text-muted-foreground">
									{o.assignedTo ? (
										<>
											<UserCheck className="wwc:h-3 wwc:w-3 wwc:shrink-0" />
											Assigned to <span className="wwc:font-medium wwc:text-foreground">{o.assignedTo}</span>
										</>
									) : (
										<>
											<UserPlus className="wwc:h-3 wwc:w-3 wwc:shrink-0" />
											<span className="wwc:italic wwc:text-muted-foreground/70">Not assigned yet</span>
										</>
									)}
								</div>
							)}
							{o.status === "closed" && (
								<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs wwc:text-muted-foreground">
									<CheckCircle2 className="wwc:h-3 wwc:w-3 wwc:shrink-0" />
									{o.closedBy ? (
										<>
											Closed by <span className="wwc:font-medium wwc:text-foreground">{o.closedBy}</span>
										</>
									) : (
										<span className="wwc:italic wwc:text-muted-foreground/70">Dismissed — no responder</span>
									)}
								</div>
							)}
						</Card>
					);
				}}
				filters={filters}
				activeFilterId={filterId}
				onActiveFilterChange={setFilterId}
				openItemIds={openIds}
				activeItemId={activeId}
				onActiveItemChange={selectItem}
				onItemOpen={(id) => setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
				onItemClose={(id) => {
					setOpenIds((prev) => {
						const next = prev.filter((x) => x !== id);
						// Closing the open tab activates the first remaining one; empty clears the selection.
						if (activeId === id) setActiveId(next[0]);
						return next;
					});
				}}
				onReorder={setOpenIds}
				renderItemBody={(item) => {
					const o = byId.get(item.id);
					if (!o) return null;
					// Download Summary is Connected Worker-only, matching the observation manager.
					const showSummary = o.source === "ConnectedWorker";
					return (
						<div className="wwc:space-y-3 wwc:border-b wwc:p-6">
							<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
								<h2 className="wwc:text-base wwc:font-semibold">{o.title}</h2>
								<Badge variant={statusVariant(o.status)}>{STATUS_LABEL[o.status]}</Badge>
								{o.falsePositive && <Badge variant="dangerSoft">False Positive</Badge>}
								{/* Header utilities: copy link, share, and (Connected Worker) download summary. */}
								<div className="wwc:ml-auto wwc:flex wwc:items-center wwc:gap-1">
									<Button variant="ghost" icon aria-label="Copy link" tooltip="Copy Link" className="wwc:h-7 wwc:w-7">
										<Copy className="wwc:h-4 wwc:w-4" />
									</Button>
									<Button variant="ghost" icon aria-label="Share" tooltip="Share" className="wwc:h-7 wwc:w-7">
										<Share2 className="wwc:h-4 wwc:w-4" />
									</Button>
									{showSummary && (
										<Button
											variant="ghost"
											icon
											aria-label="Download summary"
											tooltip="Download Summary"
											className="wwc:h-7 wwc:w-7"
										>
											<FileDown className="wwc:h-4 wwc:w-4" />
										</Button>
									)}
								</div>
							</div>
							<p className="wwc:text-sm wwc:text-muted-foreground">{o.description}</p>
							{/* Grouped +N and Location open the same dialogs as the list, from inside the detail. */}
							<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
								{o.groupCount !== undefined && (
									<Button variant="outline" size="sm" onClick={() => setGroupedForId(o.id)}>
										<Layers className="wwc:h-4 wwc:w-4" />
										Grouped +{o.groupCount}
									</Button>
								)}
								<Button variant="outline" size="sm" onClick={() => setLocationForId(o.id)}>
									<MapPin className="wwc:h-4 wwc:w-4" />
									Location Details
								</Button>
							</div>
							<p className="wwc:text-sm">Observation details, photos, location, and corrective actions render here.</p>
						</div>
					);
				}}
				comments={activeId !== undefined ? (commentsByItem[activeId] ?? []) : []}
				commentValue={comment}
				onCommentValueChange={setComment}
				commentPlaceholder="Add a comment..."
				commentFlagged={commentFlagged}
				onCommentFlaggedChange={setCommentFlagged}
				commentDate={commentDate}
				onCommentDateChange={setCommentDate}
				onCommentSubmit={(item, submission) => {
					const next: CommentItem = {
						id: `c-${item.id}-${commentsByItem[item.id]?.length ?? 0}`,
						author: {name: "You", initials: "Y"},
						timestamp: "just now",
						body: submission.text,
						badges: submission.flagged
							? [{id: "flag", icon: <Flag className="wwc:h-3 wwc:w-3" />, label: "Flagged", tone: "warning"}]
							: [],
					};
					setCommentsByItem((prev) => ({...prev, [item.id]: [next, ...(prev[item.id] ?? [])]}));
					setComment("");
					setCommentFlagged(false);
					setCommentDate(undefined);
				}}
				actionPanelTitle={active?.title}
				actionPanelDescription={active?.description}
				renderActionDetails={(item) => {
					const o = byId.get(item.id);
					if (!o) return null;
					return (
						<div>
							<DetailRow label="Source" value={o.source} />
							<DetailRow label="Company" value={o.company ?? "Not Determined"} />
							<DetailRow
								label="Status"
								value={<Badge variant={statusVariant(o.status)}>{STATUS_LABEL[o.status]}</Badge>}
							/>
							<DetailRow label="Severity" value={<Badge variant={severityVariant(o.severity)}>{o.severity}</Badge>} />
							{o.status === "open" && (
								<DetailRow
									label="Assigned to"
									value={
										o.assignedTo ?? (
											<span className="wwc:italic wwc:font-normal wwc:text-muted-foreground/70">Not assigned yet</span>
										)
									}
								/>
							)}
							{o.status === "closed" && (
								<DetailRow
									label="Closed by"
									value={
										o.closedBy ?? (
											<span className="wwc:italic wwc:font-normal wwc:text-muted-foreground/70">
												Dismissed — no responder
											</span>
										)
									}
								/>
							)}
							<DetailRow label="Updated" value={o.updatedAt} />
						</div>
					);
				}}
				primaryAction={
					active
						? (() => {
								const key = lifecycleActionsFor(active).primary;
								const meta = LIFECYCLE_META[key];
								return {id: key, label: meta.label, icon: meta.icon, onSelect: () => startAction(key, active)};
							})()
						: undefined
				}
				secondaryActions={
					active
						? lifecycleActionsFor(active).secondary.map((key) => {
								const meta = LIFECYCLE_META[key];
								return {
									id: key,
									label: meta.label,
									icon: meta.icon,
									tone: meta.tone,
									onSelect: () => startAction(key, active),
								};
							})
						: undefined
				}
			/>

			<ObservationActionDialog
				observation={actionTarget}
				actionKey={actionKey}
				form={actionForm}
				onFormChange={(patch) => setActionForm((prev) => ({...prev, ...patch}))}
				onConfirm={confirmAction}
				onCancel={closeAction}
			/>
			<GroupedObservationsDialog observation={groupedTarget} onClose={() => setGroupedForId(undefined)} />
			<LocationDialog observation={locationTarget} onClose={() => setLocationForId(undefined)} />
		</>
	);
}

// ─── Verify Response ─────────────────────────────────────────────────────────

// The platforms an acknowledgment can arrive from, in the fixed column order the panel renders.
type ResponderPlatform = "Web" | "Android" | "iOS" | "Huawei" | "Unknown";

const RESPONDER_PLATFORMS: ResponderPlatform[] = ["Web", "Android", "iOS", "Huawei", "Unknown"];

// A responder is a person who receives and acknowledges observation alerts. The list columns cover
// the first block of fields; the rest back the slide-over detail panel so every row opens a coherent
// view. Sample data only, like the rest of the template.
type Responder = {
	id: string;
	name: string;
	initials: string;
	role: string;
	/** Job trade/title shown as its own list column (e.g. "INDIRECT-HSE SUPERVISOR"). */
	trade: string;
	createdAt: string;
	alertsSent: number;
	alertsAcked: number;
	alertsClosed: number;
	avgResponse: string;
	timeOnSite: string;
	online: boolean;
	enrolledSince: string;
	// ── Detail-panel fields ──
	acknowledgmentRate: string;
	platformAcks: Record<ResponderPlatform, number>;
	channel: string;
	mobileNumber: string;
	companies: string[];
	/** "+N more" companies beyond the chips shown inline. */
	companyOverflow: number;
	zones: string;
	packages: string;
	observationSources: string[];
	timeInAssignedZone: string;
};

const RESPONDERS: Responder[] = [
	{
		id: "r-1",
		name: "Miguel",
		initials: "MI",
		role: "Safety Officer",
		trade: "INDIRECT-CONSTRUCTION MANAGER",
		createdAt: "14 Jul 2026",
		alertsSent: 78,
		alertsAcked: 0,
		alertsClosed: 0,
		avgResponse: "-",
		timeOnSite: "-",
		online: true,
		enrolledSince: "14 Jul 2026",
		acknowledgmentRate: "0%",
		platformAcks: {Web: 0, Android: 0, iOS: 0, Huawei: 0, Unknown: 0},
		channel: "Mobile",
		mobileNumber: "-",
		companies: ["TR", "TR-ACTAVO", "TR-ACTRON", "TR-AFIC"],
		companyOverflow: 12,
		zones: "All",
		packages: "NGL Fractionation Trains & Utilities",
		observationSources: ["ConnectedWorker", "WeatherStation"],
		timeInAssignedZone: "-",
	},
	{
		id: "r-2",
		name: "Mohammad Junaid Raza",
		initials: "MR",
		role: "Field Supervisor",
		trade: "INDIRECT-HSE SUPERVISOR",
		createdAt: "13 May 2026",
		alertsSent: 4,
		alertsAcked: 0,
		alertsClosed: 0,
		avgResponse: "-",
		timeOnSite: "07:50:00",
		online: true,
		enrolledSince: "13 May 2026",
		acknowledgmentRate: "0%",
		platformAcks: {Web: 0, Android: 0, iOS: 0, Huawei: 0, Unknown: 0},
		channel: "Mobile",
		mobileNumber: "-",
		companies: ["TR", "TR-ACTAVO"],
		companyOverflow: 6,
		zones: "TR-PKG2/886-CCB 001, TR-PKG2/886-CCB 002",
		packages: "Storage & Export/Facilities",
		observationSources: ["ConnectedWorker"],
		timeInAssignedZone: "07:50:00",
	},
	{
		id: "r-3",
		name: "Abhilash Sadanandan",
		initials: "AS",
		role: "HSE Engineer",
		trade: "INDIRECT-HSE OFFICER",
		createdAt: "13 May 2026",
		alertsSent: 0,
		alertsAcked: 0,
		alertsClosed: 0,
		avgResponse: "-",
		timeOnSite: "-",
		online: false,
		enrolledSince: "13 May 2026",
		acknowledgmentRate: "0%",
		platformAcks: {Web: 0, Android: 0, iOS: 0, Huawei: 0, Unknown: 0},
		channel: "Mobile",
		mobileNumber: "-",
		companies: ["TR"],
		companyOverflow: 0,
		zones: "TR-PKG2/889-Steam System(21)",
		packages: "NGL Fractionation Trains & Utilities",
		observationSources: ["ConnectedWorker"],
		timeInAssignedZone: "-",
	},
	{
		id: "r-4",
		name: "Muhammad Aqeel",
		initials: "MA",
		role: "Safety Officer",
		trade: "INDIRECT-HSE SUPERVISOR",
		createdAt: "13 May 2026",
		alertsSent: 3,
		alertsAcked: 0,
		alertsClosed: 0,
		avgResponse: "-",
		timeOnSite: "07:20:00",
		online: true,
		enrolledSince: "13 May 2026",
		acknowledgmentRate: "0%",
		platformAcks: {Web: 0, Android: 0, iOS: 0, Huawei: 0, Unknown: 0},
		channel: "Mobile",
		mobileNumber: "-",
		companies: ["TR", "TR-ACTAVO", "TR-ACTRON"],
		companyOverflow: 9,
		zones: "TR-PKG2/887-OME 005, TR-PKG2/887-OME 006",
		packages: "NGL Fractionation Trains & Utilities Storage & Export/Facilities",
		observationSources: ["ConnectedWorker", "WeatherStation"],
		timeInAssignedZone: "07:20:00",
	},
	{
		// The exemplar the reference screenshots show — its detail must match exactly.
		id: "r-5",
		name: "Melandro Dalisay Mapili",
		initials: "MM",
		role: "Indirect-Environmental Coordinator",
		trade: "Indirect-Environmental Coordinator",
		createdAt: "12 May 2026",
		alertsSent: 19,
		alertsAcked: 0,
		alertsClosed: 0,
		avgResponse: "-",
		timeOnSite: "07:03:00",
		online: true,
		enrolledSince: "12 May 2026",
		acknowledgmentRate: "0%",
		platformAcks: {Web: 0, Android: 0, iOS: 0, Huawei: 0, Unknown: 0},
		channel: "Mobile",
		mobileNumber: "-",
		companies: ["TR", "TR-ACTAVO", "TR-ACTRON", "TR-AFIC", "TR-AIC"],
		companyOverflow: 28,
		zones: "All",
		packages: "NGL Fractionation Trains & Utilities Storage & Export/Facilities",
		observationSources: ["ConnectedWorker", "WeatherStation"],
		timeInAssignedZone: "07:03:00",
	},
	{
		id: "r-6",
		name: "Roberto Cruz Tuazon",
		initials: "RT",
		role: "Field Supervisor",
		trade: "INDIRECT-HSE SUPERVISOR",
		createdAt: "12 May 2026",
		alertsSent: 0,
		alertsAcked: 0,
		alertsClosed: 0,
		avgResponse: "-",
		timeOnSite: "-",
		online: false,
		enrolledSince: "12 May 2026",
		acknowledgmentRate: "0%",
		platformAcks: {Web: 0, Android: 0, iOS: 0, Huawei: 0, Unknown: 0},
		channel: "Mobile",
		mobileNumber: "-",
		companies: ["TR", "TR-ACTAVO"],
		companyOverflow: 4,
		zones: "TR-PKG2/895-Spent Caustic(33)",
		packages: "Storage & Export/Facilities",
		observationSources: ["ConnectedWorker"],
		timeInAssignedZone: "-",
	},
	{
		id: "r-7",
		name: "Ahsan Nadeem",
		initials: "AN",
		role: "HSE Engineer",
		trade: "INDIRECT-HSE SUPERVISOR",
		createdAt: "12 May 2026",
		alertsSent: 0,
		alertsAcked: 0,
		alertsClosed: 0,
		avgResponse: "-",
		timeOnSite: "-",
		online: false,
		enrolledSince: "12 May 2026",
		acknowledgmentRate: "0%",
		platformAcks: {Web: 0, Android: 0, iOS: 0, Huawei: 0, Unknown: 0},
		channel: "Mobile",
		mobileNumber: "-",
		companies: ["TR"],
		companyOverflow: 0,
		zones: "TR-PKG2/895-Spent Caustic(33)",
		packages: "NGL Fractionation Trains & Utilities",
		observationSources: ["ConnectedWorker"],
		timeInAssignedZone: "-",
	},
];

// The KPI band above the responder table. Five tiles, forced onto one row via a grid-cols-5 override
// on the KPISummary (it maxes at 4 columns natively).
const RESPONDER_KPIS: KpiMetric[] = [
	{title: "No. of Responders", value: 74, icon: ShieldCheck},
	{title: "Active Responders", value: 8, icon: ShieldCheck},
	{title: "Workers:Responders", value: "43113:74", icon: Clock},
	{title: "Average Response Time", value: "38.43", unit: "m", icon: Clock},
	{title: "Unsupervised Zones", value: 0, icon: Box},
];

// The Responder / Controller switcher at the top of the view.
type VerifyResponderTab = "responder" | "controller";

// The detail-panel range toggle — display-only (Trend/Funnel tabs are placeholders).
const RESPONDER_RANGES: ViewTabItem<string>[] = [
	{id: "today", label: "Today"},
	{id: "7d", label: "7 days"},
	{id: "30d", label: "30 days"},
	{id: "all", label: "All"},
];

/** A responder's presence dot — green when online, muted otherwise — overlaid on the avatar. */
function PresenceDot({online}: {online: boolean}) {
	return (
		<span
			aria-hidden
			className={cn(
				"wwc:absolute wwc:-bottom-0.5 wwc:-right-0.5 wwc:h-2.5 wwc:w-2.5 wwc:rounded-full wwc:border-2 wwc:border-card",
				online ? "wwc:bg-green-500" : "wwc:bg-muted-foreground",
			)}
		/>
	);
}

/** A plain bordered stat tile — a big value over a small muted label, no icon. The flat look the
 * responder detail panel uses for its performance and platform breakdowns. */
function StatTile({value, label}: {value: React.ReactNode; label: string}) {
	return (
		<div className="wwc:rounded-lg wwc:border wwc:p-3">
			<div className="wwc:text-2xl wwc:font-bold wwc:text-foreground">{value}</div>
			<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">{label}</p>
		</div>
	);
}

/** The performance range toggle. Uses Tabs so the active segment is a true white pill (bg-card +
 * ring + surface shadow) — the look the profile drawer expects, unlike ViewTabBar's segmented variant. */
function ResponderRangeToggle({range, onChange}: {range: string; onChange: (value: string) => void}) {
	return (
		<Tabs value={range} onValueChange={onChange}>
			<TabsList>
				{RESPONDER_RANGES.map((option) => (
					<TabsTrigger key={option.id} value={option.id}>
						{option.label}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}

/** Platform acknowledgments as ONE bordered container with vertical dividers between cells (no gaps). */
function PlatformBreakdown({acks}: {acks: Record<ResponderPlatform, number>}) {
	return (
		<div className="wwc:grid wwc:grid-cols-5 wwc:divide-x wwc:divide-border wwc:overflow-hidden wwc:rounded-lg wwc:border">
			{RESPONDER_PLATFORMS.map((platform) => (
				<div key={platform} className="wwc:p-3">
					<div className="wwc:text-2xl wwc:font-bold wwc:text-foreground">{acks[platform]}</div>
					<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">{platform}</p>
				</div>
			))}
		</div>
	);
}

/** A flat label: value row, matching the profile drawer's field-list style. */
function ProfileFieldRow({label, value}: {label: string; value: React.ReactNode}) {
	return (
		<div className="wwc:flex wwc:justify-between wwc:gap-3 wwc:text-sm">
			<span className="wwc:shrink-0 wwc:text-muted-foreground">{label}:</span>
			<span className="wwc:text-right wwc:font-medium">{value}</span>
		</div>
	);
}

// A factory (not a module const) because the Name cell and the row action both need the view's
// open-panel callback, and DataTable exposes no row-click API.
function responderColumns(onOpen: (responder: Responder) => void): ColumnDef<Responder>[] {
	return [
		{
			accessorKey: "name",
			header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
			cell: ({row}) => {
				const r = row.original;
				return (
					<button
						type="button"
						onClick={() => onOpen(r)}
						className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-left wwc:transition-colors wwc:hover:text-primary"
					>
						<span className="wwc:relative wwc:shrink-0">
							<Avatar className="wwc:h-8 wwc:w-8">
								<AvatarFallback className="wwc:text-xs">{r.initials}</AvatarFallback>
							</Avatar>
							<PresenceDot online={r.online} />
						</span>
						<span className="wwc:font-medium">{r.name}</span>
					</button>
				);
			},
		},
		{accessorKey: "createdAt", header: ({column}) => <DataTableColumnHeader column={column} title="Created At" />},
		{accessorKey: "alertsSent", header: ({column}) => <DataTableColumnHeader column={column} title="Alerts Sent" />},
		{
			accessorKey: "alertsAcked",
			header: ({column}) => <DataTableColumnHeader column={column} title="Alerts Acknowledged" />,
		},
		{
			accessorKey: "alertsClosed",
			header: ({column}) => <DataTableColumnHeader column={column} title="Alerts Closed" />,
		},
		{
			accessorKey: "avgResponse",
			header: ({column}) => <DataTableColumnHeader column={column} title="Average Response Time" />,
		},
		{accessorKey: "timeOnSite", header: ({column}) => <DataTableColumnHeader column={column} title="Time on Site" />},
		{
			accessorKey: "timeInAssignedZone",
			header: ({column}) => <DataTableColumnHeader column={column} title="Time in Assigned Zone" />,
		},
		{
			accessorKey: "zones",
			header: ({column}) => <DataTableColumnHeader column={column} title="Zones" />,
			cell: ({row}) => (
				<span className="wwc:block wwc:max-w-[200px] wwc:truncate" title={row.original.zones}>
					{row.original.zones}
				</span>
			),
		},
		{
			accessorKey: "packages",
			header: ({column}) => <DataTableColumnHeader column={column} title="Package" />,
			cell: ({row}) => (
				<span className="wwc:block wwc:max-w-[220px] wwc:truncate" title={row.original.packages}>
					{row.original.packages}
				</span>
			),
		},
		{
			accessorKey: "companies",
			enableSorting: false,
			header: ({column}) => <DataTableColumnHeader column={column} title="Company" />,
			// First two companies as chips, then a "+N" badge for the overflow — mirrors the detail panel.
			cell: ({row}) => {
				const r = row.original;
				return (
					<div className="wwc:flex wwc:items-center wwc:gap-1">
						{r.companies.slice(0, 2).map((company) => (
							<Badge key={company} variant="neutralSoft" className="wwc:px-1.5 wwc:py-0 wwc:text-[11px]">
								{company}
							</Badge>
						))}
						{r.companyOverflow > 0 && (
							<Badge variant="outline" className="wwc:px-1.5 wwc:py-0 wwc:text-[11px]">
								+{r.companyOverflow}
							</Badge>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "trade",
			header: ({column}) => <DataTableColumnHeader column={column} title="Trade" />,
			cell: ({row}) => (
				<span className="wwc:block wwc:max-w-[200px] wwc:truncate" title={row.original.trade}>
					{row.original.trade}
				</span>
			),
		},
		{
			id: "actions",
			enableSorting: false,
			enableHiding: false,
			meta: {cellClassName: "wwc:w-px wwc:whitespace-nowrap wwc:text-right"},
			cell: ({row}) => (
				<DataTableRowActions
					actions={[
						{
							label: "View",
							icon: <SquarePen className="wwc:h-4 wwc:w-4" />,
							onSelect: () => onOpen(row.original),
						},
					]}
				/>
			),
		},
	];
}

// ─── Controllers (Controller sub-tab) ────────────────────────────────────────

// A controller oversees the response operation. The Controller tab is an enrolment roster — scope
// (zones / package / company) and trade — rather than the responder tab's live-metric table.
type Controller = {
	id: string;
	name: string;
	initials: string;
	online: boolean;
	createdAt: string;
	type: string;
	zones: string;
	packages: string;
	companies: string[];
	/** "+N" companies beyond the chips shown inline. */
	companyOverflow: number;
	trade: string;
};

const CONTROLLERS: Controller[] = [
	{
		id: "ctrl-1",
		name: "Rehan Qadar",
		initials: "RQ",
		online: true,
		createdAt: "05 May 2026",
		type: "Controller",
		zones: "All",
		packages: "All",
		companies: ["All"],
		companyOverflow: 0,
		trade: "Default resource pool trade",
	},
	{
		id: "ctrl-2",
		name: "khalid",
		initials: "KH",
		online: true,
		createdAt: "16 Jul 2025",
		type: "Controller",
		zones: "All",
		packages: "NGL Fractionation Trains & Utilities Storage & Export/Facilities",
		companies: ["TR", "TR-AFIC"],
		companyOverflow: 13,
		trade: "-",
	},
	{
		id: "ctrl-3",
		name: "Hamad",
		initials: "HA",
		online: true,
		createdAt: "16 Jul 2025",
		type: "Controller",
		zones: "All",
		packages: "NGL Fractionation Trains & Utilities Storage & Export/Facilities",
		companies: ["TR", "TR-AFIC"],
		companyOverflow: 13,
		trade: "INDIRECT-HSE ADMIN",
	},
	{
		id: "ctrl-4",
		name: "Haya abdulaziz",
		initials: "HA",
		online: false,
		createdAt: "16 Jul 2025",
		type: "Controller",
		zones: "All",
		packages: "All",
		companies: ["All"],
		companyOverflow: 0,
		trade: "Default resource pool trade",
	},
	{
		id: "ctrl-5",
		name: "Ameerali",
		initials: "AM",
		online: true,
		createdAt: "16 Jul 2025",
		type: "Controller",
		zones: "All",
		packages: "Industrial Support Facilities",
		companies: ["SH-FAC", "Sinohydr-Al Quadri"],
		companyOverflow: 1,
		trade: "SCC OPERATOR",
	},
	{
		id: "ctrl-6",
		name: "Abdulaziz",
		initials: "AB",
		online: false,
		createdAt: "02 Jul 2025",
		type: "Controller",
		zones: "All",
		packages: "All",
		companies: ["All"],
		companyOverflow: 0,
		trade: "-",
	},
];

// Scope-all controllers show a plain "All"; scoped ones show company chips + a "+N" overflow badge.
function CompanyScopeCell({companies, companyOverflow}: {companies: string[]; companyOverflow: number}) {
	if (companyOverflow === 0 && companies.length === 1 && companies[0] === "All") {
		return <span className="wwc:text-muted-foreground">All</span>;
	}
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-1">
			{companies.slice(0, 2).map((company) => (
				<Badge key={company} variant="neutralSoft" className="wwc:px-1.5 wwc:py-0 wwc:text-[11px]">
					{company}
				</Badge>
			))}
			{companyOverflow > 0 && (
				<Badge variant="outline" className="wwc:px-1.5 wwc:py-0 wwc:text-[11px]">
					+{companyOverflow}
				</Badge>
			)}
		</div>
	);
}

const CONTROLLER_COLUMNS: ColumnDef<Controller>[] = [
	{
		accessorKey: "name",
		header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
		cell: ({row}) => {
			const c = row.original;
			return (
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<span className="wwc:relative wwc:shrink-0">
						<Avatar className="wwc:h-8 wwc:w-8">
							<AvatarFallback className="wwc:text-xs">{c.initials}</AvatarFallback>
						</Avatar>
						<PresenceDot online={c.online} />
					</span>
					<span className="wwc:font-medium">{c.name}</span>
				</div>
			);
		},
	},
	{accessorKey: "createdAt", header: ({column}) => <DataTableColumnHeader column={column} title="Created At" />},
	{accessorKey: "type", header: ({column}) => <DataTableColumnHeader column={column} title="Type" />},
	{
		accessorKey: "zones",
		header: ({column}) => <DataTableColumnHeader column={column} title="Zones" />,
		cell: ({row}) => (
			<span className="wwc:block wwc:max-w-[200px] wwc:truncate" title={row.original.zones}>
				{row.original.zones}
			</span>
		),
	},
	{
		accessorKey: "packages",
		header: ({column}) => <DataTableColumnHeader column={column} title="Package" />,
		cell: ({row}) => (
			<span className="wwc:block wwc:max-w-[300px] wwc:truncate" title={row.original.packages}>
				{row.original.packages}
			</span>
		),
	},
	{
		accessorKey: "companies",
		enableSorting: false,
		header: ({column}) => <DataTableColumnHeader column={column} title="Company" />,
		cell: ({row}) => (
			<CompanyScopeCell companies={row.original.companies} companyOverflow={row.original.companyOverflow} />
		),
	},
	{
		accessorKey: "trade",
		header: ({column}) => <DataTableColumnHeader column={column} title="Trade" />,
		cell: ({row}) => (
			<span className="wwc:block wwc:max-w-[220px] wwc:truncate" title={row.original.trade}>
				{row.original.trade}
			</span>
		),
	},
	{
		id: "actions",
		enableSorting: false,
		enableHiding: false,
		meta: {cellClassName: "wwc:w-px wwc:whitespace-nowrap wwc:text-right"},
		cell: () => (
			<DataTableRowActions
				actions={[{label: "Edit", icon: <SquarePen className="wwc:h-4 wwc:w-4" />, onSelect: () => undefined}]}
			/>
		),
	},
];

/**
 * The responder detail as a PushPanel body — a ProfileViewPattern drawer: the name lives in the panel
 * header (avatar · title · actions · close), then an icon-tabbed body of field-list sections. Pushes the
 * Verify Response content aside rather than overlaying it.
 */
function ResponderProfilePanel({responder}: {responder: Responder}) {
	const [detailTab, setDetailTab] = useState("overview");
	const [range, setRange] = useState("today");

	return (
		<>
			<PushPanelHeader>
				<PushPanelHeaderTitle>
					<span className="wwc:relative wwc:shrink-0">
						<Avatar className="wwc:h-7 wwc:w-7">
							<AvatarFallback className="wwc:text-xs">{responder.initials}</AvatarFallback>
						</Avatar>
						<PresenceDot online={responder.online} />
					</span>
					<PushPanelTitle>{responder.name}</PushPanelTitle>
				</PushPanelHeaderTitle>
				<PushPanelHeaderActions>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" icon className="wwc:h-6 wwc:w-6" aria-label="More">
								<MoreHorizontal className="wwc:h-4 wwc:w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" side="bottom">
							<DropdownMenuItem>
								<SquarePen className="wwc:mr-2 wwc:h-4 wwc:w-4" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Download className="wwc:mr-2 wwc:h-4 wwc:w-4" />
								Export
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="wwc:text-destructive wwc:focus:text-destructive">
								<Trash2 className="wwc:mr-2 wwc:h-4 wwc:w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<PushPanelClose asChild>
						<Button variant="ghost" icon className="wwc:h-6 wwc:w-6" aria-label="Close">
							<X className="wwc:h-4 wwc:w-4" />
						</Button>
					</PushPanelClose>
				</PushPanelHeaderActions>
			</PushPanelHeader>

			<Tabs
				value={detailTab}
				onValueChange={setDetailTab}
				className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-hidden"
			>
				<div className="wwc:shrink-0 wwc:px-4 wwc:py-2">
					<TabsList>
						<HoverTooltip content="Overview">
							<TabsTrigger value="overview" aria-label="Overview">
								<Gauge className="wwc:h-4 wwc:w-4" />
							</TabsTrigger>
						</HoverTooltip>
						<HoverTooltip content="Trend">
							<TabsTrigger value="trend" aria-label="Trend">
								<TrendingUp className="wwc:h-4 wwc:w-4" />
							</TabsTrigger>
						</HoverTooltip>
						<HoverTooltip content="Funnel">
							<TabsTrigger value="funnel" aria-label="Funnel">
								<FunnelIcon className="wwc:h-4 wwc:w-4" />
							</TabsTrigger>
						</HoverTooltip>
					</TabsList>
				</div>

				<TabsContent value="overview" className="wwc:m-0 wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:p-4">
					<div className="wwc:space-y-4">
						{/* Identity — role, presence and enrolment sit in the body; the header holds only the name. */}
						<div className="wwc:space-y-1">
							<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
								<span className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-sm wwc:font-medium">
									<span
										className={cn(
											"wwc:h-2 wwc:w-2 wwc:rounded-full",
											responder.online ? "wwc:bg-green-500" : "wwc:bg-muted-foreground",
										)}
									/>
									{responder.online ? "Online" : "Offline"}
								</span>
								<Badge variant="infoSoft">Responder</Badge>
							</div>
							<p className="wwc:text-xs wwc:text-muted-foreground">
								{responder.role} · Enrolled since {responder.enrolledSince}
							</p>
						</div>

						<Separator />

						<section className="wwc:space-y-3">
							<h4 className="wwc:text-sm wwc:font-medium">Response performance</h4>
							<ResponderRangeToggle range={range} onChange={setRange} />
							<div className="wwc:grid wwc:grid-cols-2 wwc:gap-3">
								<StatTile value={responder.alertsSent} label="Alerts sent" />
								<StatTile value={responder.alertsAcked} label="Alerts acknowledged" />
								<StatTile value={responder.acknowledgmentRate} label="Acknowledgment rate" />
								<StatTile value={responder.avgResponse} label="Avg response time" />
							</div>
						</section>

						<Separator />

						<section className="wwc:space-y-3">
							<h4 className="wwc:text-sm wwc:font-medium">Acknowledgments by platform</h4>
							<PlatformBreakdown acks={responder.platformAcks} />
						</section>

						<Separator />

						<section className="wwc:space-y-2.5">
							<h4 className="wwc:text-sm wwc:font-medium">Channels &amp; delivery</h4>
							<ProfileFieldRow label="Channels" value={responder.channel} />
							<ProfileFieldRow label="Mobile number" value={responder.mobileNumber} />
						</section>

						<Separator />

						<section className="wwc:space-y-3">
							<h4 className="wwc:text-sm wwc:font-medium">Enrollment filters</h4>
							<div className="wwc:space-y-3">
								<div>
									<p className="wwc:mb-1.5 wwc:text-xs wwc:text-muted-foreground">Companies</p>
									<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
										{responder.companies.map((company) => (
											<Badge key={company} variant="neutralSoft">
												{company}
											</Badge>
										))}
										{responder.companyOverflow > 0 && (
											<Button variant="link" size="sm" className="wwc:h-auto wwc:p-0">
												+{responder.companyOverflow} more
											</Button>
										)}
									</div>
								</div>
								<div>
									<p className="wwc:mb-1.5 wwc:text-xs wwc:text-muted-foreground">Zones</p>
									<Badge variant="neutralSoft">{responder.zones}</Badge>
								</div>
								<div>
									<p className="wwc:mb-1.5 wwc:text-xs wwc:text-muted-foreground">Packages</p>
									<div className="wwc:rounded-md wwc:bg-muted wwc:p-2 wwc:text-sm">{responder.packages}</div>
								</div>
								<div>
									<p className="wwc:mb-1.5 wwc:text-xs wwc:text-muted-foreground">Observation sources</p>
									<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
										{responder.observationSources.map((source) => (
											<Badge key={source} variant="neutralSoft">
												{source}
											</Badge>
										))}
									</div>
								</div>
							</div>
						</section>

						<Separator />

						<section className="wwc:space-y-2.5">
							<h4 className="wwc:text-sm wwc:font-medium">Presence</h4>
							<ProfileFieldRow label="Time on site" value={responder.timeOnSite} />
							<ProfileFieldRow label="Time in assigned zone" value={responder.timeInAssignedZone} />
						</section>
					</div>
				</TabsContent>

				<TabsContent value="trend" className="wwc:m-0 wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:p-4">
					<div className="wwc:flex wwc:min-h-[240px] wwc:items-center wwc:justify-center">
						<Empty
							icon={<BarChart3 className="wwc:h-6 wwc:w-6" />}
							title="Trend"
							description="This view will appear here."
						/>
					</div>
				</TabsContent>

				<TabsContent value="funnel" className="wwc:m-0 wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:p-4">
					<div className="wwc:flex wwc:min-h-[240px] wwc:items-center wwc:justify-center">
						<Empty
							icon={<BarChart3 className="wwc:h-6 wwc:w-6" />}
							title="Funnel"
							description="This view will appear here."
						/>
					</div>
				</TabsContent>
			</Tabs>
		</>
	);
}

// ─── New Responder / Controller dialog ───────────────────────────────────────

type TeamKind = "responder" | "controller";

// The User dropdown shows a different roster per kind — responders vs controllers.
const RESPONDER_USER_OPTIONS: AddObservationOption[] = [
	{value: "abomousa", label: "Abdulrahman mohamed abomousa"},
	{value: "s-qahtani", label: "Saud Al-Qahtani"},
	{value: "b-khan", label: "Bilal Ahmed Khan"},
	{value: "r-kumar", label: "Ramesh Kumar"},
	{value: "j-martinez", label: "Joseph Martinez"},
];

const CONTROLLER_USER_OPTIONS: AddObservationOption[] = [
	{value: "f-otaibi", label: "Fahad Al-Otaibi"},
	{value: "m-rossi", label: "Marco Rossi"},
	{value: "c-wei", label: "Chen Wei"},
	{value: "i-sesay", label: "Ibrahim Sesay"},
	{value: "d-obrien", label: "Daniel O'Brien"},
];

const SOURCE_FILTER_OPTIONS: MultiSelectOption[] = SOURCES.map((source) => ({value: source, label: source}));
const COMPANY_FILTER_OPTIONS: MultiSelectOption[] = COMPANIES.map((company) => ({value: company, label: company}));
const ZONE_FILTER_OPTIONS: MultiSelectOption[] = ZONE_OPTIONS.map((zone) => ({value: zone.value, label: zone.label}));

type ScopeMode = "all" | "filter";
type ScopeState = {mode: ScopeMode; selected: string[]};
type CommChannel = {enabled: boolean; phone: string; sources: ScopeState; company: ScopeState; zones: ScopeState};

const emptyScope = (): ScopeState => ({mode: "all", selected: []});
const emptyChannel = (): CommChannel => ({
	enabled: false,
	phone: "",
	sources: emptyScope(),
	company: emptyScope(),
	zones: emptyScope(),
});

// One "Sources / Company / Zones" scope row: an All/Filter radio plus a multi-select (with removable
// chips) revealed when Filter is chosen. The whole row is disabled until its channel is switched on.
function ScopeRow({
	idPrefix,
	label,
	options,
	state,
	onChange,
	disabled,
}: {
	idPrefix: string;
	label: string;
	options: MultiSelectOption[];
	state: ScopeState;
	onChange: (next: ScopeState) => void;
	disabled: boolean;
}) {
	return (
		<div className={cn("wwc:border-b wwc:py-3 wwc:last:border-b-0", disabled && "wwc:opacity-50")}>
			<div className="wwc:flex wwc:items-center wwc:gap-6">
				<span className="wwc:w-20 wwc:shrink-0 wwc:text-sm wwc:text-muted-foreground">{label}:</span>
				<RadioGroup
					className="wwc:flex wwc:flex-row wwc:gap-5"
					value={state.mode}
					onValueChange={(mode) => onChange({...state, mode: mode as ScopeMode})}
					disabled={disabled}
				>
					<div className="wwc:flex wwc:items-center wwc:gap-1.5">
						<RadioGroupItem value="all" id={`${idPrefix}-all`} />
						<label htmlFor={`${idPrefix}-all`} className="wwc:text-sm">
							All
						</label>
					</div>
					<div className="wwc:flex wwc:items-center wwc:gap-1.5">
						<RadioGroupItem value="filter" id={`${idPrefix}-filter`} />
						<label htmlFor={`${idPrefix}-filter`} className="wwc:text-sm">
							Filter
						</label>
					</div>
				</RadioGroup>
			</div>
			{state.mode === "filter" && (
				<div className="wwc:mt-2 wwc:pl-[6.5rem]">
					<MultiSelect
						options={options}
						value={state.selected}
						onValueChange={(selected) => onChange({...state, selected})}
						disabled={disabled}
						placeholder={`Select ${label.toLowerCase()}…`}
						searchPlaceholder={`Search ${label.toLowerCase()}…`}
					/>
				</div>
			)}
		</div>
	);
}

// One communication-channel card: a switch + label on the left (SMS also gets a phone input when on),
// and the three scope rows on the right — all disabled until the switch is on.
function ChannelCard({
	idPrefix,
	title,
	channel,
	onChange,
	withPhone,
}: {
	idPrefix: string;
	title: string;
	channel: CommChannel;
	onChange: (next: CommChannel) => void;
	withPhone: boolean;
}) {
	const set = (patch: Partial<CommChannel>) => onChange({...channel, ...patch});
	return (
		<div className="wwc:rounded-lg wwc:border wwc:bg-muted/30 wwc:p-4">
			<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:md:flex-row wwc:md:items-start wwc:md:justify-between">
				<div className="wwc:md:w-1/2">
					<div className="wwc:flex wwc:items-center wwc:gap-3">
						<Switch checked={channel.enabled} onCheckedChange={(enabled) => set({enabled})} />
						<MonitorSmartphone className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						<span className="wwc:text-sm wwc:font-semibold">{title}</span>
					</div>
					{withPhone && channel.enabled && (
						<div className="wwc:mt-3 wwc:flex wwc:items-center wwc:gap-2">
							<span className="wwc:flex wwc:h-9 wwc:items-center wwc:gap-1 wwc:rounded-md wwc:border wwc:border-border wwc:bg-background wwc:px-2 wwc:text-muted-foreground">
								<Phone className="wwc:h-4 wwc:w-4" />
							</span>
							<Input
								value={channel.phone}
								onChange={(event) => set({phone: event.target.value})}
								placeholder="+966"
								className="wwc:max-w-[220px]"
							/>
						</div>
					)}
				</div>
				<div className="wwc:md:w-[440px]">
					<ScopeRow
						idPrefix={`${idPrefix}-sources`}
						label="Sources"
						options={SOURCE_FILTER_OPTIONS}
						state={channel.sources}
						onChange={(sources) => set({sources})}
						disabled={!channel.enabled}
					/>
					<ScopeRow
						idPrefix={`${idPrefix}-company`}
						label="Company"
						options={COMPANY_FILTER_OPTIONS}
						state={channel.company}
						onChange={(company) => set({company})}
						disabled={!channel.enabled}
					/>
					<ScopeRow
						idPrefix={`${idPrefix}-zones`}
						label="Zones"
						options={ZONE_FILTER_OPTIONS}
						state={channel.zones}
						onChange={(zones) => set({zones})}
						disabled={!channel.enabled}
					/>
				</div>
			</div>
		</div>
	);
}

/**
 * New Responder / Controller dialog. A kind toggle, a required User select whose roster depends on the
 * kind, and per-channel communication config (In-App / SMS) with All-or-Filter scoping. Mock-only.
 */
function NewResponderDialog({
	open,
	onOpenChange,
	defaultKind,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultKind: TeamKind;
}) {
	const [kind, setKind] = useState<TeamKind>(defaultKind);
	const [user, setUser] = useState("");
	const [inApp, setInApp] = useState<CommChannel>(emptyChannel);
	const [sms, setSms] = useState<CommChannel>(emptyChannel);
	const [showError, setShowError] = useState(false);

	// Reseed on each open so a cancelled entry never bleeds into the next.
	const handleOpenChange = (next: boolean) => {
		if (next) {
			setKind(defaultKind);
			setUser("");
			setInApp(emptyChannel());
			setSms(emptyChannel());
			setShowError(false);
		}
		onOpenChange(next);
	};

	const users = kind === "controller" ? CONTROLLER_USER_OPTIONS : RESPONDER_USER_OPTIONS;

	const handleSave = () => {
		if (user === "") {
			setShowError(true);
			return;
		}
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="wwc:gap-0 wwc:p-0 wwc:sm:max-w-[880px]">
				<DialogHeader>
					<DialogTitle>New {kind === "controller" ? "Controller" : "Responder"}</DialogTitle>
					<DialogDescription className="wwc:sr-only">
						Add a {kind} to the response team and configure their communication channels.
					</DialogDescription>
				</DialogHeader>

				<div className="wwc:flex wwc:max-h-[70vh] wwc:flex-col wwc:gap-4 wwc:overflow-y-auto wwc:px-4 wwc:py-4">
					{/* Kind toggle — Responder / Controller share the UI; only the User roster differs. */}
					<RadioGroup
						className="wwc:flex wwc:flex-row wwc:gap-6"
						value={kind}
						onValueChange={(next) => {
							setKind(next as TeamKind);
							setUser("");
						}}
					>
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<RadioGroupItem value="responder" id="kind-responder" />
							<label htmlFor="kind-responder" className="wwc:text-sm wwc:font-medium">
								Responder
							</label>
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<RadioGroupItem value="controller" id="kind-controller" />
							<label htmlFor="kind-controller" className="wwc:text-sm wwc:font-medium">
								Controller
							</label>
						</div>
					</RadioGroup>

					<div className="wwc:border-t wwc:border-border" />

					<Field>
						<FieldLabel htmlFor="new-user">
							User <span className="wwc:text-destructive">*</span>
						</FieldLabel>
						<SearchableSelect
							options={users}
							value={user}
							onValueChange={setUser}
							placeholder="Select user"
							searchPlaceholder="Search users…"
							emptyMessage="No users found."
						/>
						{showError && user === "" && <FieldError>Select a user.</FieldError>}
					</Field>

					<div className="wwc:border-t wwc:border-border" />

					<div>
						<p className="wwc:mb-3 wwc:text-sm wwc:text-muted-foreground">Communication Channel:</p>
						<div className="wwc:flex wwc:flex-col wwc:gap-3">
							<ChannelCard
								idPrefix="inapp"
								title="In-App Alerts"
								channel={inApp}
								onChange={setInApp}
								withPhone={false}
							/>
							<ChannelCard idPrefix="sms" title="SMS Alerts" channel={sms} onChange={setSms} withPhone />
						</div>
					</div>
				</div>

				<DialogFooter className="wwc:border-t wwc:border-border wwc:px-4 wwc:py-2">
					<Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
					<Button size="sm" onClick={handleSave}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/** Verify Response — Responder / Controller sub-tabs over a KPI band + responder table, with a
 * slide-over detail panel for the selected responder. Mirrors ObservationsListView's structure. */
function VerifyResponseView() {
	const [subTab, setSubTab] = useState<VerifyResponderTab>("responder");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [newOpen, setNewOpen] = useState(false);

	const columns = useMemo(() => responderColumns((responder) => setSelectedId(responder.id)), []);
	const selected = selectedId !== null ? (RESPONDERS.find((responder) => responder.id === selectedId) ?? null) : null;

	return (
		<PushPanelProvider open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)} side="right">
			<PushPanelContainer className="wwc:min-h-0 wwc:flex-1">
				<PushPanelMain className="wwc:h-full wwc:overflow-auto">
					{/* Full-width content, matching the workforce template's main pane (w-full p-6, no max-w cap). */}
					<div className="wwc:w-full wwc:space-y-4 wwc:p-6">
						{/* Header: Responder / Controller tabs with counts on the left — reusing the workforce
				    compliance Mobilized/Demobilized pattern — with a Live badge and New Responder aligned
				    on the same row (no separate title). */}
						<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:justify-between wwc:gap-3">
							<div className="wwc:flex wwc:items-center wwc:gap-3">
								<Tabs value={subTab} onValueChange={(value) => setSubTab(value as VerifyResponderTab)}>
									<TabsList>
										<TabsTrigger value="responder">
											Responder
											<Badge variant="secondary" className="wwc:ml-2 wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
												{RESPONDERS.length}
											</Badge>
										</TabsTrigger>
										<TabsTrigger value="controller">
											Controller
											<Badge variant="secondary" className="wwc:ml-2 wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
												{CONTROLLERS.length}
											</Badge>
										</TabsTrigger>
									</TabsList>
								</Tabs>
								<Badge variant="successSoft">
									<Zap className="wwc:h-3 wwc:w-3" />
									Live
								</Badge>
							</div>
							<Button onClick={() => setNewOpen(true)}>
								<Plus className="wwc:h-4 wwc:w-4" />
								New {subTab === "controller" ? "Controller" : "Responder"}
							</Button>
						</div>

						{subTab === "responder" ? (
							<>
								{/* Five metrics forced onto one row — KPISummary maxes at 4 columns natively. */}
								<KPISummary metrics={RESPONDER_KPIS} className="wwc:lg:grid-cols-5" />
								<DataTable
									columns={columns}
									data={RESPONDERS}
									searchKey="name"
									searchPlaceholder="Search responders…"
									recordLabel="responder"
									pageSize={10}
									onRowActivate={(row) => setSelectedId(row.original.id)}
									getRowAriaLabel={(row) => `Open ${row.original.name}`}
								/>
							</>
						) : (
							<DataTable
								columns={CONTROLLER_COLUMNS}
								data={CONTROLLERS}
								searchKey="name"
								searchPlaceholder="Search controllers…"
								recordLabel="controller"
								pageSize={10}
							/>
						)}
					</div>
				</PushPanelMain>
				<PushPanel width={400}>{selected ? <ResponderProfilePanel responder={selected} /> : null}</PushPanel>
			</PushPanelContainer>
			<NewResponderDialog
				open={newOpen}
				onOpenChange={setNewOpen}
				defaultKind={subTab === "controller" ? "controller" : "responder"}
			/>
		</PushPanelProvider>
	);
}

// ─── Settings › General ──────────────────────────────────────────────────────

type ToggleSetting = {id: string; label: string; description: string; defaultOn: boolean};

const GENERAL_TOGGLES: ToggleSetting[] = [
	{
		id: "sound-notification",
		label: "Sound Notification",
		description: "Configure how you want to be notified about observations",
		defaultOn: false,
	},
	{
		id: "require-company",
		label: "Require company selection",
		description: "Toggle to make company selection mandatory",
		defaultOn: true,
	},
];

type ToggleState = Record<string, boolean>;

const initialToggleState = (): ToggleState =>
	Object.fromEntries(GENERAL_TOGGLES.map((item) => [item.id, item.defaultOn]));

/**
 * Stacked toggle rows plus the shared FormActionBar, shown only while the draft differs from the
 * last saved state. Renders the padded content container and the bar as siblings — FormActionBar
 * owns its own full-bleed background, so it must not sit inside the padded div.
 */
// Playback modes for the pending-observation audio alert.
const SOUND_MODES = [
	{value: "new-only", label: "New observations only"},
	{value: "continuous", label: "Continuous for pending"},
];

function GeneralSettings({title}: {title: string}) {
	const [saved, setSaved] = useState<ToggleState>(initialToggleState);
	const [draft, setDraft] = useState<ToggleState>(initialToggleState);
	const [savedMode, setSavedMode] = useState("new-only");
	const [draftMode, setDraftMode] = useState("new-only");

	const toggleChanges = GENERAL_TOGGLES.filter((item) => draft[item.id] !== saved[item.id]).length;
	// A changed sound mode only counts while Sound Notification is on.
	const modeChanged = draft["sound-notification"] && draftMode !== savedMode ? 1 : 0;
	const changeCount = toggleChanges + modeChanged;

	const commit = () => {
		setSaved(draft);
		setSavedMode(draftMode);
	};
	const discard = () => {
		setDraft(saved);
		setDraftMode(savedMode);
	};

	return (
		<>
			<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1000px] wwc:p-6">
				<h1 className="wwc:text-xl wwc:font-semibold wwc:tracking-tight">{title}</h1>
				<div className="wwc:mt-4 wwc:flex wwc:flex-col wwc:gap-3">
					{GENERAL_TOGGLES.map((item) => (
						<div
							key={item.id}
							className="wwc:flex wwc:items-start wwc:gap-3 wwc:rounded-lg wwc:border wwc:bg-muted/30 wwc:p-4"
						>
							<Switch
								id={item.id}
								checked={draft[item.id]}
								onCheckedChange={(checked) => setDraft((prev) => ({...prev, [item.id]: checked}))}
								className="wwc:mt-0.5"
							/>
							<div className="wwc:min-w-0 wwc:flex-1">
								<label htmlFor={item.id} className="wwc:cursor-pointer wwc:text-sm wwc:font-semibold">
									{item.label}
								</label>
								<p className="wwc:mt-1 wwc:text-sm wwc:text-muted-foreground">{item.description}</p>
								{/* Mode select appears only for Sound Notification, and only while it is on. */}
								{item.id === "sound-notification" && draft["sound-notification"] && (
									<div className="wwc:mt-3 wwc:max-w-xs">
										<Select value={draftMode} onValueChange={setDraftMode}>
											<SelectTrigger aria-label="Sound alert mode">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{SOUND_MODES.map((m) => (
													<SelectItem key={m.value} value={m.value}>
														{m.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{changeCount > 0 && (
				<FormActionBar
					maxWidth="1000px"
					// mt-auto pins the bar to the bottom of the pane; this page's settings content is short
					// enough not to overflow, so sticky alone would leave it floating under the last row.
					className="wwc:mt-auto"
					status={
						<>
							<span className="wwc:font-medium wwc:text-foreground">{changeCount}</span> unsaved change
							{changeCount === 1 ? "" : "s"}
						</>
					}
				>
					<Button variant="ghost" size="sm" onClick={discard}>
						Discard
					</Button>
					<Button size="sm" onClick={commit}>
						<Save className="wwc:h-4 wwc:w-4" />
						Save changes
					</Button>
				</FormActionBar>
			)}
		</>
	);
}

// ─── Settings › Categories ───────────────────────────────────────────────────

type ObservationCategory = {
	id: string;
	name: string;
	description: string;
	/** "System" for seeded categories, otherwise the user who created it. */
	addedBy: string;
};

const SYSTEM_CATEGORY_NAMES = [
	"Barriers, Guardrails & Warning Lines",
	"Bus 40",
	"Bus_40",
	"Bus_40_a",
	"Bus_40_b",
	"Bus 60",
	"Bus_60",
	"Entering Restricted Area",
	"Excavation Safety",
	"Fall Detection",
	"Fall Hazard Prevention",
	"Fire Hazard",
	"General Safety Hazard",
	"General Site Safety",
	"Good Practice",
	"Heavy 40",
	"Heavy_40",
	"Heavy_40_a",
	"Heavy_40_b",
	"Heavy_40_c",
	"Heavy_40_d",
	"Heavy 60",
	"Heavy_60",
	"Housekeeping and Material Storage",
	"Hot Work",
	"Lifting Operations",
	"PPE Non-Compliance",
	"Unfit for Work",
	"Vehicle & Traffic Safety",
	"Working at Height",
];

// A couple of descriptions differ from the name (matching the source data), the rest mirror it.
const CATEGORY_DESCRIPTION_OVERRIDES: Record<string, string> = {
	"Free Fall": "FreeFall",
	"Head Impact": "HeadImpact",
};

const CATEGORIES: ObservationCategory[] = [...SYSTEM_CATEGORY_NAMES, "Free Fall", "Head Impact"]
	.sort((a, b) => a.localeCompare(b))
	.map((name, index) => ({
		id: `cat-${index}`,
		name,
		description: CATEGORY_DESCRIPTION_OVERRIDES[name] ?? name,
		addedBy: "System",
	}));

const CATEGORY_COLUMNS: ColumnDef<ObservationCategory>[] = [
	{
		accessorKey: "name",
		header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
		cell: ({row}) => <span className="wwc:font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "description",
		header: ({column}) => <DataTableColumnHeader column={column} title="Description" />,
		cell: ({row}) => <span className="wwc:text-muted-foreground">{row.original.description}</span>,
	},
	{
		accessorKey: "addedBy",
		header: ({column}) => <DataTableColumnHeader column={column} title="Added By" />,
		cell: ({row}) => <Badge variant="infoSoft">{row.original.addedBy}</Badge>,
	},
];

/** Categories table with an "Add Category" split action in the toolbar. */
function CategoriesSettings() {
	return (
		<DataTable
			columns={CATEGORY_COLUMNS}
			data={CATEGORIES}
			searchKey="name"
			searchPlaceholder="Search categories…"
			showColumnToggle
			recordLabel="category"
			pageSize={10}
			toolbarExtra={
				<Button>
					<Plus className="wwc:h-4 wwc:w-4" />
					Add Category
					<ChevronDown className="wwc:h-4 wwc:w-4" />
				</Button>
			}
		/>
	);
}

/**
 * Safety Manager observation-manager template. Renders its own app shell and a content
 * area that toggles between the route header (tabs + Settings action) and a Settings
 * sub-surface (SideMenu + content); the List View embeds the reusable TaskMonitor.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the CoreSafetyManager template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function SafetyManager() {
	const [mode, setMode] = useState<"default" | "settings">("default");
	const [activeTab, setActiveTab] = useState<SafetyTabId>("analytics");
	const [activeSetting, setActiveSetting] = useState<SettingId>("general");

	const [detailLabel, setDetailLabel] = useState<string | null>(null);
	const activeSettingLabel = settingLabel(activeSetting);

	// Ontology settings render the shared admin views; every other setting keeps its own body.
	const ontologyViewId = ONTOLOGY_SETTING_VIEW_IDS[activeSetting];
	const OntologyView = ontologyViewId ? ONTOLOGY_VIEWS[ontologyViewId] : undefined;
	const placeholder =
		activeTab === "list-view" || activeTab === "map-view" || activeTab === "verify-response"
			? null
			: TAB_PLACEHOLDER[activeTab];

	const breadcrumb =
		mode === "settings"
			? `Safety Manager / Settings / ${activeSettingLabel}${detailLabel ? ` / ${detailLabel}` : ""}`
			: `Safety Manager / ${tabLabel(activeTab)}`;

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:bg-background wwc:text-foreground">
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={SAFETY_GROUPS}
				activeItemId="safety-manager"
				showSearch={false}
				showNotifications={false}
			/>

			<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
				<CoreAppTopBar activeLabel={breadcrumb} showProjectSwitcher={false} showNotifications notificationCount={3} />

				<main className="wwc:relative wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-hidden">
					{mode === "default" ? (
						<>
							<PageContentHeader
								variant="navigation"
								title="Safety Manager"
								tabs={TABS}
								activeTab={activeTab}
								onTabChange={(tab) => setActiveTab(tab as SafetyTabId)}
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

							{activeTab === "list-view" ? (
								<ObservationsListView />
							) : activeTab === "verify-response" ? (
								<VerifyResponseView />
							) : activeTab === "map-view" ? (
								// flex-1 because the view sizes to its parent: here that is what is left of the
								// column under the route header.
								<ObservationsMapView className="wwc:flex-1" />
							) : (
								<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
									<div className="wwc:w-full wwc:p-6">
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
								backLabel="Back to Safety Manager"
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
										<OntologyView scope={SAFETY_ONTOLOGY_SCOPE} onDetailChange={setDetailLabel} />
										{/* SharedPropertiesView fires undoable toasts and needs a host for them. */}
										<Toaster position="top-right" />
									</>
								) : activeSetting === "general" ? (
									<GeneralSettings title={activeSettingLabel} />
								) : (
									<div
										className={cn(
											"wwc:mx-auto wwc:w-full wwc:p-6",
											activeSetting === "categories" ? "wwc:max-w-[1200px]" : "wwc:max-w-[1000px]",
										)}
									>
										<h1 className="wwc:text-xl wwc:font-semibold wwc:tracking-tight">{activeSettingLabel}</h1>
										<div className="wwc:mt-4">
											{activeSetting === "categories" ? (
												<CategoriesSettings />
											) : (
												<div className="wwc:flex wwc:min-h-[320px] wwc:items-center wwc:justify-center">
													<Empty
														icon={<Settings className="wwc:h-6 wwc:w-6" />}
														title={activeSettingLabel}
														description={SETTING_PLACEHOLDER[activeSetting]}
													/>
												</div>
											)}
										</div>
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
