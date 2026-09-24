import type {ColumnDef} from "@tanstack/react-table";

import {cn} from "@corensystem/coren-utils";
import {
	Archive,
	ArchiveRestore,
	ArrowRight,
	Ban,
	Building2,
	ChevronLeft,
	Copy,
	ExternalLink,
	Eye,
	FolderKanban,
	Home,
	MapPin,
	MoreHorizontal,
	Pencil,
	Plus,
	Save,
	Search,
	ShieldCheck,
	Upload,
	UserCheck,
	Users as UsersIcon,
} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../alert-dialog";
import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../card";
import {Checkbox} from "../checkbox";
import {Combobox} from "../combobox";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {DatePicker} from "../date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {Empty} from "../empty";
import {FormActionBar} from "../form-action-bar";
import {Input} from "../input";
import {Label} from "../label";
import {MultiSelect} from "../multi-select";
import {CoreAppSidebar, type SidebarNavGroup} from "../navigation/core-app-sidebar";
import {CoreAppTopBar} from "../navigation/core-app-top-bar";
import {
	PermissionMatrix,
	type PermissionMatrixCategory,
	type PermissionMatrixGroup,
	type PermissionMatrixPermission,
} from "../permission-matrix";
import {PropertyList, PropertyRow} from "../property-list";
import {SectionPanel} from "../section-panel";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {Skeleton} from "../skeleton";
import {Toaster, toast} from "../sonner";
import {Tabs, TabsList, TabsTrigger} from "../tabs";
import {ARAMCO_LOGO, DIRIYAH_LOGO, NEOM_LOGO, QIDDIYA_LOGO, RED_SEA_LOGO, ROSHN_LOGO} from "./org-logos";

// Admin Panel — a full app-shell template: CoreAppSidebar + CoreAppTopBar around three admin surfaces
// (Projects, Permissions, Users) selected from the sidebar.

type TabId = "home" | "projects" | "permissions" | "users";

const NAV_ITEMS: {id: TabId; label: string; icon: React.ComponentType<{className?: string}>}[] = [
	{id: "home", label: "Overview", icon: Home},
	{id: "projects", label: "Projects", icon: FolderKanban},
	{id: "permissions", label: "Roles", icon: ShieldCheck},
	{id: "users", label: "Users", icon: UsersIcon},
];

const ADMIN_GROUPS: SidebarNavGroup[] = [{items: NAV_ITEMS}];

const ADD_LABEL: Record<TabId, string> = {
	home: "",
	projects: "New project",
	permissions: "New role",
	users: "Invite user",
};

// ── Projects ──

type Project = {
	id: string;
	name: string;
	projectType: string;
	contractType: string;
	contractDuration: string;
	startDate: string;
	country: string;
	timeZone: string;
	createdAt: string;
	createdBy: string;
	status: "Active" | "Archived";
};

const RIYADH_TZ = "Asia/Riyadh UTC +03:00";
const KSA = "Saudi Arabia";

const PROJECTS: Project[] = [
	{
		id: "p1",
		status: "Active",
		name: "ISSD_BI-10-13202",
		projectType: "-",
		contractType: "-",
		contractDuration: "-",
		startDate: "-",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "12 Jan 2023",
		createdBy: "Layla Nasser",
	},
	{
		id: "p2",
		status: "Active",
		name: "Fadhili GIP PKG 1",
		projectType: "-",
		contractType: "-",
		contractDuration: "-",
		startDate: "-",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "03 Feb 2023",
		createdBy: "Ahmed Raza",
	},
	{
		id: "p3",
		status: "Active",
		name: "Jazan Refinery-Boiler Pkg.",
		projectType: "Refinery",
		contractType: "-",
		contractDuration: "-",
		startDate: "-",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "21 Feb 2023",
		createdBy: "Maya Khan",
	},
	{
		id: "p4",
		status: "Active",
		name: "Khurais",
		projectType: "-",
		contractType: "-",
		contractDuration: "-",
		startDate: "-",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "09 Mar 2023",
		createdBy: "Sara Idris",
	},
	{
		id: "p5",
		status: "Active",
		name: "Phase-3, Package-8",
		projectType: "Pipelines",
		contractType: "Remeasurable",
		contractDuration: "-",
		startDate: "-",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "28 Mar 2023",
		createdBy: "Omar Farouk",
	},
	{
		id: "p6",
		status: "Archived",
		name: "Jafurah-Phase 2",
		projectType: "Infrastructure",
		contractType: "-",
		contractDuration: "-",
		startDate: "-",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "14 Apr 2023",
		createdBy: "Layla Nasser",
	},
	{
		id: "p7",
		status: "Active",
		name: "SRU_Yanbu_Refinery",
		projectType: "Refinery",
		contractType: "Cost Plus",
		contractDuration: "-",
		startDate: "-",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "02 May 2023",
		createdBy: "Ahmed Raza",
	},
	{
		id: "p8",
		status: "Active",
		name: "Turaif",
		projectType: "-",
		contractType: "-",
		contractDuration: "-",
		startDate: "-",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "19 May 2023",
		createdBy: "Rania Salem",
	},
	{
		id: "p9",
		status: "Active",
		name: "Shaybah DPCU",
		projectType: "Airports",
		contractType: "Lump Sum",
		contractDuration: "1000 Days",
		startDate: "06/11/2023",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "01 Jun 2023",
		createdBy: "Maya Khan",
	},
	{
		id: "p10",
		status: "Active",
		name: "Sinopec",
		projectType: "Airports",
		contractType: "Lump Sum",
		contractDuration: "1000 Days",
		startDate: "06/11/2023",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "16 Jun 2023",
		createdBy: "Omar Farouk",
	},
	{
		id: "p11",
		status: "Active",
		name: "JC3C4",
		projectType: "Airports",
		contractType: "Lump Sum",
		contractDuration: "1000 Days",
		startDate: "06/11/2023",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "30 Jun 2023",
		createdBy: "Sara Idris",
	},
	{
		id: "p12",
		status: "Archived",
		name: "JTE-5250-300",
		projectType: "Airports",
		contractType: "Lump Sum",
		contractDuration: "1000 Days",
		startDate: "06/11/2023",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "12 Jul 2023",
		createdBy: "Layla Nasser",
	},
	{
		id: "p13",
		status: "Archived",
		name: "SITP",
		projectType: "Airports",
		contractType: "Lump Sum",
		contractDuration: "1000 Days",
		startDate: "06/11/2023",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "25 Jul 2023",
		createdBy: "Rania Salem",
	},
	{
		id: "p14",
		status: "Archived",
		name: "Riyas",
		projectType: "Airports",
		contractType: "Lump Sum",
		contractDuration: "1000 Days",
		startDate: "06/11/2023",
		country: KSA,
		timeZone: RIYADH_TZ,
		createdAt: "08 Aug 2023",
		createdBy: "Ahmed Raza",
	},
];

// Integration modules that can be toggled per project.
type ModuleDef = {id: string; label: string; enabled: boolean};
const MODULES: ModuleDef[] = [
	{id: "drone", label: "Drone Deploy", enabled: false},
	{id: "pcc", label: "PCC", enabled: false},
	{id: "clnc_visit", label: "Clinic Visit", enabled: true},
	{id: "clnc_dashboard", label: "Clinic Dashboard", enabled: true},
	{id: "clnc_settings", label: "Clinic Settings", enabled: true},
	{id: "clnc_worker", label: "Clinic Worker", enabled: true},
	{id: "clnc_doctor", label: "Clinic Doctor", enabled: true},
	{id: "video_wall", label: "Video Wall", enabled: true},
	{id: "playground", label: "Playground", enabled: false},
	{id: "progress_capture", label: "Progress Capture", enabled: false},
	{id: "siteguard", label: "Siteguard", enabled: true},
	{id: "payment", label: "Payment", enabled: false},
	{id: "weatherstation", label: "Weather Station", enabled: false},
	{id: "equipments_tracker", label: "Equipment Tracker", enabled: false},
	{id: "site_support", label: "Site Support", enabled: false},
	{id: "equipments", label: "Equipments", enabled: false},
	{id: "sitesup_issues", label: "Site Issues", enabled: true},
	{id: "sitesup_teams", label: "Site Teams", enabled: true},
	{id: "sitesup_reports", label: "Site Reports", enabled: true},
	{id: "sitesup_playbooks", label: "Site Playbooks", enabled: true},
	{id: "journeys", label: "Journeys", enabled: false},
	{id: "sitesup_automation", label: "Site Automation", enabled: false},
	{id: "ticket_manager", label: "Ticket Manager", enabled: false},
	{id: "anchor_planner", label: "Anchor Planner", enabled: false},
];

const muted = (v: string) => (
	<span className={v === "-" ? "wwc:text-muted-foreground/50" : "wwc:text-muted-foreground"}>{v}</span>
);

function makeProjectColumns(
	onOpen: (p: Project) => void,
	onArchive: (p: Project) => void,
	onRestore: (p: Project) => void,
): ColumnDef<Project>[] {
	return [
		{
			accessorKey: "name",
			header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
			cell: ({row}) => (
				<button
					type="button"
					onClick={() => onOpen(row.original)}
					className="wwc:text-left wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
				>
					{row.original.name}
				</button>
			),
		},
		{
			accessorKey: "projectType",
			header: ({column}) => <DataTableColumnHeader column={column} title="Project Type" />,
			cell: ({row}) => muted(row.original.projectType),
		},
		{
			accessorKey: "contractType",
			header: ({column}) => <DataTableColumnHeader column={column} title="Contract Type" />,
			cell: ({row}) => muted(row.original.contractType),
		},
		{
			accessorKey: "contractDuration",
			header: ({column}) => <DataTableColumnHeader column={column} title="Contract Duration" />,
			cell: ({row}) => muted(row.original.contractDuration),
		},
		{
			accessorKey: "startDate",
			header: ({column}) => <DataTableColumnHeader column={column} title="Start Date" />,
			cell: ({row}) => muted(row.original.startDate),
		},
		{
			accessorKey: "country",
			header: ({column}) => <DataTableColumnHeader column={column} title="Country" />,
			cell: ({row}) => <span>{row.original.country}</span>,
		},
		{
			accessorKey: "timeZone",
			header: ({column}) => <DataTableColumnHeader column={column} title="Time Zone" />,
			cell: ({row}) => muted(row.original.timeZone),
		},
		{
			id: "actions",
			enableSorting: false,
			meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:overflow-visible wwc:whitespace-nowrap wwc:text-right"},
			cell: ({row}) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" icon aria-label="Row actions" className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground">
							<MoreHorizontal className="wwc:h-4 wwc:w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="wwc:w-48">
						<DropdownMenuItem onClick={() => onOpen(row.original)}>
							<Eye className="wwc:h-4 wwc:w-4" />
							View details
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => window.open("https://core.com", "_blank", "noopener")}>
							<ExternalLink className="wwc:h-4 wwc:w-4" />
							Open project
						</DropdownMenuItem>
						{row.original.status === "Archived" ? (
							<DropdownMenuItem onClick={() => onRestore(row.original)}>
								<ArchiveRestore className="wwc:h-4 wwc:w-4" />
								Restore project
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								onClick={() => onArchive(row.original)}
								className="wwc:text-destructive focus:wwc:text-destructive"
							>
								<Archive className="wwc:h-4 wwc:w-4" />
								Archive project
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}

const moduleDefaults = (): Record<string, boolean> => Object.fromEntries(MODULES.map((m) => [m.id, m.enabled]));

// Option lists for the editable project fields.
const PROJECT_TYPES = ["Buildings", "Infrastructure", "Refinery", "Pipelines", "Roads", "Airports", "Industrial"];
const CONTRACT_TYPES = ["Lump Sum", "Cost Plus", "Remeasurable", "Unit Price", "Turnkey (EPC)"];
const COUNTRIES = ["Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman", "Egypt"];
const TIMEZONES = [
	"Asia/Riyadh UTC +03:00",
	"Asia/Dubai UTC +04:00",
	"Asia/Qatar UTC +03:00",
	"Asia/Kuwait UTC +03:00",
	"Asia/Bahrain UTC +03:00",
	"Asia/Muscat UTC +04:00",
	"Africa/Cairo UTC +02:00",
];

// A country's default (first) time zone — picking a country auto-selects it in the project form.
const COUNTRY_TIMEZONE: Record<string, string> = {
	"Saudi Arabia": "Asia/Riyadh UTC +03:00",
	"United Arab Emirates": "Asia/Dubai UTC +04:00",
	Qatar: "Asia/Qatar UTC +03:00",
	Kuwait: "Asia/Kuwait UTC +03:00",
	Bahrain: "Asia/Bahrain UTC +03:00",
	Oman: "Asia/Muscat UTC +04:00",
	Egypt: "Africa/Cairo UTC +02:00",
};

// The editable subset of a project — kept as an all-strings draft so dirty-tracking is a plain JSON compare.
type ProjectFields = {
	name: string;
	projectType: string;
	contractType: string;
	contractDuration: string; // number of days, without the "Days" suffix
	startDate: string; // DD/MM/YYYY
	country: string;
	timeZone: string;
};

const EMPTY_FIELDS: ProjectFields = {
	name: "",
	projectType: "",
	contractType: "",
	contractDuration: "",
	startDate: "",
	country: "",
	timeZone: "",
};

const unDash = (v: string) => (v === "-" ? "" : v);

const fieldsFromProject = (p: Project): ProjectFields => ({
	name: p.name,
	projectType: unDash(p.projectType),
	contractType: unDash(p.contractType),
	contractDuration: unDash(p.contractDuration).replace(/\s*Days$/i, ""),
	startDate: unDash(p.startDate),
	country: unDash(p.country),
	timeZone: unDash(p.timeZone),
});

const pad2 = (n: number) => String(n).padStart(2, "0");
const parseDMY = (s: string): Date | undefined => {
	const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim());
	if (!m) return undefined;
	return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
};
const formatDMY = (d: Date) => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;

// A labelled select used across the editable project fields.
function FieldSelect({
	value,
	onChange,
	placeholder,
	options,
	triggerClassName = "wwc:ml-auto wwc:w-full wwc:max-w-sm",
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder: string;
	options: string[];
	triggerClassName?: string;
}) {
	return (
		<Select value={value || undefined} onValueChange={onChange}>
			<SelectTrigger className={triggerClassName}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((o) => (
					<SelectItem key={o} value={o}>
						{o}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function ProjectForm({
	mode,
	project,
	draft,
	onField,
	errors,
	modules,
	onToggleModule,
	onBack,
}: {
	mode: "edit" | "create";
	project: Project | null;
	draft: ProjectFields;
	onField: <K extends keyof ProjectFields>(key: K, value: ProjectFields[K]) => void;
	errors: Record<string, boolean>;
	modules: Record<string, boolean>;
	onToggleModule: (id: string, value: boolean) => void;
	onBack: () => void;
}) {
	const enabledCount = MODULES.filter((m) => modules[m.id]).length;
	const [moduleSearch, setModuleSearch] = useState("");
	const filteredModules = MODULES.filter((m) => m.label.toLowerCase().includes(moduleSearch.trim().toLowerCase()));

	return (
		<div className="wwc:space-y-6">
			<Button variant="ghost" size="sm" onClick={onBack} className="wwc:-ml-2">
				<ChevronLeft className="wwc:h-4 wwc:w-4" />
				Back to projects
			</Button>

			<div>
				<h1 className="wwc:text-2xl wwc:font-bold wwc:tracking-tight">
					{mode === "create" ? "New project" : project?.name}
				</h1>
				<p className="wwc:text-sm wwc:text-muted-foreground">
					{mode === "create"
						? "Fill in the details below to create a project."
						: `Created ${project?.createdAt} by ${project?.createdBy}`}
				</p>
			</div>

			{/* Project details — an editable form card. */}
			<Card className="wwc:shadow-none">
				<CardHeader className="wwc:pb-2">
					<CardTitle className="wwc:text-base">Project details</CardTitle>
					<CardDescription>Profile and metadata for this project.</CardDescription>
				</CardHeader>
				<CardContent>
					<PropertyList labelWidth="12rem">
						<PropertyRow label="Project name" required align="start">
							<div className="wwc:ml-auto wwc:w-full wwc:max-w-sm">
								<Input
									value={draft.name}
									onChange={(e) => onField("name", e.target.value)}
									placeholder="Project name"
									aria-invalid={!!errors.name || !!errors.nameDup}
									className={cn(
										"wwc:w-full",
										(errors.name || errors.nameDup) && "wwc:border-destructive wwc:focus-visible:ring-destructive",
									)}
								/>
								{errors.name ? (
									<p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">Project name is required.</p>
								) : errors.nameDup ? (
									<p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">
										A project with this name already exists.
									</p>
								) : null}
							</div>
						</PropertyRow>
						<PropertyRow label="Project type">
							<FieldSelect
								value={draft.projectType}
								onChange={(v) => onField("projectType", v)}
								placeholder="Choose type"
								options={PROJECT_TYPES}
							/>
						</PropertyRow>
						<PropertyRow label="Contract type">
							<FieldSelect
								value={draft.contractType}
								onChange={(v) => onField("contractType", v)}
								placeholder="Select contract type"
								options={CONTRACT_TYPES}
							/>
						</PropertyRow>
						<PropertyRow label="Contract duration" align="start">
							<div className="wwc:ml-auto wwc:w-full wwc:max-w-sm">
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<Input
										type="number"
										min={1}
										step={1}
										value={draft.contractDuration}
										onChange={(e) => onField("contractDuration", e.target.value)}
										placeholder="Duration"
										aria-invalid={errors.duration}
										className={cn(errors.duration && "wwc:border-destructive wwc:focus-visible:ring-destructive")}
									/>
									<span className="wwc:shrink-0 wwc:text-sm wwc:text-muted-foreground">Days</span>
								</div>
								{errors.duration && (
									<p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">
										Duration must be a positive whole number of days.
									</p>
								)}
							</div>
						</PropertyRow>
						<PropertyRow label="Start date" align="start">
							<div className="wwc:ml-auto wwc:w-full wwc:max-w-sm">
								<div className={cn(errors.startDate && "wwc:rounded-md wwc:ring-1 wwc:ring-destructive")}>
									<DatePicker
										date={draft.startDate ? parseDMY(draft.startDate) : undefined}
										onDateChange={(d) => onField("startDate", d ? formatDMY(d) : "")}
										placeholder="Choose date"
										className="wwc:w-full"
									/>
								</div>
								{errors.startDate && (
									<p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">Start date can't be in the future.</p>
								)}
							</div>
						</PropertyRow>
						<PropertyRow label="Country" required align="start">
							<div className="wwc:ml-auto wwc:w-full wwc:max-w-sm">
								<div className={cn(errors.country && "wwc:rounded-md wwc:ring-1 wwc:ring-destructive")}>
									<FieldSelect
										value={draft.country}
										onChange={(v) => {
											onField("country", v);
											// Picking a country auto-selects its default time zone.
											onField("timeZone", COUNTRY_TIMEZONE[v] ?? "");
										}}
										placeholder="Select country"
										options={COUNTRIES}
									/>
								</div>
								{errors.country && <p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">Country is required.</p>}
							</div>
						</PropertyRow>
						<PropertyRow label="Time zone" required align="start">
							<div className="wwc:ml-auto wwc:w-full wwc:max-w-sm">
								<div className={cn(errors.timeZone && "wwc:rounded-md wwc:ring-1 wwc:ring-destructive")}>
									<FieldSelect
										value={draft.timeZone}
										onChange={(v) => onField("timeZone", v)}
										placeholder="Choose time zone"
										options={TIMEZONES}
									/>
								</div>
								{errors.timeZone && (
									<p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">Time zone is required.</p>
								)}
							</div>
						</PropertyRow>
						{mode === "edit" && project ? (
							<>
								<PropertyRow label="Created at">
									<span className="wwc:ml-auto wwc:w-full wwc:max-w-sm">{project.createdAt}</span>
								</PropertyRow>
								<PropertyRow label="Created by">
									<span className="wwc:ml-auto wwc:w-full wwc:max-w-sm">{project.createdBy}</span>
								</PropertyRow>
							</>
						) : null}
					</PropertyList>
				</CardContent>
			</Card>

			{/* Module selection — a searchable list below the details card (scales to many modules). */}
			<SectionPanel
				title="Project Integrations"
				count={`${enabledCount}/${MODULES.length}`}
				bodyClassName="wwc:divide-y wwc:divide-border"
				action={
					<div className="wwc:relative wwc:w-56">
						<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-3.5 wwc:w-3.5 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
						<Input
							value={moduleSearch}
							onChange={(e) => setModuleSearch(e.target.value)}
							placeholder="Search modules…"
							className="wwc:h-8 wwc:pl-8"
						/>
					</div>
				}
				empty={
					<div className="wwc:px-2 wwc:py-10 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
						No modules match “{moduleSearch}”.
					</div>
				}
			>
				{filteredModules.map((m) => (
					<label
						key={m.id}
						className="wwc:flex wwc:cursor-pointer wwc:items-center wwc:gap-3 wwc:px-2 wwc:py-2.5 wwc:transition-colors wwc:hover:bg-muted/50"
					>
						<Checkbox checked={modules[m.id]} onCheckedChange={(v) => onToggleModule(m.id, !!v)} />
						<span className="wwc:text-sm">{m.label}</span>
					</label>
				))}
			</SectionPanel>
		</div>
	);
}

const PROJECT_STATUS_TABS = ["Active", "Archived"] as const;

function ProjectsView({onOpen}: {onOpen: (p: Project) => void}) {
	const [statusTab, setStatusTab] = useState<(typeof PROJECT_STATUS_TABS)[number]>("Active");
	const [pendingArchive, setPendingArchive] = useState<Project | null>(null);
	const restore = (p: Project) => toast.success(`Project “${p.name}” restored`);
	const columns = useMemo(() => makeProjectColumns(onOpen, setPendingArchive, restore), [onOpen]);
	const data = PROJECTS.filter((p) => p.status === statusTab);

	return (
		<div className="wwc:space-y-4">
			<Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as (typeof PROJECT_STATUS_TABS)[number])}>
				<TabsList>
					{PROJECT_STATUS_TABS.map((t) => (
						<TabsTrigger key={t} value={t}>
							{t}
							<span className="wwc:ml-1.5 wwc:text-muted-foreground">
								{PROJECTS.filter((p) => p.status === t).length}
							</span>
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>
			<DataTable
				key={statusTab}
				columns={columns}
				data={data}
				searchKey="name"
				searchPlaceholder="Search projects…"
				recordLabel="project"
				pageSize={10}
			/>
			<ConfirmDialog
				open={!!pendingArchive}
				title="Archive project?"
				description={
					<>
						This will archive <span className="wwc:font-medium wwc:text-foreground">{pendingArchive?.name}</span>. You
						can restore it later from the Archived tab.
					</>
				}
				confirmLabel="Archive"
				destructive
				onOpenChange={(o) => !o && setPendingArchive(null)}
				onConfirm={() => {
					if (pendingArchive) toast.success(`Project “${pendingArchive.name}” archived`);
					setPendingArchive(null);
				}}
			/>
		</div>
	);
}

// ── Users ──

type User = {
	id: string;
	name: string;
	email: string;
	role: string;
	status: "Active" | "Deactivated" | "Invitation Sent";
	linkedPeople: string[];
	lastLogin: string;
	mobile: string;
	dialCode: string;
	projects: string[];
};

const USERS: User[] = [
	{
		id: "u1",
		status: "Active",
		name: "NGMSA CLINIC",
		email: "Clinic.RNGL@ngmsa.com",
		role: "DIGITAL CLINIC",
		linkedPeople: [],
		lastLogin: "12 Jul 2026",
		dialCode: "+966",
		mobile: "551234567",
		projects: ["Khurais"],
	},
	{
		id: "u2",
		status: "Deactivated",
		name: "MALATESHA HARIJANA",
		email: "Malatesha.Hari@sinohydro.sa",
		role: "DIGITAL CLINIC",
		linkedPeople: [],
		lastLogin: "13 Jul 2026",
		dialCode: "+966",
		mobile: "551234568",
		projects: ["Riyas"],
	},
	{
		id: "u3",
		status: "Active",
		name: "RIYASCLINIC",
		email: "riyasclinic@tecnicasreunidas.es",
		role: "DIGITAL CLINIC",
		linkedPeople: [],
		lastLogin: "13 Jul 2026",
		dialCode: "+966",
		mobile: "551234569",
		projects: ["Riyas"],
	},
	{
		id: "u4",
		status: "Active",
		name: "Arafzal",
		email: "arafzal@tecnicasreunidas.es",
		role: "Site Viewer",
		linkedPeople: ["Omar Farouk"],
		lastLogin: "12 Jul 2026",
		dialCode: "+966",
		mobile: "551234570",
		projects: ["SITP", "JC3C4"],
	},
	{
		id: "u5",
		status: "Invitation Sent",
		name: "Yves Uy",
		email: "zriyas@twareat.com",
		role: "DIGITAL CLINIC",
		linkedPeople: [],
		lastLogin: "13 Jul 2026",
		dialCode: "+971",
		mobile: "551234571",
		projects: ["Turaif"],
	},
	{
		id: "u6",
		status: "Active",
		name: "Manikandan Lakshmanan",
		email: "mlakshmanan@tecnicasreunidas.es",
		role: "Site Viewer",
		linkedPeople: [],
		lastLogin: "07 Jul 2026",
		dialCode: "+966",
		mobile: "551234572",
		projects: ["JTE-5250-300"],
	},
	{
		id: "u7",
		status: "Deactivated",
		name: "Abdullah Ahmed Aldhafeeri",
		email: "dhafeerirngl@dsco.com.sa",
		role: "Crew Lead",
		linkedPeople: ["John Dawson"],
		lastLogin: "07 Jul 2026",
		dialCode: "+966",
		mobile: "551234573",
		projects: ["Khurais", "Sinopec"],
	},
	{
		id: "u8",
		status: "Invitation Sent",
		name: "Mubashir SCC Operator",
		email: "mubshir.irfan+yanbu-scc@core.com",
		role: "Crew Lead",
		linkedPeople: [],
		lastLogin: "07 Jul 2026",
		dialCode: "+966",
		mobile: "551234574",
		projects: ["SRU_Yanbu_Refinery"],
	},
	{
		id: "u9",
		status: "Active",
		name: "Laura",
		email: "lrivasg@tecnicasreunidas.es",
		role: "Site Viewer",
		linkedPeople: [],
		lastLogin: "02 Jul 2026",
		dialCode: "+34",
		mobile: "612345678",
		projects: ["SITP"],
	},
	{
		id: "u10",
		status: "Active",
		name: "Layla Nasser",
		email: "layla.n@core.com",
		role: "WeCare Admin",
		linkedPeople: ["Layla Nasser"],
		lastLogin: "12 Jul 2026",
		dialCode: "+971",
		mobile: "551234575",
		projects: ["Jafurah-Phase 2"],
	},
	{
		id: "u11",
		status: "Active",
		name: "Omar Farouk",
		email: "omar.f@core.com",
		role: "Compliance Officer",
		linkedPeople: [],
		lastLogin: "10 Jul 2026",
		dialCode: "+966",
		mobile: "551234576",
		projects: ["Phase-3, Package-8"],
	},
	{
		id: "u12",
		status: "Active",
		name: "Sara Idris",
		email: "sara.i@core.com",
		role: "Network Administrator",
		linkedPeople: ["Sara Idris"],
		lastLogin: "09 Jul 2026",
		dialCode: "+966",
		mobile: "551234577",
		projects: ["Khurais"],
	},
];

const DIAL_CODES = ["+971", "+966", "+974", "+965", "+973", "+968", "+20", "+34"];
const PROJECT_NAMES = PROJECTS.map((p) => p.name);

// People a user account can be linked to (e.g. the on-site person / worker profile).
const PEOPLE = [
	"Layla Nasser",
	"Ahmed Raza",
	"Maya Khan",
	"Omar Farouk",
	"Sara Idris",
	"Rania Salem",
	"Yusuf Malik",
	"Nadia Hassan",
	"Karim Adel",
	"John Dawson",
	"Abdullah Alzahrani",
	"Fatima Noor",
	"Hassan Ali",
	"Mona Saleh",
	"Tariq Aziz",
];

function makeUserColumns(
	onOpen: (u: User) => void,
	onDeactivate: (u: User) => void,
	onViewRole: (roleName: string) => void,
): ColumnDef<User>[] {
	return [
		selectColumn<User>(),
		{
			accessorKey: "name",
			header: ({column}) => <DataTableColumnHeader column={column} title="User Name" />,
			cell: ({row}) => (
				<button
					type="button"
					onClick={() => onOpen(row.original)}
					className="wwc:text-left wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
				>
					{row.original.name}
				</button>
			),
		},
		{
			accessorKey: "email",
			header: ({column}) => <DataTableColumnHeader column={column} title="Email" />,
			cell: ({row}) => <span className="wwc:text-muted-foreground">{row.original.email}</span>,
		},
		{
			accessorKey: "role",
			header: ({column}) => <DataTableColumnHeader column={column} title="Role" />,
			cell: ({row}) => (
				<button
					type="button"
					onClick={() => onViewRole(row.original.role)}
					aria-label={`View ${row.original.role} permissions`}
				>
					<Badge variant="neutralSoft" className="wwc:cursor-pointer wwc:hover:bg-muted/70">
						{row.original.role}
					</Badge>
				</button>
			),
		},
		{
			accessorKey: "linkedPeople",
			header: ({column}) => <DataTableColumnHeader column={column} title="Linked Person" />,
			cell: ({row}) => muted(row.original.linkedPeople[0] ?? "-"),
		},
		{
			accessorKey: "lastLogin",
			header: ({column}) => <DataTableColumnHeader column={column} title="Last Login" />,
			cell: ({row}) => <span>{row.original.lastLogin}</span>,
		},
		{
			id: "actions",
			enableSorting: false,
			meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:overflow-visible wwc:whitespace-nowrap wwc:text-right"},
			cell: ({row}) => {
				const u = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								icon
								aria-label="Row actions"
								className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground"
							>
								<MoreHorizontal className="wwc:h-4 wwc:w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="wwc:w-48">
							<DropdownMenuItem onClick={() => onOpen(u)}>
								<Eye className="wwc:h-4 wwc:w-4" />
								Edit user
							</DropdownMenuItem>
							{u.status === "Invitation Sent" ? (
								<DropdownMenuItem
									onClick={() => {
										navigator.clipboard?.writeText(`https://app.core.com/register-user/${u.id}`).catch(() => {});
										toast.success("Invitation link copied");
									}}
								>
									<Copy className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									Copy invitation link
								</DropdownMenuItem>
							) : u.status === "Deactivated" ? (
								<DropdownMenuItem onClick={() => toast.success(`User “${u.name}” activated`)}>
									<UserCheck className="wwc:h-4 wwc:w-4" />
									Activate
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem
									onClick={() => onDeactivate(u)}
									className="wwc:text-destructive focus:wwc:text-destructive"
								>
									<Ban className="wwc:h-4 wwc:w-4" />
									Deactivate
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];
}

type UserFields = {
	email: string;
	role: string;
	projects: string[];
	linkedPeople: string[];
	mobile: string;
	dialCode: string;
};
const EMPTY_USER: UserFields = {email: "", role: "", projects: [], linkedPeople: [], mobile: "", dialCode: "+971"};
const fieldsFromUser = (u: User): UserFields => ({
	email: u.email,
	role: u.role,
	projects: [...u.projects],
	linkedPeople: [...u.linkedPeople],
	mobile: u.mobile,
	dialCode: u.dialCode,
});

function UserForm({
	mode,
	user,
	draft,
	onField,
	errors,
	onBack,
}: {
	mode: "edit" | "create";
	user: User | null;
	draft: UserFields;
	onField: <K extends keyof UserFields>(key: K, value: UserFields[K]) => void;
	errors: Record<string, boolean>;
	onBack: () => void;
}) {
	return (
		<div className="wwc:space-y-6">
			<Button variant="ghost" size="sm" onClick={onBack} className="wwc:-ml-2">
				<ChevronLeft className="wwc:h-4 wwc:w-4" />
				Back to users
			</Button>

			<div>
				<h1 className="wwc:text-2xl wwc:font-bold wwc:tracking-tight">{mode === "create" ? "New user" : user?.name}</h1>
				<p className="wwc:text-sm wwc:text-muted-foreground">
					{mode === "create" ? "Invite a user and assign their role and projects." : "Edit this user’s access."}
				</p>
			</div>

			<Card className="wwc:shadow-none">
				<CardHeader className="wwc:pb-2">
					<CardTitle className="wwc:text-base">User details</CardTitle>
					<CardDescription>Contact, role, and project access for this user.</CardDescription>
				</CardHeader>
				<CardContent>
					<PropertyList labelWidth="12rem">
						<PropertyRow label="Email" required align="start">
							<div className="wwc:ml-auto wwc:w-full wwc:max-w-sm">
								<Input
									type="email"
									value={draft.email}
									onChange={(e) => onField("email", e.target.value)}
									placeholder="Email"
									disabled={mode === "edit"}
									aria-invalid={!!(errors.email || errors.emailInvalid || errors.emailDup)}
									className={cn(
										"wwc:w-full",
										(errors.email || errors.emailInvalid || errors.emailDup) &&
											"wwc:border-destructive wwc:focus-visible:ring-destructive",
									)}
								/>
								{errors.email ? (
									<p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">Email is required.</p>
								) : errors.emailInvalid ? (
									<p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">Enter a valid email address.</p>
								) : errors.emailDup ? (
									<p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">This email is already in use.</p>
								) : mode === "edit" ? (
									<p className="wwc:mt-1.5 wwc:text-xs wwc:text-muted-foreground">
										Email can't be changed after creation.
									</p>
								) : null}
							</div>
						</PropertyRow>
						<PropertyRow label="Role" required align="start">
							<div className="wwc:ml-auto wwc:w-full wwc:max-w-sm">
								<Combobox
									options={ROLES.map((r) => ({value: r.name, label: r.name}))}
									value={draft.role}
									onValueChange={(v) => onField("role", v)}
									placeholder="Select role"
									searchPlaceholder="Search roles…"
									emptyMessage="No role found."
									className={cn("wwc:w-full wwc:font-normal", errors.role && "wwc:border-destructive")}
									popoverClassName="wwc:min-w-[240px] wwc:w-[var(--radix-popover-trigger-width)] wwc:p-0"
								/>
								{errors.role && <p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">Role is required.</p>}
							</div>
						</PropertyRow>
						<PropertyRow label="Projects" required align="start">
							<div className="wwc:ml-auto wwc:w-full wwc:max-w-sm">
								<MultiSelect
									options={PROJECT_NAMES.map((p) => ({value: p, label: p}))}
									value={draft.projects}
									onValueChange={(v) => onField("projects", v)}
									placeholder="Select project(s)"
									searchPlaceholder="Search projects…"
									emptyMessage="No projects found."
									invalid={errors.projects}
								/>
								{errors.projects && (
									<p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">Select at least one project.</p>
								)}
							</div>
						</PropertyRow>
						<PropertyRow label="Linked person" align="start">
							<div className="wwc:ml-auto wwc:w-full wwc:max-w-sm">
								<Combobox
									options={PEOPLE.map((pp) => ({value: pp, label: pp}))}
									value={draft.linkedPeople[0] ?? ""}
									onValueChange={(v) => onField("linkedPeople", v ? [v] : [])}
									placeholder="Link a person…"
									searchPlaceholder="Search people…"
									emptyMessage="No people found."
									className="wwc:w-full wwc:font-normal"
									popoverClassName="wwc:min-w-[240px] wwc:w-[var(--radix-popover-trigger-width)] wwc:p-0"
								/>
							</div>
						</PropertyRow>
						<PropertyRow label="Mobile">
							<div className="wwc:ml-auto wwc:flex wwc:w-full wwc:max-w-sm wwc:items-center wwc:gap-2">
								<div className="wwc:w-[110px]">
									<FieldSelect
										value={draft.dialCode}
										onChange={(v) => onField("dialCode", v)}
										placeholder="+000"
										options={DIAL_CODES}
									/>
								</div>
								<Input
									type="tel"
									value={draft.mobile}
									onChange={(e) => onField("mobile", e.target.value)}
									placeholder="Phone number"
									className="wwc:flex-1"
								/>
							</div>
						</PropertyRow>
						{mode === "edit" && user ? (
							<PropertyRow label="Last login">
								<span className="wwc:ml-auto wwc:w-full wwc:max-w-sm">{user.lastLogin}</span>
							</PropertyRow>
						) : null}
					</PropertyList>
				</CardContent>
			</Card>
		</div>
	);
}

const USER_STATUS_TABS = ["Active", "Deactivated", "Invitation Sent"] as const;

function UsersView({onOpen}: {onOpen: (u: User) => void}) {
	const [statusTab, setStatusTab] = useState<(typeof USER_STATUS_TABS)[number]>("Active");
	// Deactivation is confirmed (single user, or a bulk count).
	const [pendingDeactivate, setPendingDeactivate] = useState<User | null>(null);
	const [bulkDeactivate, setBulkDeactivate] = useState(0);
	// Clicking a role badge opens a read-only view of that role's permissions.
	const [viewingRole, setViewingRole] = useState<Role | null>(null);
	const columns = useMemo(
		() =>
			makeUserColumns(onOpen, setPendingDeactivate, (roleName) =>
				setViewingRole(ROLES.find((r) => r.name === roleName) ?? null),
			),
		[onOpen],
	);
	const data = USERS.filter((u) => u.status === statusTab);
	// Users are deactivated, never deleted — the bulk action depends on which tab is active.
	const bulkAction =
		statusTab === "Deactivated"
			? {label: "Activate", verb: "activated"}
			: statusTab === "Invitation Sent"
				? {label: "Copy invitation link", verb: "copied"}
				: {label: "Deactivate", verb: "deactivated"};
	const bulkIsDeactivate = statusTab === "Active";
	const bulkIsCopy = statusTab === "Invitation Sent";

	return (
		<div className="wwc:space-y-4">
			<Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as (typeof USER_STATUS_TABS)[number])}>
				<TabsList>
					{USER_STATUS_TABS.map((t) => (
						<TabsTrigger key={t} value={t}>
							{t}
							<span className="wwc:ml-1.5 wwc:text-muted-foreground">{USERS.filter((u) => u.status === t).length}</span>
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>
			<DataTable
				key={statusTab}
				columns={columns}
				data={data}
				searchKey="name"
				searchPlaceholder="Search users…"
				recordLabel="user"
				pageSize={10}
				bulkActions={[
					{
						label: bulkAction.label,
						variant: bulkIsDeactivate ? "destructive" : "outline",
						onClick: (ids) =>
							bulkIsDeactivate
								? setBulkDeactivate(ids.length)
								: bulkIsCopy
									? toast.success(`${ids.length} invitation link${ids.length === 1 ? "" : "s"} copied`)
									: toast.success(`${ids.length} user${ids.length === 1 ? "" : "s"} ${bulkAction.verb}`),
					},
				]}
			/>
			<ConfirmDialog
				open={!!pendingDeactivate}
				title="Deactivate user?"
				description={
					<>
						This will deactivate <span className="wwc:font-medium wwc:text-foreground">{pendingDeactivate?.name}</span>.
						They lose access until reactivated.
					</>
				}
				confirmLabel="Deactivate"
				destructive
				onOpenChange={(o) => !o && setPendingDeactivate(null)}
				onConfirm={() => {
					toast.success(`User “${pendingDeactivate?.name}” deactivated`);
					setPendingDeactivate(null);
				}}
			/>
			<ConfirmDialog
				open={bulkDeactivate > 0}
				title={`Deactivate ${bulkDeactivate === 1 ? "user" : "users"}?`}
				description={
					<>
						This will deactivate{" "}
						<span className="wwc:font-medium wwc:text-foreground">
							{bulkDeactivate} {bulkDeactivate === 1 ? "user" : "users"}
						</span>
						. They lose access until reactivated.
					</>
				}
				confirmLabel="Deactivate"
				destructive
				onOpenChange={(o) => !o && setBulkDeactivate(0)}
				onConfirm={() => {
					toast.success(`${bulkDeactivate} user${bulkDeactivate === 1 ? "" : "s"} deactivated`);
					setBulkDeactivate(0);
				}}
			/>
			<RolePermissionsDialog role={viewingRole} onOpenChange={(o) => !o && setViewingRole(null)} />
		</div>
	);
}

// ── Permissions (Roles) ──

type Role = {id: string; name: string; permissions: Record<string, boolean>};

// The template supplies product permissions to the reusable three-level PermissionMatrix widget.
type Perm = PermissionMatrixPermission;
type PermGroup = PermissionMatrixGroup;
type PermCategory = PermissionMatrixCategory;

const crud = (prefix: string, actions: string[] = ["Create", "Export", "Manage", "View"]): Perm[] =>
	actions.map((a) => ({id: `${prefix}.${a.toLowerCase()}`, label: a}));

const PERMISSION_CATALOG: PermCategory[] = [
	{
		id: "complaints",
		label: "Complaints",
		groups: [
			{
				id: "complaints.translation",
				label: "translation.baseline",
				permissions: [
					{id: "complaints.translation.import", label: "translation.baseline:import"},
					{id: "complaints.translation.view", label: "translation.baseline:view"},
				],
			},
			{id: "complaints.main", label: "Complaints", permissions: crud("complaints.main")},
		],
	},
	{
		id: "compliance",
		label: "Compliance",
		groups: [{id: "compliance.main", label: "Compliance", permissions: crud("compliance")}],
	},
	{
		id: "crew",
		label: "Crew Management",
		groups: [{id: "crew.main", label: "Crew Management", permissions: crud("crew")}],
	},
	{id: "devices", label: "Devices", groups: [{id: "devices.main", label: "Devices", permissions: crud("devices")}]},
	{
		id: "digital_clinic",
		label: "Digital Clinic",
		groups: [{id: "digital_clinic.main", label: "Digital Clinic", permissions: crud("digital_clinic")}],
	},
	{
		id: "equipments",
		label: "Equipments",
		groups: [{id: "equipments.main", label: "Equipments", permissions: crud("equipments")}],
	},
	{
		id: "external",
		label: "External Integrations",
		groups: [{id: "external.main", label: "External Integrations", permissions: crud("external")}],
	},
	{
		id: "hardware",
		label: "Hardware Management",
		groups: [{id: "hardware.main", label: "Hardware Management", permissions: crud("hardware")}],
	},
	{
		id: "management_map",
		label: "Management Map",
		groups: [
			{id: "management_map.main", label: "Management Map", permissions: crud("management_map", ["Manage", "View"])},
		],
	},
	{id: "map", label: "Map", groups: [{id: "map.main", label: "Map", permissions: crud("map", ["Manage", "View"])}]},
	{
		id: "network_admin",
		label: "Network Administration",
		groups: [{id: "network_admin.main", label: "Network Administration", permissions: crud("network_admin")}],
	},
	{
		id: "network_toolkit",
		label: "Network Toolkit",
		groups: [{id: "network_toolkit.main", label: "Network Toolkit", permissions: crud("network_toolkit")}],
	},
	{
		id: "observation",
		label: "Observation Manager",
		groups: [{id: "observation.main", label: "Observation Manager", permissions: crud("observation")}],
	},
	{
		id: "project_builder",
		label: "Project Builder",
		groups: [{id: "project_builder.main", label: "Project Builder", permissions: crud("project_builder")}],
	},
];

const catPermIds = (c: PermCategory): string[] => c.groups.flatMap((g) => g.permissions.map((p) => p.id));
const ALL_PERM_IDS: string[] = PERMISSION_CATALOG.flatMap(catPermIds);
const permDefaults = (): Record<string, boolean> => Object.fromEntries(ALL_PERM_IDS.map((id) => [id, false]));
const roleWith = (ids: string[]): Record<string, boolean> => {
	const base = permDefaults();
	for (const id of ids) if (id in base) base[id] = true;
	return base;
};

const ROLES: Role[] = [
	{
		id: "role1",
		name: "SCC Khurais",
		permissions: roleWith(["complaints.main.view", "compliance.view", "crew.view", "map.view"]),
	},
	{id: "role2", name: "Riyas Technician", permissions: roleWith(["devices.view", "hardware.view", "equipments.view"])},
	{id: "role3", name: "DIGITAL CLINIC", permissions: roleWith(catPermIds(PERMISSION_CATALOG[4]))},
	{id: "role4", name: "doctor clinic 1 test", permissions: roleWith(["digital_clinic.view", "digital_clinic.manage"])},
	{id: "role5", name: "testing account", permissions: roleWith(["map.view"])},
	{
		id: "role6",
		name: "AVL Permission",
		permissions: roleWith(["devices.view", "devices.manage", "map.view", "map.manage"]),
	},
	{id: "role7", name: "WeCare Admin", permissions: roleWith(ALL_PERM_IDS)},
	{
		id: "role8",
		name: "Aramco Executive",
		permissions: roleWith(["complaints.main.view", "compliance.view", "observation.view", "map.view"]),
	},
	{
		id: "role9",
		name: "safety officers",
		permissions: roleWith(["observation.view", "observation.create", "compliance.view"]),
	},
	{
		id: "role10",
		name: "FGIP Super Technician",
		permissions: roleWith([
			"devices.view",
			"devices.manage",
			"hardware.view",
			"hardware.manage",
			"network_toolkit.view",
		]),
	},
	{id: "role11", name: "Network Administrator", permissions: roleWith(catPermIds(PERMISSION_CATALOG[10]))},
	{id: "role12", name: "Crew Lead", permissions: roleWith(["crew.view", "crew.create", "crew.manage"])},
	{
		id: "role13",
		name: "Compliance Officer",
		permissions: roleWith(["compliance.view", "compliance.manage", "compliance.export"]),
	},
	{id: "role14", name: "Site Viewer", permissions: roleWith(["map.view", "management_map.view", "observation.view"])},
];

// A leading checkbox column enabling row multi-select (select-all header + per-row checkbox).
function selectColumn<T>(): ColumnDef<T> {
	return {
		id: "select",
		enableSorting: false,
		meta: {cellClassName: "wwc:w-px wwc:pr-0"},
		header: ({table}) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
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
	};
}

function makeRoleColumns(onOpen: (r: Role) => void): ColumnDef<Role>[] {
	return [
		{
			accessorKey: "name",
			header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
			cell: ({row}) => (
				<button
					type="button"
					onClick={() => onOpen(row.original)}
					className="wwc:text-left wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
				>
					{row.original.name}
				</button>
			),
		},
		{
			id: "actions",
			enableSorting: false,
			meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:overflow-visible wwc:whitespace-nowrap wwc:text-right"},
			cell: ({row}) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" icon aria-label="Row actions" className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground">
							<MoreHorizontal className="wwc:h-4 wwc:w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="wwc:w-48">
						<DropdownMenuItem onClick={() => onOpen(row.original)}>
							<Eye className="wwc:h-4 wwc:w-4" />
							Edit role
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}

// Read-only dialog showing a role's granted permissions (opened from a user's role badge).
function RolePermissionsDialog({role, onOpenChange}: {role: Role | null; onOpenChange: (open: boolean) => void}) {
	return (
		<Dialog open={!!role} onOpenChange={onOpenChange}>
			<DialogContent className="wwc:max-w-4xl">
				<DialogHeader>
					<DialogTitle>{role?.name} permissions</DialogTitle>
					<DialogDescription>Read-only view of what this role can access.</DialogDescription>
				</DialogHeader>
				{role && (
					<div className="wwc:max-h-[60vh] wwc:overflow-auto wwc:px-4 wwc:py-4">
						<PermissionMatrix categories={PERMISSION_CATALOG} value={role.permissions} readOnly showHeader={false} />
					</div>
				)}
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function RoleForm({
	mode,
	role,
	name,
	onName,
	nameError,
	perms,
	onPermissionsChange,
	onBack,
}: {
	mode: "edit" | "create";
	role: Role | null;
	name: string;
	onName: (value: string) => void;
	nameError: boolean;
	perms: Record<string, boolean>;
	onPermissionsChange: (next: Record<string, boolean>) => void;
	onBack: () => void;
}) {
	return (
		<div className="wwc:space-y-6">
			<Button variant="ghost" size="sm" onClick={onBack} className="wwc:-ml-2">
				<ChevronLeft className="wwc:h-4 wwc:w-4" />
				Back to roles
			</Button>

			<div>
				<h1 className="wwc:text-2xl wwc:font-bold wwc:tracking-tight">{mode === "create" ? "New role" : role?.name}</h1>
				<p className="wwc:text-sm wwc:text-muted-foreground">
					{mode === "create" ? "Name the role and choose its permissions." : "Edit this role’s name and permissions."}
				</p>
			</div>

			<Card className="wwc:shadow-none">
				<CardHeader className="wwc:pb-2">
					<CardTitle className="wwc:text-base">Role details</CardTitle>
					<CardDescription>Name and metadata for this role.</CardDescription>
				</CardHeader>
				<CardContent>
					<PropertyList labelWidth="12rem">
						<PropertyRow label="Role name" required align="start">
							<div className="wwc:ml-auto wwc:w-full wwc:max-w-sm">
								<Input
									value={name}
									onChange={(e) => onName(e.target.value)}
									placeholder="Role name"
									aria-invalid={nameError}
									className={cn("wwc:w-full", nameError && "wwc:border-destructive wwc:focus-visible:ring-destructive")}
								/>
								{nameError && <p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">Role name is required.</p>}
							</div>
						</PropertyRow>
					</PropertyList>
				</CardContent>
			</Card>

			<PermissionMatrix categories={PERMISSION_CATALOG} value={perms} onValueChange={onPermissionsChange} />
		</div>
	);
}

function PermissionsView({onOpen}: {onOpen: (r: Role) => void}) {
	const columns = useMemo(() => makeRoleColumns(onOpen), [onOpen]);

	return (
		<DataTable
			columns={columns}
			data={ROLES}
			searchKey="name"
			searchPlaceholder="Search roles…"
			recordLabel="role"
			pageSize={10}
		/>
	);
}

// ── Home / Organization ──

type Org = {
	id: string;
	name: string;
	location: string;
	logo: string | null;
	country: string;
	projects: number;
	status: "Active" | "Archived";
};

const INITIAL_ORGS: Org[] = [
	{
		id: "o1",
		name: "Saudi Aramco",
		location: "Dhahran, Saudi Arabia",
		logo: ARAMCO_LOGO,
		country: "Saudi Arabia",
		projects: 14,
		status: "Active",
	},
	{
		id: "o2",
		name: "NEOM",
		location: "Tabuk, Saudi Arabia",
		logo: NEOM_LOGO,
		country: "Saudi Arabia",
		projects: 9,
		status: "Active",
	},
	{
		id: "o3",
		name: "Roshn",
		location: "Riyadh, Saudi Arabia",
		logo: ROSHN_LOGO,
		country: "Saudi Arabia",
		projects: 6,
		status: "Active",
	},
	{
		id: "o4",
		name: "Qiddiya",
		location: "Riyadh, Saudi Arabia",
		logo: QIDDIYA_LOGO,
		country: "Saudi Arabia",
		projects: 4,
		status: "Active",
	},
	{
		id: "o5",
		name: "Diriyah Gate",
		location: "Diriyah, Saudi Arabia",
		logo: DIRIYAH_LOGO,
		country: "Saudi Arabia",
		projects: 7,
		status: "Archived",
	},
	{
		id: "o6",
		name: "The Red Sea",
		location: "Umluj, Saudi Arabia",
		logo: RED_SEA_LOGO,
		country: "Saudi Arabia",
		projects: 5,
		status: "Archived",
	},
];

const orgInitials = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0])
		.join("")
		.toUpperCase();

function OrgLogo({org, className}: {org: Org; className?: string}) {
	if (org.logo) {
		return (
			<div
				className={cn(
					"wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-center wwc:overflow-hidden wwc:rounded-xl wwc:border wwc:border-border wwc:bg-white wwc:p-2",
					className,
				)}
			>
				<img src={org.logo} alt={org.name} className="wwc:h-full wwc:w-full wwc:object-contain" />
			</div>
		);
	}
	return (
		<div
			className={cn(
				"wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-xl wwc:bg-primary/10 wwc:font-semibold wwc:text-primary",
				className,
			)}
		>
			{orgInitials(org.name)}
		</div>
	);
}

// A modal to change the org name and logo — reads the current org each time it opens.
function EditOrgDialog({
	org,
	onSave,
}: {
	org: Org;
	onSave: (patch: {name: string; country: string; logo: string | null}) => void;
}) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(org.name);
	const [country, setCountry] = useState(org.country);
	const [logo, setLogo] = useState<string | null>(org.logo);
	const [errors, setErrors] = useState<{name?: string; country?: string; logo?: string}>({});
	const fileRef = useRef<HTMLInputElement>(null);

	const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		if (!["image/png", "image/jpeg"].includes(file.type)) {
			setErrors((p) => ({...p, logo: "Only PNG, JPG and JPEG are allowed."}));
			return;
		}
		if (file.size > 1024 * 1024) {
			setErrors((p) => ({...p, logo: "Max size allowed is 1MB."}));
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			setLogo(typeof reader.result === "string" ? reader.result : null);
			setErrors((p) => ({...p, logo: undefined}));
		};
		reader.readAsDataURL(file);
	};

	const submit = () => {
		const errs: {name?: string; country?: string} = {};
		if (!name.trim()) errs.name = "Organization name is required.";
		if (!country) errs.country = "Country is required.";
		if (errs.name || errs.country) {
			setErrors((p) => ({...p, ...errs}));
			return;
		}
		onSave({name: name.trim(), country, logo});
		setOpen(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (o) {
					setName(org.name);
					setCountry(org.country);
					setLogo(org.logo);
					setErrors({});
				}
				setOpen(o);
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Pencil className="wwc:h-4 wwc:w-4" />
					Edit
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit organization</DialogTitle>
					<DialogDescription>Update the organization name, country and logo.</DialogDescription>
				</DialogHeader>
				<div className="wwc:space-y-5 wwc:px-4 wwc:py-4">
					<div className="wwc:flex wwc:items-start wwc:gap-4">
						<OrgLogo org={{...org, name: name || org.name, logo}} className="wwc:h-16 wwc:w-16 wwc:text-lg" />
						<div className="wwc:space-y-1">
							<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
								<input
									type="file"
									accept="image/png,image/jpeg"
									ref={fileRef}
									onChange={onFile}
									className="wwc:hidden"
								/>
								<Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
									<Upload className="wwc:h-4 wwc:w-4" />
									Upload logo
								</Button>
								{logo && (
									<Button variant="ghost" size="sm" onClick={() => setLogo(null)}>
										Remove
									</Button>
								)}
							</div>
							{errors.logo ? (
								<p className="wwc:text-xs wwc:text-destructive">{errors.logo}</p>
							) : (
								<p className="wwc:text-xs wwc:text-muted-foreground">PNG, JPG or JPEG · max 1MB.</p>
							)}
						</div>
					</div>
					<div className="wwc:space-y-1.5">
						<Label required>Organization name</Label>
						<Input
							value={name}
							onChange={(e) => {
								setName(e.target.value);
								if (e.target.value.trim()) setErrors((p) => ({...p, name: undefined}));
							}}
							placeholder="Organization name"
							aria-invalid={!!errors.name}
							className={cn(errors.name && "wwc:border-destructive wwc:focus-visible:ring-destructive")}
						/>
						{errors.name && <p className="wwc:text-xs wwc:text-destructive">{errors.name}</p>}
					</div>
					<div className="wwc:space-y-1.5">
						<Label required>Country</Label>
						<div className={cn(errors.country && "wwc:rounded-md wwc:ring-1 wwc:ring-destructive")}>
							<FieldSelect
								value={country}
								onChange={(v) => {
									setCountry(v);
									if (v) setErrors((p) => ({...p, country: undefined}));
								}}
								placeholder="Select country"
								options={COUNTRIES}
								triggerClassName="wwc:w-full"
							/>
						</div>
						{errors.country && <p className="wwc:text-xs wwc:text-destructive">{errors.country}</p>}
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button onClick={submit}>Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// The Core brand mark (same glyph as the app sidebar), for the standalone organizations page.
function WakeMark({className}: {className?: string}) {
	return (
		<svg
			viewBox="0 0 278.78 176.15"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			fill="currentColor"
			className={className}
		>
			<path d="M65.58,4.66l21.91,30.92,20.8-31.16,62.09-.03,21.5,31.2s21.05-31.2,21.21-31.2h62.08v62.09s-52.28,105.07-52.28,105.07l-62.09-.05-21.48-30.97-21.05,31.02h-62.09S3.49,66.77,3.49,66.77V4.67h62.09Z" />
		</svg>
	);
}

// Create-organization dialog (name + country + admin-invite email + logo).
function AddOrgDialog({
	onCreate,
}: {
	onCreate: (data: {name: string; country: string; adminEmail: string; logo: string | null}) => void;
}) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [country, setCountry] = useState("");
	const [adminEmail, setAdminEmail] = useState("");
	const [logo, setLogo] = useState<string | null>(null);
	// Inline validation messages, keyed by field ("" / undefined = valid).
	const [errors, setErrors] = useState<{name?: string; country?: string; email?: string; logo?: string}>({});
	const fileRef = useRef<HTMLInputElement>(null);

	const reset = () => {
		setName("");
		setCountry("");
		setAdminEmail("");
		setLogo(null);
		setErrors({});
	};
	const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		// Logo restrictions: PNG / JPG / JPEG, max 1MB.
		if (!["image/png", "image/jpeg"].includes(file.type)) {
			setLogo(null);
			setErrors((p) => ({...p, logo: "Only PNG, JPG and JPEG are allowed."}));
			return;
		}
		if (file.size > 1024 * 1024) {
			setLogo(null);
			setErrors((p) => ({...p, logo: "Max size allowed is 1MB."}));
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			setLogo(typeof reader.result === "string" ? reader.result : null);
			setErrors((p) => ({...p, logo: undefined}));
		};
		reader.readAsDataURL(file);
	};
	const submit = () => {
		const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const errs: {name?: string; country?: string; email?: string} = {};
		if (!name.trim()) errs.name = "Organization name is required.";
		if (!country) errs.country = "Country is required.";
		if (!adminEmail.trim()) errs.email = "Admin email is required.";
		else if (!emailRe.test(adminEmail.trim())) errs.email = "Enter a valid email address.";
		if (errs.name || errs.country || errs.email) {
			setErrors((p) => ({...p, ...errs}));
			return;
		}
		onCreate({name: name.trim(), country, adminEmail: adminEmail.trim(), logo});
		setOpen(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (o) reset();
				setOpen(o);
			}}
		>
			<DialogTrigger asChild>
				<Button size="sm">
					<Plus className="wwc:h-4 wwc:w-4" />
					Add organization
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add organization</DialogTitle>
					<DialogDescription>Create a new organization and invite its admin.</DialogDescription>
				</DialogHeader>
				<div className="wwc:space-y-5 wwc:px-4 wwc:py-4">
					<div className="wwc:flex wwc:items-start wwc:gap-4">
						<OrgLogo
							org={{id: "", name: name || "New", location: "", country: "", logo, projects: 0, status: "Active"}}
							className="wwc:h-16 wwc:w-16 wwc:text-lg"
						/>
						<div className="wwc:space-y-1">
							<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
								<input
									type="file"
									accept="image/png,image/jpeg"
									ref={fileRef}
									onChange={onFile}
									className="wwc:hidden"
								/>
								<Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
									<Upload className="wwc:h-4 wwc:w-4" />
									Upload logo
								</Button>
								{logo && (
									<Button variant="ghost" size="sm" onClick={() => setLogo(null)}>
										Remove
									</Button>
								)}
							</div>
							{errors.logo ? (
								<p className="wwc:text-xs wwc:text-destructive">{errors.logo}</p>
							) : (
								<p className="wwc:text-xs wwc:text-muted-foreground">PNG, JPG or JPEG · max 1MB.</p>
							)}
						</div>
					</div>
					<div className="wwc:space-y-1.5">
						<Label required>Organization name</Label>
						<Input
							value={name}
							onChange={(e) => {
								setName(e.target.value);
								if (e.target.value.trim()) setErrors((p) => ({...p, name: undefined}));
							}}
							placeholder="Organization name"
							aria-invalid={!!errors.name}
							className={cn(errors.name && "wwc:border-destructive wwc:focus-visible:ring-destructive")}
						/>
						{errors.name && <p className="wwc:text-xs wwc:text-destructive">{errors.name}</p>}
					</div>
					<div className="wwc:space-y-1.5">
						<Label required>Country</Label>
						<div className={cn(errors.country && "wwc:rounded-md wwc:ring-1 wwc:ring-destructive")}>
							<FieldSelect
								value={country}
								onChange={(v) => {
									setCountry(v);
									if (v) setErrors((p) => ({...p, country: undefined}));
								}}
								placeholder="Select country"
								options={COUNTRIES}
								triggerClassName="wwc:w-full"
							/>
						</div>
						{errors.country && <p className="wwc:text-xs wwc:text-destructive">{errors.country}</p>}
					</div>
					<div className="wwc:space-y-1.5">
						<Label required>Admin email</Label>
						<Input
							type="email"
							value={adminEmail}
							onChange={(e) => {
								setAdminEmail(e.target.value);
								if (e.target.value.trim()) setErrors((p) => ({...p, email: undefined}));
							}}
							placeholder="admin@company.com"
							aria-invalid={!!errors.email}
							className={cn(errors.email && "wwc:border-destructive wwc:focus-visible:ring-destructive")}
						/>
						{errors.email && <p className="wwc:text-xs wwc:text-destructive">{errors.email}</p>}
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button onClick={submit}>Add organization</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Loading placeholder for an org card (shown while the list "fetches").
function OrgCardSkeleton() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-5">
			<div className="wwc:flex wwc:items-start wwc:justify-between">
				<Skeleton className="wwc:h-14 wwc:w-14 wwc:rounded-xl" />
				<Skeleton className="wwc:h-7 wwc:w-7 wwc:rounded-md" />
			</div>
			<div className="wwc:space-y-2">
				<Skeleton className="wwc:h-4 wwc:w-32" />
				<Skeleton className="wwc:h-3 wwc:w-40" />
			</div>
			<Skeleton className="wwc:h-5 wwc:w-24 wwc:rounded-full" />
		</div>
	);
}

function OrgCard({
	org,
	onOpen,
	onArchive,
	onRestore,
}: {
	org: Org;
	onOpen: () => void;
	onArchive: () => void;
	onRestore: () => void;
}) {
	const archived = org.status === "Archived";
	return (
		<div
			role={archived ? undefined : "button"}
			tabIndex={archived ? undefined : 0}
			onClick={archived ? undefined : onOpen}
			onKeyDown={(e) => {
				if (!archived && (e.key === "Enter" || e.key === " ")) {
					e.preventDefault();
					onOpen();
				}
			}}
			className={cn(
				"wwc:group wwc:relative wwc:flex wwc:flex-col wwc:gap-4 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-5 wwc:text-left wwc:text-card-foreground wwc:transition-colors",
				archived ? "wwc:opacity-70" : "wwc:cursor-pointer wwc:hover:border-primary/40 wwc:hover:shadow-sm",
			)}
		>
			<div className="wwc:flex wwc:items-start wwc:justify-between">
				<OrgLogo org={org} className="wwc:h-14 wwc:w-14 wwc:text-base" />
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							icon
							aria-label="Organization actions"
							onClick={(e) => e.stopPropagation()}
							className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground"
						>
							<MoreHorizontal className="wwc:h-4 wwc:w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="wwc:w-44" onClick={(e) => e.stopPropagation()}>
						{archived ? (
							<DropdownMenuItem onClick={onRestore}>
								<ArchiveRestore className="wwc:h-4 wwc:w-4" />
								Restore
							</DropdownMenuItem>
						) : (
							<>
								<DropdownMenuItem onClick={onOpen}>
									<ArrowRight className="wwc:h-4 wwc:w-4" />
									Open
								</DropdownMenuItem>
								<DropdownMenuItem onClick={onArchive} className="wwc:text-destructive focus:wwc:text-destructive">
									<Archive className="wwc:h-4 wwc:w-4" />
									Archive
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="wwc:min-w-0">
				<h3 className="wwc:truncate wwc:text-base wwc:font-semibold">{org.name}</h3>
				<p className="wwc:mt-1 wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-sm wwc:text-muted-foreground">
					<MapPin className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0" />
					<span className="wwc:truncate">{org.location}</span>
				</p>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Badge variant="neutralSoft">{org.projects} projects</Badge>
				{archived && <Badge variant="warningSoft">Archived</Badge>}
			</div>
		</div>
	);
}

const ORG_STATUS_TABS = ["Active", "Archived"] as const;

// Standalone "all organizations" page — only a Core-branded top bar (logo + back), then org cards + add.
function AllOrganizationsView({
	orgs,
	onSelectOrg,
	onBack,
	onCreateOrg,
	onArchiveOrg,
	onRestoreOrg,
}: {
	orgs: Org[];
	onSelectOrg: (id: string) => void;
	onBack: () => void;
	onCreateOrg: (data: {name: string; country: string; adminEmail: string; logo: string | null}) => void;
	onArchiveOrg: (id: string) => void;
	onRestoreOrg: (id: string) => void;
}) {
	const [statusTab, setStatusTab] = useState<(typeof ORG_STATUS_TABS)[number]>("Active");
	const [query, setQuery] = useState("");
	const [pendingArchive, setPendingArchive] = useState<Org | null>(null);
	// Simulate a fetch so the cards show core skeletons while "loading" (re-runs on tab change).
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		setLoading(true);
		const t = setTimeout(() => setLoading(false), 700);
		return () => clearTimeout(t);
	}, [statusTab]);
	const filtered = orgs.filter(
		(o) => o.status === statusTab && o.name.toLowerCase().includes(query.trim().toLowerCase()),
	);

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:flex-col wwc:bg-background wwc:text-foreground">
			{/* Top nav — Core logo + back to the admin panel. No sidebar. */}
			<header className="wwc:flex wwc:h-14 wwc:shrink-0 wwc:items-center wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-card wwc:px-4 wwc:text-card-foreground">
				<Button variant="ghost" size="sm" onClick={onBack} className="wwc:-ml-1">
					<ChevronLeft className="wwc:h-4 wwc:w-4" />
					Back
				</Button>
				<div className="wwc:h-5 wwc:w-px wwc:bg-border" />
				<WakeMark className="wwc:h-5 wwc:w-auto wwc:text-foreground" />
				<span className="wwc:text-sm wwc:font-semibold">Core</span>
			</header>

			<main className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:p-6">
				<div className="wwc:mx-auto wwc:max-w-[1200px] wwc:space-y-6">
					<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
						<div>
							<h1 className="wwc:text-2xl wwc:font-bold wwc:tracking-tight">Organizations</h1>
							<p className="wwc:text-sm wwc:text-muted-foreground">
								Select an organization to manage, or create a new one.
							</p>
						</div>
						<AddOrgDialog onCreate={onCreateOrg} />
					</div>

					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:justify-between wwc:gap-3">
						<Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as (typeof ORG_STATUS_TABS)[number])}>
							<TabsList>
								{ORG_STATUS_TABS.map((t) => (
									<TabsTrigger key={t} value={t}>
										{t}
										<span className="wwc:ml-1.5 wwc:text-muted-foreground">
											{orgs.filter((o) => o.status === t).length}
										</span>
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
						<div className="wwc:relative wwc:w-full wwc:max-w-sm">
							<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-3.5 wwc:w-3.5 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
							<Input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search organizations…"
								className="wwc:pl-8"
							/>
						</div>
					</div>

					{loading ? (
						<div className="wwc:grid wwc:gap-4 wwc:sm:grid-cols-2 wwc:lg:grid-cols-3">
							{Array.from({length: 6}).map((_, i) => (
								<OrgCardSkeleton key={i} />
							))}
						</div>
					) : filtered.length === 0 ? (
						<Empty
							icon={<Building2 className="wwc:h-8 wwc:w-8" />}
							title={query ? "No matches found" : `No ${statusTab.toLowerCase()} organizations`}
							description={
								query
									? `No ${statusTab.toLowerCase()} organizations match “${query}”. Try a different search.`
									: statusTab === "Active"
										? "Create your first organization to get started."
										: "Archived organizations will appear here."
							}
							action={!query && statusTab === "Active" ? <AddOrgDialog onCreate={onCreateOrg} /> : undefined}
						/>
					) : (
						<div className="wwc:grid wwc:gap-4 wwc:sm:grid-cols-2 wwc:lg:grid-cols-3">
							{filtered.map((o) => (
								<OrgCard
									key={o.id}
									org={o}
									onOpen={() => onSelectOrg(o.id)}
									onArchive={() => setPendingArchive(o)}
									onRestore={() => onRestoreOrg(o.id)}
								/>
							))}
						</div>
					)}
				</div>
			</main>

			<ConfirmDialog
				open={!!pendingArchive}
				title="Archive organization?"
				description={
					<>
						This will archive <span className="wwc:font-medium wwc:text-foreground">{pendingArchive?.name}</span> and
						all its projects. You can restore it later from the Archived tab.
					</>
				}
				confirmLabel="Archive"
				destructive
				onOpenChange={(o) => !o && setPendingArchive(null)}
				onConfirm={() => {
					if (pendingArchive) onArchiveOrg(pendingArchive.id);
					setPendingArchive(null);
				}}
			/>
		</div>
	);
}

function HomeView({
	org,
	onGoProjects,
	onGoUsers,
	onSaveOrg,
}: {
	org: Org;
	onGoProjects: () => void;
	onGoUsers: () => void;
	onSaveOrg: (patch: {name: string; country: string; logo: string | null}) => void;
}) {
	const stats: {label: string; count: number; icon: typeof FolderKanban; onClick: () => void; cta: string}[] = [
		{label: "Projects", count: PROJECTS.length, icon: FolderKanban, onClick: onGoProjects, cta: "View projects"},
		{label: "Users", count: USERS.length, icon: UsersIcon, onClick: onGoUsers, cta: "View users"},
	];

	return (
		<div className="wwc:space-y-6">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold wwc:leading-tight wwc:tracking-tight wwc:md:text-4xl">
					Welcome to
					<br />
					Organization Admin
				</h1>
				<p className="wwc:mt-2 wwc:text-sm wwc:text-muted-foreground">Overview of the selected organization.</p>
			</div>

			<Card className="wwc:shadow-none">
				<CardContent className="wwc:flex wwc:items-center wwc:gap-5 wwc:pt-6">
					<OrgLogo org={org} className="wwc:h-20 wwc:w-20 wwc:text-2xl" />
					<div className="wwc:min-w-0 wwc:flex-1">
						<h2 className="wwc:truncate wwc:text-xl wwc:font-semibold">{org.name}</h2>
						<p className="wwc:mt-1 wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-sm wwc:text-muted-foreground">
							<MapPin className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
							{org.location}
						</p>
					</div>
					<EditOrgDialog org={org} onSave={onSaveOrg} />
				</CardContent>
			</Card>

			<div className="wwc:grid wwc:gap-4 wwc:sm:grid-cols-2">
				{stats.map((s) => (
					<button
						key={s.label}
						type="button"
						onClick={s.onClick}
						className="wwc:group wwc:flex wwc:flex-col wwc:gap-4 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-5 wwc:text-left wwc:text-card-foreground wwc:transition-colors wwc:hover:border-primary/40 wwc:hover:bg-muted/40"
					>
						<div className="wwc:flex wwc:items-start wwc:justify-between">
							<div className="wwc:flex wwc:h-10 wwc:w-10 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:bg-primary/10 wwc:text-primary">
								<s.icon className="wwc:h-5 wwc:w-5" />
							</div>
							<ArrowRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground wwc:transition-transform wwc:group-hover:translate-x-0.5" />
						</div>
						<div>
							<p className="wwc:text-2xl wwc:font-bold wwc:tracking-tight">{s.count}</p>
							<p className="wwc:text-sm wwc:text-muted-foreground">{s.label}</p>
						</div>
						<p className="wwc:text-sm wwc:font-medium wwc:text-primary">{s.cta} →</p>
					</button>
				))}
			</div>
		</div>
	);
}

// ── Delete confirmation ──

// Generic confirm-before-action modal (used for archiving, deactivation, role-edit, and similar).
function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel,
	destructive,
	onOpenChange,
	onConfirm,
}: {
	open: boolean;
	title: React.ReactNode;
	description: React.ReactNode;
	confirmLabel: string;
	destructive?: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className={destructive ? "wwc:bg-destructive wwc:text-white wwc:hover:bg-destructive/90" : undefined}
					>
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

// ── Shell ──

type Editing =
	| {surface: "projects"; mode: "edit" | "create"; project: Project | null}
	| {surface: "permissions"; mode: "edit" | "create"; role: Role | null}
	| {surface: "users"; mode: "edit" | "create"; user: User | null};

/**
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the CoreAdminPanel template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function AdminPanel() {
	const [active, setActive] = useState<TabId>("home");
	const [orgs, setOrgs] = useState<Org[]>(INITIAL_ORGS);
	const [activeOrgId, setActiveOrgId] = useState(INITIAL_ORGS[0].id);
	const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? orgs[0];
	// The standalone "all organizations" page (own top bar), overlaying the whole admin shell.
	const [showOrgs, setShowOrgs] = useState(false);
	// A single editor session — either a project or a role, in edit or create mode. Its draft state lives
	// here so the sticky save bar can float full-width over the whole content region.
	const [editing, setEditing] = useState<Editing | null>(null);
	// Project draft
	const [fields, setFields] = useState<ProjectFields>(EMPTY_FIELDS);
	const [fieldsBaseline, setFieldsBaseline] = useState<ProjectFields>(EMPTY_FIELDS);
	const [modules, setModules] = useState<Record<string, boolean>>(moduleDefaults);
	const [modulesBaseline, setModulesBaseline] = useState<Record<string, boolean>>(moduleDefaults);
	// Role draft
	const [roleName, setRoleName] = useState("");
	const [roleNameBaseline, setRoleNameBaseline] = useState("");
	const [perms, setPerms] = useState<Record<string, boolean>>(permDefaults);
	const [permsBaseline, setPermsBaseline] = useState<Record<string, boolean>>(permDefaults);
	// User draft
	const [userFields, setUserFields] = useState<UserFields>(EMPTY_USER);
	const [userFieldsBaseline, setUserFieldsBaseline] = useState<UserFields>(EMPTY_USER);
	// Set on a save attempt with missing required fields; drives the inline field errors (keyed by field name).
	const [errors, setErrors] = useState<Record<string, boolean>>({});
	// Editing a role affects all assigned users — confirm before committing.
	const [roleEditConfirm, setRoleEditConfirm] = useState(false);
	// Removing a linked person's project on a user edit unlinks them — confirm before committing.
	const [userSaveConfirm, setUserSaveConfirm] = useState(false);
	// Toasts need a <Toaster> in the DOM. Hosts like the web app already mount one; isolated hosts
	// (e.g. Studio's preview iframe) don't — so mount our own only when none exists, to avoid duplicates.
	const [ownToaster, setOwnToaster] = useState(false);
	useEffect(() => {
		// Sonner mounts a persistent <section aria-label="Notifications …"> region (the [data-sonner-toaster]
		// element only appears once a toast is live), so detect the region to know if a host Toaster exists.
		const hasHostToaster = document.querySelector(
			'[data-sonner-toaster], section[aria-live][aria-label*="Notification"]',
		);
		setOwnToaster(!hasHostToaster);
	}, []);
	const activeItem = NAV_ITEMS.find((i) => i.id === active) ?? NAV_ITEMS[0];

	// Only treat the editor as open when it matches the active tab (defensive — tab switches close it).
	const openEditor = editing && editing.surface === active ? editing : null;
	const entity = openEditor?.surface === "permissions" ? "role" : openEditor?.surface === "users" ? "user" : "project";

	const projectChangeCount =
		(Object.keys(fields) as (keyof ProjectFields)[]).filter((k) => fields[k] !== fieldsBaseline[k]).length +
		MODULES.filter((m) => modules[m.id] !== modulesBaseline[m.id]).length;
	const roleChangeCount =
		(roleName !== roleNameBaseline ? 1 : 0) + ALL_PERM_IDS.filter((id) => perms[id] !== permsBaseline[id]).length;
	const userChangeCount =
		(["email", "role", "mobile", "dialCode"] as const).filter((k) => userFields[k] !== userFieldsBaseline[k]).length +
		(userFields.projects.join("|") !== userFieldsBaseline.projects.join("|") ? 1 : 0) +
		(userFields.linkedPeople.join("|") !== userFieldsBaseline.linkedPeople.join("|") ? 1 : 0);
	const changeCount =
		openEditor?.surface === "permissions"
			? roleChangeCount
			: openEditor?.surface === "users"
				? userChangeCount
				: projectChangeCount;

	// Create mode always shows the bar (nothing to save yet, but the primary action lives there);
	// edit mode shows it only once there are unsaved changes.
	const showSaveBar = !!openEditor && (openEditor.mode === "create" || changeCount > 0);

	// An editor replaces the whole surface — hide the generic tab header while it's open.
	// Home renders its own header; the generic title/add-button header is for the list tabs only.
	const showTabHeader = !openEditor && active !== "home";

	const openEditProject = (p: Project) => {
		const f = fieldsFromProject(p);
		const mods = moduleDefaults();
		setFields(f);
		setFieldsBaseline(f);
		setModules(mods);
		setModulesBaseline(mods);
		setErrors({});
		setEditing({surface: "projects", mode: "edit", project: p});
	};
	const openCreateProject = () => {
		const mods = moduleDefaults();
		setFields(EMPTY_FIELDS);
		setFieldsBaseline(EMPTY_FIELDS);
		setModules(mods);
		setModulesBaseline(mods);
		setErrors({});
		setEditing({surface: "projects", mode: "create", project: null});
	};
	const openEditRole = (r: Role) => {
		setRoleName(r.name);
		setRoleNameBaseline(r.name);
		setPerms({...r.permissions});
		setPermsBaseline({...r.permissions});
		setErrors({});
		setEditing({surface: "permissions", mode: "edit", role: r});
	};
	const openCreateRole = () => {
		const d = permDefaults();
		setRoleName("");
		setRoleNameBaseline("");
		setPerms(d);
		setPermsBaseline({...d});
		setErrors({});
		setEditing({surface: "permissions", mode: "create", role: null});
	};
	const openEditUser = (u: User) => {
		const f = fieldsFromUser(u);
		setUserFields(f);
		setUserFieldsBaseline({...f, projects: [...f.projects], linkedPeople: [...f.linkedPeople]});
		setErrors({});
		setEditing({surface: "users", mode: "edit", user: u});
	};
	const openCreateUser = () => {
		setUserFields(EMPTY_USER);
		setUserFieldsBaseline(EMPTY_USER);
		setErrors({});
		setEditing({surface: "users", mode: "create", user: null});
	};

	const closeEditor = () => {
		setEditing(null);
		setErrors({});
	};
	const clearError = (key: string) => setErrors((prev) => (prev[key] ? {...prev, [key]: false} : prev));
	const setField = <K extends keyof ProjectFields>(key: K, value: ProjectFields[K]) => {
		setFields((prev) => ({...prev, [key]: value}));
		// Clear the inline error(s) tied to the edited field.
		setErrors((prev) => {
			const next = {...prev};
			if (key === "name") {
				next.name = false;
				next.nameDup = false;
			} else if (key === "country") next.country = false;
			else if (key === "timeZone") next.timeZone = false;
			else if (key === "contractDuration") next.duration = false;
			else if (key === "startDate") next.startDate = false;
			return next;
		});
	};
	const onRoleName = (value: string) => {
		setRoleName(value);
		if (value.trim()) clearError("name");
	};
	const setUserField = <K extends keyof UserFields>(key: K, value: UserFields[K]) => {
		setUserFields((prev) => ({...prev, [key]: value}));
		if (key === "email") {
			setErrors((prev) => ({...prev, email: false, emailInvalid: false, emailDup: false}));
		} else if (key === "projects" ? (value as string[]).length > 0 : String(value).trim() !== "") {
			clearError(key);
		}
	};
	const toggleModule = (id: string, value: boolean) => setModules((prev) => ({...prev, [id]: value}));
	const updatePermissions = (next: Record<string, boolean>) => setPerms(next);

	const draftName = () =>
		openEditor?.surface === "permissions" ? roleName : openEditor?.surface === "users" ? userFields.email : fields.name;
	const noun = entity === "role" ? "Role" : entity === "user" ? "User" : "Project";

	// Returns a map of invalid required fields, or null when everything required is present.
	const validate = (): Record<string, boolean> | null => {
		if (!openEditor) return null;
		const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (openEditor.surface === "users") {
			const email = userFields.email.trim();
			const e: Record<string, boolean> = {};
			if (!email) e.email = true;
			else if (!emailRe.test(email)) e.emailInvalid = true;
			// Duplicate-email check only applies to new users (email is read-only when editing).
			else if (openEditor.mode === "create" && USERS.some((u) => u.email.toLowerCase() === email.toLowerCase()))
				e.emailDup = true;
			if (!userFields.role) e.role = true;
			if (userFields.projects.length === 0) e.projects = true;
			return Object.keys(e).length ? e : null;
		}
		if (openEditor.surface === "projects") {
			const e: Record<string, boolean> = {};
			const nm = fields.name.trim();
			if (!nm) e.name = true;
			else if (
				PROJECTS.some(
					(pr) =>
						pr.name.trim().toLowerCase() === nm.toLowerCase() &&
						(openEditor.mode === "create" || pr.id !== openEditor.project?.id),
				)
			)
				e.nameDup = true;
			if (!fields.country) e.country = true;
			if (!fields.timeZone) e.timeZone = true;
			const dur = fields.contractDuration.trim();
			if (dur && (!/^\d+$/.test(dur) || Number(dur) <= 0)) e.duration = true;
			if (fields.startDate) {
				const start = parseDMY(fields.startDate);
				if (start) {
					const today = new Date();
					today.setHours(0, 0, 0, 0);
					start.setHours(0, 0, 0, 0);
					if (start.getTime() > today.getTime()) e.startDate = true;
				}
			}
			return Object.keys(e).length ? e : null;
		}
		// Roles — name only.
		return draftName().trim() ? null : {name: true};
	};

	const save = () => {
		if (!openEditor) return;
		// Required fields are enforced in both create and edit — refuse the save and surface inline errors.
		const errs = validate();
		if (errs) {
			setErrors(errs);
			return;
		}
		if (openEditor.mode === "create") {
			const nm = draftName().trim();
			toast.success(`${noun} “${nm}” created`);
			setEditing(null);
			setErrors({});
			return;
		}
		// Editing a role affects every user assigned to it — confirm before committing.
		if (openEditor.surface === "permissions") {
			setRoleEditConfirm(true);
			return;
		}
		if (openEditor.surface === "projects") {
			setFieldsBaseline(fields);
			setModulesBaseline(modules);
			toast.success("Changes saved");
			setErrors({});
			return;
		}
		// Editing a user: if a project the linked person belongs to was removed, warn about unlinking first.
		const removedProject = userFieldsBaseline.projects.some((pr) => !userFields.projects.includes(pr));
		if (userFields.linkedPeople.length > 0 && removedProject) {
			setUserSaveConfirm(true);
			return;
		}
		commitUserEdit();
	};
	const commitUserEdit = () => {
		setUserFieldsBaseline({
			...userFields,
			projects: [...userFields.projects],
			linkedPeople: [...userFields.linkedPeople],
		});
		toast.success("Changes saved");
		setErrors({});
		setUserSaveConfirm(false);
	};
	const commitRoleEdit = () => {
		setRoleNameBaseline(roleName);
		setPermsBaseline({...perms});
		toast.success("Changes saved");
		setErrors({});
		setRoleEditConfirm(false);
	};
	const saveDraft = () => {
		const nm = draftName();
		toast.success(nm ? `Draft “${nm}” saved` : "Draft saved");
		setEditing(null);
	};
	const discard = () => {
		if (!openEditor) return;
		if (openEditor.mode === "create") {
			setEditing(null);
			return;
		}
		if (openEditor.surface === "projects") {
			setFields(fieldsBaseline);
			setModules(modulesBaseline);
		} else if (openEditor.surface === "permissions") {
			setRoleName(roleNameBaseline);
			setPerms({...permsBaseline});
		} else {
			setUserFields({
				...userFieldsBaseline,
				projects: [...userFieldsBaseline.projects],
				linkedPeople: [...userFieldsBaseline.linkedPeople],
			});
		}
		setErrors({});
	};

	const goToTab = (id: TabId) => {
		setEditing(null);
		setErrors({});
		setActive(id);
	};

	const addRecord = () => {
		if (active === "projects") openCreateProject();
		else if (active === "permissions") openCreateRole();
		else if (active === "users") openCreateUser();
	};

	const saveOrg = (patch: {name: string; country: string; logo: string | null}) => {
		setOrgs((prev) => prev.map((o) => (o.id === activeOrgId ? {...o, ...patch, location: patch.country} : o)));
		toast.success("Organization updated");
	};
	const createOrg = (data: {name: string; country: string; adminEmail: string; logo: string | null}) => {
		const id = `o${orgs.length + 1}`;
		const org: Org = {
			id,
			name: data.name,
			location: data.country || "—",
			country: data.country,
			logo: data.logo,
			projects: 0,
			status: "Active",
		};
		setOrgs((prev) => [org, ...prev]);
		setActiveOrgId(id);
		setShowOrgs(false);
		setActive("home");
		toast.success(`Organization “${data.name}” created`);
	};
	const archiveOrg = (id: string) => {
		const next = orgs.map((o) => (o.id === id ? {...o, status: "Archived" as const} : o));
		setOrgs(next);
		// If the archived org was the active one, switch to the first remaining active org.
		if (id === activeOrgId) {
			const firstActive = next.find((o) => o.status === "Active");
			if (firstActive) setActiveOrgId(firstActive.id);
		}
		toast.success("Organization archived");
	};
	const restoreOrg = (id: string) => {
		setOrgs((prev) => prev.map((o) => (o.id === id ? {...o, status: "Active"} : o)));
		toast.success("Organization restored");
	};

	// The organizations page is a full-screen overlay with its own top bar — render it instead of the shell.
	if (showOrgs) {
		return (
			<AllOrganizationsView
				orgs={orgs}
				onSelectOrg={(id) => {
					setActiveOrgId(id);
					setShowOrgs(false);
				}}
				onBack={() => setShowOrgs(false)}
				onCreateOrg={createOrg}
				onArchiveOrg={archiveOrg}
				onRestoreOrg={restoreOrg}
			/>
		);
	}

	const editorName = openEditor
		? openEditor.mode === "create"
			? `New ${entity}`
			: openEditor.surface === "projects"
				? openEditor.project?.name
				: openEditor.surface === "permissions"
					? openEditor.role?.name
					: openEditor.user?.name
		: null;
	const topBarLabel = openEditor ? `${activeItem.label} / ${editorName}` : activeItem.label;

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:bg-background wwc:text-foreground">
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={ADMIN_GROUPS}
				activeItemId={active}
				showSearch={false}
				showNotifications={false}
				orgs={orgs.filter((o) => o.status === "Active").map((o) => o.name)}
				activeOrg={activeOrg.name}
				activeOrgLogo={
					activeOrg.logo ? (
						<span className="wwc:flex wwc:h-5 wwc:w-5 wwc:items-center wwc:justify-center wwc:overflow-hidden wwc:rounded wwc:bg-white">
							<img src={activeOrg.logo} alt="" className="wwc:h-full wwc:w-full wwc:object-contain wwc:p-0.5" />
						</span>
					) : (
						<span className="wwc:flex wwc:h-5 wwc:w-5 wwc:items-center wwc:justify-center wwc:rounded wwc:bg-primary/10 wwc:text-[9px] wwc:font-semibold wwc:text-primary">
							{orgInitials(activeOrg.name)}
						</span>
					)
				}
				onOrgChange={(name) => {
					const next = orgs.find((o) => o.name === name);
					if (next) setActiveOrgId(next.id);
				}}
				onOrgViewAll={() => setShowOrgs(true)}
				onNavigate={(label) => {
					const item = NAV_ITEMS.find((i) => i.label === label);
					if (item) goToTab(item.id);
				}}
			/>

			<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
				<CoreAppTopBar activeLabel={topBarLabel} showProjectSwitcher={false} />

				<main className="wwc:relative wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-auto">
					<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1200px] wwc:flex-1 wwc:space-y-4 wwc:p-6">
						{showTabHeader && (
							<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
								<div>
									<h1 className="wwc:text-2xl wwc:font-bold wwc:tracking-tight">{activeItem.label}</h1>
									<p className="wwc:text-sm wwc:text-muted-foreground">
										{active === "projects" && "Every project in the organization and its status."}
										{active === "permissions" && "Roles and what each one is allowed to do."}
										{active === "users" && "People with access, their role, and status."}
									</p>
								</div>
								<Button size="sm" onClick={addRecord}>
									<Plus className="wwc:h-4 wwc:w-4" />
									{ADD_LABEL[active]}
								</Button>
							</div>
						)}
						{active === "home" && (
							<HomeView
								org={activeOrg}
								onGoProjects={() => goToTab("projects")}
								onGoUsers={() => goToTab("users")}
								onSaveOrg={saveOrg}
							/>
						)}
						{active === "projects" &&
							(openEditor?.surface === "projects" ? (
								<ProjectForm
									mode={openEditor.mode}
									project={openEditor.project}
									draft={fields}
									onField={setField}
									errors={errors}
									modules={modules}
									onToggleModule={toggleModule}
									onBack={closeEditor}
								/>
							) : (
								<ProjectsView onOpen={openEditProject} />
							))}
						{active === "permissions" &&
							(openEditor?.surface === "permissions" ? (
								<RoleForm
									mode={openEditor.mode}
									role={openEditor.role}
									name={roleName}
									onName={onRoleName}
									nameError={!!errors.name}
									perms={perms}
									onPermissionsChange={updatePermissions}
									onBack={closeEditor}
								/>
							) : (
								<PermissionsView onOpen={openEditRole} />
							))}
						{active === "users" &&
							(openEditor?.surface === "users" ? (
								<UserForm
									mode={openEditor.mode}
									user={openEditor.user}
									draft={userFields}
									onField={setUserField}
									errors={errors}
									onBack={closeEditor}
								/>
							) : (
								<UsersView onOpen={openEditUser} />
							))}
					</div>

					{/* Sticky save bar — a sibling of the padded content div, so it needs no negative margins. */}
					{showSaveBar && (
						<FormActionBar
							status={
								openEditor.mode === "create" ? (
									`New ${entity} — not saved yet`
								) : (
									<>
										<span className="wwc:font-medium wwc:text-foreground">{changeCount}</span> unsaved change
										{changeCount === 1 ? "" : "s"}
									</>
								)
							}
						>
							<Button variant="ghost" size="sm" onClick={discard}>
								Discard
							</Button>
							{openEditor.mode === "create" && (
								<Button variant="outline" size="sm" onClick={saveDraft}>
									Save as draft
								</Button>
							)}
							<Button size="sm" onClick={save} disabled={openEditor.mode === "edit" && changeCount === 0}>
								<Save className="wwc:h-4 wwc:w-4" />
								{openEditor.mode === "create" ? `Save ${entity}` : "Save changes"}
							</Button>
						</FormActionBar>
					)}
				</main>
			</div>

			<ConfirmDialog
				open={roleEditConfirm}
				title="Save role changes?"
				description="Updating this role affects all users assigned to it. Do you want to proceed?"
				confirmLabel="Save changes"
				onOpenChange={(o) => !o && setRoleEditConfirm(false)}
				onConfirm={commitRoleEdit}
			/>
			<ConfirmDialog
				open={userSaveConfirm}
				title="Save changes?"
				description={
					<>
						Removing project access will unlink{" "}
						<span className="wwc:font-medium wwc:text-foreground">
							{userFields.linkedPeople[0] ?? "the linked person"}
						</span>{" "}
						from this user. Do you want to proceed?
					</>
				}
				confirmLabel="Save changes"
				onOpenChange={(o) => !o && setUserSaveConfirm(false)}
				onConfirm={commitUserEdit}
			/>

			{ownToaster && <Toaster position="top-right" />}
		</div>
	);
}
