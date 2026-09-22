import {cn} from "@corensystem/core-utils";
import {AlertTriangle, ArrowLeft, ChevronDown, ChevronRight, Plus, Trash2} from "lucide-react";
import * as React from "react";

import {Badge} from "./badge";
import {Button} from "./button";
import {Card} from "./card";
import {ConfirmDialog} from "./confirm-dialog";
import {Dialog, DialogContent, DialogTitle} from "./dialog";
import {Input} from "./input";
import {Label} from "./label";
import {NEW_OBJECT_TYPE_ICONS} from "./object-type-wizard";
import {PropertyList, PropertyRow} from "./property-list";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select";
import {Sheet, SheetClose, SheetContent} from "./sheet";
import {toast} from "./sonner";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./table";
import {ToggleGroup, ToggleGroupItem} from "./toggle-group";
import {ViewTabBar} from "./view-tab-bar";

// ObjectTypeDetailSheet — the full object-type editor shown as a 3/4-width sheet when a row in the
// Object types table is clicked. Five tabs (Overview / Properties / Datasources / Instances /
// Metadata & lifecycle), composed entirely from Core primitives. Any edit reveals a sticky
// "unsaved changes" footer; Save keeps the edits and toasts, Discard reverts.

const SEGMENT_ON =
	"wwc:data-[state=on]:border-primary wwc:data-[state=on]:bg-primary/10 wwc:data-[state=on]:text-primary";

const COLORS = [
	"wwc:bg-sky-400",
	"wwc:bg-blue-500",
	"wwc:bg-indigo-500",
	"wwc:bg-violet-500",
	"wwc:bg-fuchsia-500",
	"wwc:bg-pink-500",
	"wwc:bg-red-500",
	"wwc:bg-orange-500",
	"wwc:bg-amber-500",
	"wwc:bg-lime-500",
	"wwc:bg-emerald-500",
	"wwc:bg-teal-500",
	"wwc:bg-slate-500",
	"wwc:bg-slate-900",
];

const ALL_GROUPS = ["People & Crews", "Compliance & Safety", "Access Control", "Sites & Projects", "Time & Attendance"];

const SHARED_PROPERTY_OPTIONS = [
	"Badge number",
	"Geo location",
	"Risk score",
	"Last seen at",
	"Contact phone",
	"Effective from",
	"Expires on",
];

// ─── Mock detail data (Worker exemplar) ──────────────────────────────────────

interface DetailProperty {
	name: string;
	apiName: string;
	baseType: string;
	flag?: "PK" | "title";
	required?: boolean;
	shared?: boolean;
	hints: string;
	formatting: string;
	typeClass?: string;
}

const PROPERTIES: DetailProperty[] = [
	{
		name: "Worker ID",
		apiName: "worker_id",
		baseType: "string",
		flag: "PK",
		required: true,
		hints: "searchable · sortable",
		formatting: "—",
		typeClass: "identifier",
	},
	{
		name: "Full name",
		apiName: "full_name",
		baseType: "string",
		flag: "title",
		required: true,
		hints: "searchable · sortable",
		formatting: "—",
	},
	{
		name: "Badge number",
		apiName: "badge_number",
		baseType: "string",
		shared: true,
		hints: "searchable · sortable",
		formatting: "resourceId",
		typeClass: "identifier",
	},
	{
		name: "Trade",
		apiName: "trade_id",
		baseType: "string",
		hints: "sortable",
		formatting: "—",
		typeClass: "external-ref",
	},
	{name: "Crew", apiName: "crew_id", baseType: "string", hints: "sortable", formatting: "—", typeClass: "external-ref"},
	{
		name: "Employer",
		apiName: "subcontractor_id",
		baseType: "string",
		hints: "sortable",
		formatting: "—",
		typeClass: "external-ref",
	},
	{
		name: "Employment status",
		apiName: "employment_status",
		baseType: "string",
		hints: "sortable",
		formatting: "— · 2 cond.",
	},
	{name: "Hire date", apiName: "hire_date", baseType: "date", hints: "sortable", formatting: "date"},
	{
		name: "Risk score",
		apiName: "risk_score",
		baseType: "double",
		shared: true,
		hints: "sortable · aggregatable",
		formatting: "number · 3 cond.",
		typeClass: "measurement",
	},
	{
		name: "Geo location",
		apiName: "geo_location",
		baseType: "geopoint",
		shared: true,
		hints: "sortable",
		formatting: "—",
		typeClass: "geo",
	},
	{
		name: "Last seen at",
		apiName: "last_seen_at",
		baseType: "timestamp",
		shared: true,
		hints: "sortable",
		formatting: "date",
		typeClass: "audit",
	},
	{
		name: "Certification status",
		apiName: "certification_status",
		baseType: "string",
		hints: "sortable",
		formatting: "— · 2 cond.",
	},
	{name: "Assignment status", apiName: "assignment_status", baseType: "string", hints: "sortable", formatting: "—"},
	{
		name: "Certifications held",
		apiName: "certifications_held",
		baseType: "integer",
		hints: "sortable · aggregatable",
		formatting: "number",
		typeClass: "measurement",
	},
];

interface DetailInstance {
	id: string;
	name: string;
	badge: string;
	trade: string;
	crew: string;
	employer: string;
	employment: string;
	hireDate: string;
	risk: number;
	certification: "Valid" | "Expired";
	assignment: string;
	certs: number;
}

const INSTANCES: DetailInstance[] = [
	{
		id: "W-1001",
		name: "Ahmed Al-Rashidi",
		badge: "WC-4411",
		trade: "TR-STEEL",
		crew: "CR-A",
		employer: "SUB-01",
		employment: "Active",
		hireDate: "02 Nov 2024",
		risk: 22,
		certification: "Valid",
		assignment: "Deployed",
		certs: 1,
	},
	{
		id: "W-1002",
		name: "Jorge Mendoza",
		badge: "WC-4412",
		trade: "TR-STEEL",
		crew: "CR-A",
		employer: "SUB-01",
		employment: "Active",
		hireDate: "10 Mar 2025",
		risk: 31,
		certification: "Valid",
		assignment: "Deployed",
		certs: 1,
	},
	{
		id: "W-1003",
		name: "Ravi Patel",
		badge: "WC-4413",
		trade: "TR-STEEL",
		crew: "CR-A",
		employer: "SUB-01",
		employment: "Active",
		hireDate: "10 Mar 2025",
		risk: 44,
		certification: "Valid",
		assignment: "Deployed",
		certs: 0,
	},
	{
		id: "W-1004",
		name: "Fatima Noor",
		badge: "WC-4420",
		trade: "TR-ELEC",
		crew: "CR-B",
		employer: "SUB-02",
		employment: "Active",
		hireDate: "17 Jun 2024",
		risk: 18,
		certification: "Valid",
		assignment: "Deployed",
		certs: 2,
	},
	{
		id: "W-1005",
		name: "Dmitri Ivanov",
		badge: "WC-4421",
		trade: "TR-ELEC",
		crew: "CR-B",
		employer: "SUB-02",
		employment: "Active",
		hireDate: "10 Mar 2025",
		risk: 39,
		certification: "Valid",
		assignment: "Deployed",
		certs: 1,
	},
	{
		id: "W-1006",
		name: "Chen Wei",
		badge: "WC-4422",
		trade: "TR-ELEC",
		crew: "CR-B",
		employer: "SUB-02",
		employment: "On leave",
		hireDate: "10 Mar 2025",
		risk: 27,
		certification: "Valid",
		assignment: "Deployed",
		certs: 0,
	},
	{
		id: "W-1007",
		name: "Omar Farouk",
		badge: "WC-4430",
		trade: "TR-CARP",
		crew: "CR-C",
		employer: "SUB-01",
		employment: "Active",
		hireDate: "20 Jan 2025",
		risk: 68,
		certification: "Expired",
		assignment: "Deployed",
		certs: 1,
	},
	{
		id: "W-1008",
		name: "Layla Hassan",
		badge: "WC-4431",
		trade: "TR-CARP",
		crew: "CR-C",
		employer: "SUB-01",
		employment: "Active",
		hireDate: "10 Mar 2025",
		risk: 21,
		certification: "Valid",
		assignment: "Deployed",
		certs: 1,
	},
	{
		id: "W-1009",
		name: "Samuel Okafor",
		badge: "WC-4432",
		trade: "TR-CARP",
		crew: "CR-C",
		employer: "SUB-01",
		employment: "Active",
		hireDate: "10 Mar 2025",
		risk: 35,
		certification: "Valid",
		assignment: "Deployed",
		certs: 0,
	},
	{
		id: "W-1010",
		name: "Priya Sharma",
		badge: "WC-4440",
		trade: "TR-SCAF",
		crew: "CR-D",
		employer: "SUB-03",
		employment: "Active",
		hireDate: "10 Mar 2025",
		risk: 52,
		certification: "Expired",
		assignment: "Deployed",
		certs: 2,
	},
	{
		id: "W-1011",
		name: "Tom Becker",
		badge: "WC-4441",
		trade: "TR-SCAF",
		crew: "CR-D",
		employer: "SUB-03",
		employment: "Active",
		hireDate: "01 Sep 2023",
		risk: 24,
		certification: "Valid",
		assignment: "Deployed",
		certs: 1,
	},
	{
		id: "W-1012",
		name: "Aisha Diallo",
		badge: "WC-4450",
		trade: "TR-HSE",
		crew: "—",
		employer: "—",
		employment: "Active",
		hireDate: "14 Feb 2024",
		risk: 12,
		certification: "Valid",
		assignment: "Bench",
		certs: 1,
	},
];

interface DetailDatasource {
	kind: "DATASET" | "STREAM";
	name: string;
	columns: string[];
	duplicateKeys?: boolean;
}

const DATASOURCES: DetailDatasource[] = [
	{
		kind: "DATASET",
		name: "hr_roster_daily_sync",
		columns: [
			"worker_id",
			"full_name",
			"badge_number",
			"trade_id",
			"crew_id",
			"subcontractor_id",
			"employment_status",
			"hire_date",
		],
		duplicateKeys: true,
	},
	{kind: "STREAM", name: "badge_swipe_event_stream", columns: ["event_id", "badge_number", "zone_code", "swiped_at"]},
];

const IMPLEMENTS = [
	{name: "Trackable", mapped: "2 properties mapped"},
	{name: "Certifiable", mapped: "1 property mapped"},
	{name: "Assignable", mapped: "1 property mapped"},
];

const LINK_TYPES = [
	{cardinality: "one-to-one", label: "Crew → Worker"},
	{cardinality: "one-to-one", label: "Crew → Worker"},
	{cardinality: "many-to-one", label: "Worker → Trade"},
	{cardinality: "one-to-many", label: "Worker → Certification"},
	{cardinality: "many-to-many", label: "Worker → Access zone"},
	{cardinality: "many-to-one", label: "Safety observation → Worker"},
	{cardinality: "many-to-one", label: "Worker → Subcontractor"},
	{cardinality: "many-to-one", label: "Timesheet entry → Worker"},
];

const STATUSES = ["Active", "Experimental", "Deprecated", "Endorsed"];
const VISIBILITIES = ["Prominent", "Normal", "Hidden"];

// ─── Small building blocks ───────────────────────────────────────────────────

function SectionCard({title, count, children}: {title: string; count?: number; children: React.ReactNode}) {
	return (
		<Card className="wwc:p-5">
			<h3 className="wwc:mb-4 wwc:text-base wwc:font-semibold">
				{title}
				{count != null ? <span className="wwc:text-muted-foreground"> ({count})</span> : null}
			</h3>
			{children}
		</Card>
	);
}

function FieldLabel({children}: {children: React.ReactNode}) {
	return (
		<span className="wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
			{children}
		</span>
	);
}

export interface ObjectTypeDetailInput {
	name: string;
	plural: string;
	apiName: string;
	layer: string;
	status: string;
	visibility: string;
	groups: string[];
	icon: React.ComponentType<{className?: string}>;
	indexed?: boolean;
	indexWarning?: boolean;
}

export interface ObjectTypeDetailSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	objectType: ObjectTypeDetailInput | null;
	/** Called when the object type is deleted from the Danger zone (after a confirmation). */
	onDelete?: (objectType: ObjectTypeDetailInput) => void;
}

const TABS = ["Overview", "Properties", "Datasources", "Instances", "Metadata & lifecycle"] as const;
type DetailTab = (typeof TABS)[number];

/** Full object-type editor rendered as a 3/4-width sheet. */
export function ObjectTypeDetailSheet({open, onOpenChange, objectType, onDelete}: ObjectTypeDetailSheetProps) {
	const [tab, setTab] = React.useState<DetailTab>("Overview");
	const [dirty, setDirty] = React.useState(false);
	const [implementOpen, setImplementOpen] = React.useState(false);
	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const markDirty = () => setDirty(true);

	// Editable metadata state, seeded from the object each time the sheet opens.
	const [displayName, setDisplayName] = React.useState("");
	const [plural, setPlural] = React.useState("");
	const [apiName, setApiName] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [status, setStatus] = React.useState("");
	const [visibility, setVisibility] = React.useState("");
	const [groups, setGroups] = React.useState<string[]>([]);
	const [properties, setProperties] = React.useState<DetailProperty[]>([]);
	const [datasources, setDatasources] = React.useState<DetailDatasource[]>([]);
	const [primaryKey, setPrimaryKey] = React.useState("worker_id");
	const [titleKey, setTitleKey] = React.useState("full_name");
	const [iconIndex, setIconIndex] = React.useState(0);
	const [colorIndex, setColorIndex] = React.useState(1);
	const newPropCount = React.useRef(0);

	const seed = React.useCallback((o: ObjectTypeDetailInput) => {
		setDisplayName(o.name);
		setPlural(o.plural);
		setApiName(o.apiName);
		setDescription(
			"A badged individual working on a Core-instrumented site. One record per person across all rosters (HR sync).",
		);
		setStatus(o.status);
		setVisibility(o.visibility);
		setGroups(o.groups);
		setProperties(PROPERTIES);
		setDatasources(DATASOURCES);
		setPrimaryKey("worker_id");
		setTitleKey("full_name");
		setIconIndex(0);
		setColorIndex(1);
		newPropCount.current = 0;
		setDirty(false);
		setTab("Overview");
	}, []);

	const addProperty = () => {
		newPropCount.current += 1;
		const n = newPropCount.current;
		setProperties((prev) => [
			...prev,
			{name: `New property ${n}`, apiName: `new_property_${n}`, baseType: "string", hints: "sortable", formatting: "—"},
		]);
		markDirty();
	};
	const addSharedProperty = (name: string) => {
		setProperties((prev) => [
			...prev,
			{
				name,
				apiName: name.toLowerCase().replace(/\s+/g, "_"),
				baseType: "string",
				shared: true,
				hints: "sortable",
				formatting: "—",
			},
		]);
		markDirty();
	};
	const removeProperty = (api: string) => {
		setProperties((prev) => prev.filter((p) => p.apiName !== api));
		markDirty();
	};
	const detachDatasource = (name: string) => {
		setDatasources((prev) => prev.filter((d) => d.name !== name));
		markDirty();
	};

	// Seed once per object. We deliberately keep state across close/reopen of the SAME object so saved
	// (or in-progress) edits are preserved; opening a different object re-seeds from it.
	const seededFor = React.useRef<string | null>(null);
	React.useEffect(() => {
		if (open && objectType && seededFor.current !== objectType.apiName) {
			seededFor.current = objectType.apiName;
			seed(objectType);
		}
	}, [open, objectType, seed]);

	if (!objectType) return null;
	const Icon = objectType.icon;

	const save = () => {
		toast.success(`Object type “${displayName}” saved`);
		setDirty(false);
	};
	const discard = () => {
		seed(objectType);
	};

	const tabLabel = (t: DetailTab) =>
		t === "Properties"
			? `Properties (${properties.length})`
			: t === "Datasources"
				? `Datasources (${datasources.length})`
				: t === "Instances"
					? `Instances (${INSTANCES.length})`
					: t;

	return (
		<>
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent
					side="right"
					className="wwc:flex wwc:w-3/4 wwc:max-w-none wwc:flex-col wwc:gap-0 wwc:p-0 wwc:sm:max-w-none wwc:[&>button]:hidden"
				>
					{/* ── Header ── */}
					<div className="wwc:shrink-0 wwc:border-b wwc:border-border wwc:px-6 wwc:pt-5 wwc:pb-3">
						<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
							<div className="wwc:flex wwc:items-center wwc:gap-3">
								<span className="wwc:flex wwc:h-9 wwc:w-9 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:bg-muted wwc:text-muted-foreground">
									<Icon className="wwc:h-5 wwc:w-5" />
								</span>
								<h2 className="wwc:text-2xl wwc:font-bold wwc:tracking-tight">{displayName}</h2>
								<Badge className="wwc:h-6 wwc:rounded-md wwc:text-[11px] wwc:font-semibold">{objectType.layer}</Badge>
								<Badge
									variant="secondary"
									className="wwc:h-6 wwc:text-xs wwc:font-medium wwc:text-violet-600 wwc:dark:text-violet-400"
								>
									{status}
								</Badge>
								<Badge variant="outline" className="wwc:h-6 wwc:text-xs">
									{visibility}
								</Badge>
								{objectType.indexWarning ? (
									<span className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:text-xs wwc:font-medium wwc:text-amber-600 wwc:dark:text-amber-500">
										<AlertTriangle className="wwc:h-3.5 wwc:w-3.5" />
										duplicate PKs
									</span>
								) : null}
							</div>
							<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:text-xs wwc:text-muted-foreground">
								<span>
									Index:{" "}
									<span className="wwc:font-medium wwc:text-emerald-600 wwc:dark:text-emerald-400">
										{objectType.indexed === false ? "Not indexed" : "Indexed"}
									</span>{" "}
									· last sync 06:15
								</span>
								<SheetClose asChild>
									<Button variant="link" size="sm" className="wwc:h-auto wwc:gap-1 wwc:px-0">
										<ArrowLeft className="wwc:h-3.5 wwc:w-3.5" />
										All object types
									</Button>
								</SheetClose>
							</div>
						</div>
						<div className="wwc:mt-2 wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm wwc:text-muted-foreground">
							<code className="wwc:font-mono wwc:text-xs">ri.ontology.wc3.object-type.f871a4de-bd88</code>
							<Badge variant="secondary" className="wwc:h-5 wwc:font-mono wwc:text-[10px]">
								read-only RID
							</Badge>
							<span>· module wc3.core</span>
						</div>

						{/* Tabs — Core ViewTabBar (underline). */}
						<div className="wwc:mt-3 wwc:overflow-x-auto">
							<ViewTabBar
								tabs={TABS.map((t) => ({id: t, label: tabLabel(t)}))}
								activeTab={tab}
								onTabChange={(next) => setTab(next as DetailTab)}
							/>
						</div>
					</div>

					{/* ── Body ── */}
					<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:bg-muted/20 wwc:p-6">
						{tab === "Overview" ? (
							<div className="wwc:grid wwc:grid-cols-1 wwc:gap-6 wwc:lg:grid-cols-2">
								<SectionCard title="About">
									<div className="wwc:space-y-4">
										<div className="wwc:space-y-1.5">
											<FieldLabel>Description</FieldLabel>
											<Input
												value={description}
												onChange={(e) => {
													setDescription(e.target.value);
													markDirty();
												}}
											/>
										</div>
										<PropertyList labelWidth="10rem">
											<PropertyRow label="Primary key">
												<code className="wwc:font-mono wwc:text-xs">worker_id</code>
											</PropertyRow>
											<PropertyRow label="Title key">
												<code className="wwc:font-mono wwc:text-xs">full_name</code>
											</PropertyRow>
											<PropertyRow label="Datasources">hr_roster_daily_sync, badge_swipe_event_stream</PropertyRow>
											<PropertyRow label="Link types touching">9</PropertyRow>
										</PropertyList>
										<div className="wwc:space-y-2">
											<h4 className="wwc:text-sm wwc:font-semibold">Group membership</h4>
											<ToggleGroup
												type="multiple"
												value={groups}
												onValueChange={(v) => {
													setGroups(v);
													markDirty();
												}}
												variant="outline"
												size="sm"
												className="wwc:flex-wrap wwc:justify-start wwc:gap-2"
											>
												{ALL_GROUPS.map((g) => (
													<ToggleGroupItem key={g} value={g} className={cn("wwc:rounded-full", SEGMENT_ON)}>
														{g}
													</ToggleGroupItem>
												))}
											</ToggleGroup>
										</div>
									</div>
								</SectionCard>

								<div className="wwc:space-y-6">
									<SectionCard title="Implements" count={IMPLEMENTS.length}>
										<div className="wwc:space-y-2">
											{IMPLEMENTS.map((it) => (
												<div
													key={it.name}
													className="wwc:flex wwc:items-center wwc:justify-between wwc:rounded-lg wwc:border wwc:border-border wwc:px-3 wwc:py-2"
												>
													<span className="wwc:text-sm">
														<span className="wwc:font-medium wwc:text-primary">{it.name}</span>{" "}
														<span className="wwc:text-muted-foreground">{it.mapped}</span>
													</span>
													<Button variant="ghost" size="sm" onClick={markDirty}>
														Remove
													</Button>
												</div>
											))}
											<Button variant="outline" size="sm" onClick={() => setImplementOpen(true)}>
												<Plus className="wwc:h-4 wwc:w-4" />
												Implement an interface
											</Button>
										</div>
									</SectionCard>

									<div>
										<h3 className="wwc:mb-2 wwc:text-base wwc:font-semibold">Link types</h3>
										<div className="wwc:space-y-1.5">
											{LINK_TYPES.map((lt, i) => (
												<div key={`${lt.label}-${i}`} className="wwc:flex wwc:items-center wwc:gap-4 wwc:text-sm">
													<span className="wwc:w-28 wwc:shrink-0 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
														{lt.cardinality}
													</span>
													<span className="wwc:text-primary">{lt.label}</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						) : null}

						{tab === "Properties" ? (
							<div className="wwc:space-y-4">
								{objectType.indexWarning ? (
									<div className="wwc:rounded-lg wwc:border wwc:border-amber-500/30 wwc:bg-amber-500/10 wwc:p-3 wwc:text-sm wwc:text-amber-700 wwc:dark:text-amber-300">
										<span className="wwc:font-semibold">Duplicate primary keys detected</span> in
										“hr_roster_daily_sync”. Two synced rows share the same worker_id. Pick a compound key below or fix
										upstream.
									</div>
								) : null}
								<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
									<Button size="sm" onClick={addProperty}>
										<Plus className="wwc:h-4 wwc:w-4" />
										Add property
									</Button>
									<Select value="" onValueChange={addSharedProperty}>
										<SelectTrigger className="wwc:h-8 wwc:w-auto wwc:gap-2 wwc:text-sm">
											<SelectValue placeholder="+ From shared property…" />
										</SelectTrigger>
										<SelectContent>
											{SHARED_PROPERTY_OPTIONS.map((name) => (
												<SelectItem key={name} value={name}>
													{name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<div className="wwc:ml-auto wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
										<span className="wwc:text-xs wwc:text-muted-foreground">Primary key:</span>
										{properties.map((p) => (
											<button
												key={p.apiName}
												type="button"
												onClick={() => {
													setPrimaryKey(p.apiName);
													markDirty();
												}}
												className={cn(
													"wwc:rounded-full wwc:border wwc:px-2 wwc:py-0.5 wwc:font-mono wwc:text-[11px] wwc:transition-colors",
													p.apiName === primaryKey
														? "wwc:border-primary wwc:bg-primary/10 wwc:text-primary"
														: "wwc:border-border wwc:text-muted-foreground wwc:hover:bg-muted",
												)}
											>
												{p.apiName}
											</button>
										))}
										<Select
											value={titleKey}
											onValueChange={(v) => {
												setTitleKey(v);
												markDirty();
											}}
										>
											<SelectTrigger className="wwc:h-8 wwc:w-auto wwc:gap-2 wwc:text-sm">
												Title: <SelectValue />
											</SelectTrigger>
											<SelectContent>
												{properties.map((p) => (
													<SelectItem key={p.apiName} value={p.apiName}>
														{p.apiName}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="wwc:overflow-x-auto wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="wwc:w-6" />
												<TableHead>Property</TableHead>
												<TableHead>API name</TableHead>
												<TableHead>Base type</TableHead>
												<TableHead>Flags</TableHead>
												<TableHead>Hints</TableHead>
												<TableHead>Formatting</TableHead>
												<TableHead>Type classes</TableHead>
												<TableHead className="wwc:w-8" />
											</TableRow>
										</TableHeader>
										<TableBody>
											{properties.map((p) => {
												const flag = p.apiName === primaryKey ? "PK" : p.apiName === titleKey ? "title" : null;
												return (
													<TableRow key={p.apiName}>
														<TableCell className="wwc:text-muted-foreground">
															<ChevronRight className="wwc:h-4 wwc:w-4" />
														</TableCell>
														<TableCell className="wwc:font-semibold">
															<span className="wwc:flex wwc:items-center wwc:gap-2">
																{p.name}
																{p.shared ? (
																	<Badge variant="secondary" className="wwc:h-5 wwc:text-[10px]">
																		shared
																	</Badge>
																) : null}
															</span>
														</TableCell>
														<TableCell className="wwc:font-mono wwc:text-xs">{p.apiName}</TableCell>
														<TableCell>{p.baseType}</TableCell>
														<TableCell>
															{flag ? (
																<span className="wwc:flex wwc:items-center wwc:gap-1.5">
																	<Badge variant="secondary" className="wwc:h-5 wwc:text-[10px] wwc:text-primary">
																		{flag}
																	</Badge>
																	{flag === "PK" || p.required ? (
																		<span className="wwc:text-xs wwc:text-muted-foreground">required</span>
																	) : null}
																</span>
															) : (
																<span className="wwc:text-xs wwc:text-muted-foreground">optional</span>
															)}
														</TableCell>
														<TableCell className="wwc:text-xs wwc:text-muted-foreground">{p.hints}</TableCell>
														<TableCell className="wwc:text-xs wwc:text-muted-foreground">{p.formatting}</TableCell>
														<TableCell>
															{p.typeClass ? (
																<Badge variant="secondary" className="wwc:h-5 wwc:text-[10px]">
																	{p.typeClass}
																</Badge>
															) : null}
														</TableCell>
														<TableCell>
															<Button
																variant="ghost"
																size="sm"
																icon
																aria-label="Delete property"
																className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground"
																onClick={() => removeProperty(p.apiName)}
															>
																<Trash2 className="wwc:h-4 wwc:w-4" />
															</Button>
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</div>
							</div>
						) : null}

						{tab === "Datasources" ? (
							<div className="wwc:space-y-3">
								<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
									<Button variant="outline" size="sm" onClick={markDirty}>
										+ Attach datasource… <ChevronDown className="wwc:h-3.5 wwc:w-3.5" />
									</Button>
									<span className="wwc:text-xs wwc:text-muted-foreground">
										dataset · restricted view · stream · media set — multiple per type
									</span>
								</div>
								{datasources.map((ds) => (
									<Card key={ds.name} className="wwc:p-4">
										<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
											<div className="wwc:min-w-0">
												<div className="wwc:flex wwc:items-center wwc:gap-2">
													<Badge
														variant="secondary"
														className="wwc:h-5 wwc:text-[10px] wwc:font-semibold wwc:tracking-wide"
													>
														{ds.kind}
													</Badge>
													<span className="wwc:font-mono wwc:text-sm wwc:font-semibold">{ds.name}</span>
												</div>
												<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
													columns: {ds.columns.join(", ")}
												</p>
												{ds.duplicateKeys ? (
													<div className="wwc:mt-2 wwc:rounded-lg wwc:border wwc:border-amber-500/30 wwc:bg-amber-500/10 wwc:p-2 wwc:text-xs wwc:text-amber-700 wwc:dark:text-amber-300">
														<span className="wwc:font-semibold">Duplicate primary keys.</span> e.g. two rows share
														W-1001 after the daily re-sync. Resolve upstream or choose a compound key.
													</div>
												) : null}
											</div>
											<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
												<Select value="" onValueChange={markDirty}>
													<SelectTrigger className="wwc:h-8 wwc:w-auto wwc:gap-2 wwc:text-sm">
														<SelectValue placeholder="Swap…" />
													</SelectTrigger>
													<SelectContent>
														{["hr_roster_daily_sync", "badge_swipe_event_stream", "training_cert_registry"].map((n) => (
															<SelectItem key={n} value={n}>
																{n}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<Button
													variant="outline"
													size="sm"
													className="wwc:text-destructive"
													onClick={() => detachDatasource(ds.name)}
												>
													Detach
												</Button>
											</div>
										</div>
									</Card>
								))}
								<Card className="wwc:p-3 wwc:text-xs wwc:text-muted-foreground">
									Index status: <span className="wwc:font-medium wwc:text-foreground">Indexed</span> · last sync 06:15 —
									attaching or swapping triggers a re-sync.
								</Card>
							</div>
						) : null}

						{tab === "Instances" ? (
							<div className="wwc:overflow-x-auto wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Worker ID</TableHead>
											<TableHead>Full name</TableHead>
											<TableHead>Badge number</TableHead>
											<TableHead>Trade</TableHead>
											<TableHead>Crew</TableHead>
											<TableHead>Employer</TableHead>
											<TableHead>Employment status</TableHead>
											<TableHead>Hire date</TableHead>
											<TableHead>Risk score</TableHead>
											<TableHead>Certification status</TableHead>
											<TableHead>Assignment status</TableHead>
											<TableHead>Certs</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{INSTANCES.map((row) => (
											<TableRow key={row.id}>
												<TableCell className="wwc:font-medium">{row.id}</TableCell>
												<TableCell>{row.name}</TableCell>
												<TableCell className="wwc:font-mono wwc:text-xs">{row.badge}</TableCell>
												<TableCell>{row.trade}</TableCell>
												<TableCell>{row.crew}</TableCell>
												<TableCell>{row.employer}</TableCell>
												<TableCell
													className={
														row.employment === "Active"
															? "wwc:font-medium wwc:text-emerald-600 wwc:dark:text-emerald-400"
															: "wwc:font-medium wwc:text-amber-600 wwc:dark:text-amber-500"
													}
												>
													{row.employment}
												</TableCell>
												<TableCell>{row.hireDate}</TableCell>
												<TableCell
													className={cn(
														"wwc:font-medium wwc:tabular-nums",
														row.risk >= 60
															? "wwc:text-red-600 wwc:dark:text-red-400"
															: row.risk >= 40
																? "wwc:text-amber-600 wwc:dark:text-amber-500"
																: "wwc:text-emerald-600 wwc:dark:text-emerald-400",
													)}
												>
													{row.risk}
												</TableCell>
												<TableCell
													className={
														row.certification === "Valid"
															? "wwc:font-medium wwc:text-emerald-600 wwc:dark:text-emerald-400"
															: "wwc:font-medium wwc:text-red-600 wwc:dark:text-red-400"
													}
												>
													{row.certification}
												</TableCell>
												<TableCell>{row.assignment}</TableCell>
												<TableCell className="wwc:tabular-nums">{row.certs}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						) : null}

						{tab === "Metadata & lifecycle" ? (
							<div className="wwc:grid wwc:grid-cols-1 wwc:gap-6 wwc:lg:grid-cols-2">
								<SectionCard title="Names & appearance">
									<div className="wwc:space-y-4">
										<div className="wwc:space-y-1.5">
											<FieldLabel>Display name</FieldLabel>
											<Input
												value={displayName}
												onChange={(e) => {
													setDisplayName(e.target.value);
													markDirty();
												}}
											/>
										</div>
										<div className="wwc:space-y-1.5">
											<FieldLabel>Plural display name</FieldLabel>
											<Input
												value={plural}
												onChange={(e) => {
													setPlural(e.target.value);
													markDirty();
												}}
											/>
										</div>
										<div className="wwc:space-y-1.5">
											<FieldLabel>API name</FieldLabel>
											<Input
												value={apiName}
												onChange={(e) => {
													setApiName(e.target.value);
													markDirty();
												}}
											/>
										</div>
										<div className="wwc:space-y-2">
											<FieldLabel>Icon</FieldLabel>
											<div className="wwc:grid wwc:grid-cols-8 wwc:gap-2">
												{NEW_OBJECT_TYPE_ICONS.map((IconChoice, i) => (
													<button
														key={(IconChoice as {displayName?: string}).displayName ?? i}
														type="button"
														aria-label={`Icon ${i + 1}`}
														aria-pressed={i === iconIndex}
														onClick={() => {
															setIconIndex(i);
															markDirty();
														}}
														className={cn(
															"wwc:flex wwc:aspect-square wwc:items-center wwc:justify-center wwc:rounded-lg wwc:border wwc:transition-colors",
															i === iconIndex
																? "wwc:border-primary wwc:bg-primary/10 wwc:text-primary"
																: "wwc:border-border wwc:text-muted-foreground wwc:hover:bg-muted",
														)}
													>
														<IconChoice className="wwc:h-4 wwc:w-4" />
													</button>
												))}
											</div>
										</div>
										<div className="wwc:space-y-2">
											<FieldLabel>Color</FieldLabel>
											<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
												{COLORS.map((c, i) => (
													<button
														key={c}
														type="button"
														aria-label={`Color ${i + 1}`}
														aria-pressed={i === colorIndex}
														onClick={() => {
															setColorIndex(i);
															markDirty();
														}}
														className={cn(
															"wwc:h-7 wwc:w-7 wwc:rounded-lg wwc:ring-offset-2 wwc:ring-offset-background",
															c,
															i === colorIndex && "wwc:ring-2 wwc:ring-foreground",
														)}
													/>
												))}
											</div>
										</div>
									</div>
								</SectionCard>

								<div className="wwc:space-y-6">
									<SectionCard title="Lifecycle">
										<div className="wwc:space-y-4">
											<div className="wwc:space-y-1.5">
												<FieldLabel>Status</FieldLabel>
												<ToggleGroup
													type="single"
													value={status}
													onValueChange={(v) => {
														if (v) {
															setStatus(v);
															markDirty();
														}
													}}
													variant="outline"
													size="sm"
													className="wwc:justify-start"
												>
													{STATUSES.map((s) => (
														<ToggleGroupItem key={s} value={s} className={SEGMENT_ON}>
															{s}
														</ToggleGroupItem>
													))}
												</ToggleGroup>
												<p className="wwc:text-xs wwc:text-muted-foreground">
													Status pills follow the type everywhere it appears.
												</p>
											</div>
											<div className="wwc:space-y-1.5">
												<FieldLabel>Visibility</FieldLabel>
												<ToggleGroup
													type="single"
													value={visibility}
													onValueChange={(v) => {
														if (v) {
															setVisibility(v);
															markDirty();
														}
													}}
													variant="outline"
													size="sm"
													className="wwc:justify-start"
												>
													{VISIBILITIES.map((v) => (
														<ToggleGroupItem key={v} value={v} className={SEGMENT_ON}>
															{v}
														</ToggleGroupItem>
													))}
												</ToggleGroup>
											</div>
											<div className="wwc:space-y-1">
												<FieldLabel>Layer</FieldLabel>
												<div className="wwc:flex wwc:items-center wwc:gap-2">
													<Badge className="wwc:h-5 wwc:rounded-md wwc:text-[10px]">{objectType.layer}</Badge>
													<code className="wwc:font-mono wwc:text-xs">wc3.core</code>
												</div>
												<p className="wwc:text-xs wwc:text-muted-foreground">
													Layer is set at creation and immutable — extensions go to L3/L4.
												</p>
											</div>
											<div className="wwc:space-y-1">
												<FieldLabel>RID</FieldLabel>
												<div className="wwc:flex wwc:items-center wwc:gap-2">
													<code className="wwc:font-mono wwc:text-xs">ri.ontology.wc3.object-type.f871a4de-bd88</code>
													<Badge variant="secondary" className="wwc:h-5 wwc:text-[10px]">
														read-only
													</Badge>
												</div>
											</div>
										</div>
									</SectionCard>

									<Card className="wwc:border-destructive/40 wwc:p-5">
										<h3 className="wwc:mb-2 wwc:text-base wwc:font-semibold wwc:text-destructive">Danger zone</h3>
										<p className="wwc:mb-3 wwc:text-sm wwc:text-muted-foreground">
											Deletion is a two-step flow: deprecate first (consumers get warned), then delete.
										</p>
										<div className="wwc:flex wwc:items-center wwc:gap-2">
											<Button
												variant="outline"
												size="sm"
												className="wwc:border-destructive/40 wwc:text-destructive"
												disabled={status === "Deprecated"}
												onClick={() => {
													setStatus("Deprecated");
													markDirty();
													toast.success(`“${displayName}” marked as deprecated`);
												}}
											>
												Deprecate…
											</Button>
											<Button
												variant="destructive"
												size="sm"
												disabled={status !== "Deprecated"}
												onClick={() => setConfirmDelete(true)}
											>
												<Trash2 className="wwc:h-4 wwc:w-4" />
												Delete…
											</Button>
										</div>
									</Card>
								</div>
							</div>
						) : null}
					</div>

					{/* ── Save footer (appears on any edit) ── */}
					{dirty ? (
						<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-4 wwc:border-t wwc:border-border wwc:bg-card wwc:px-6 wwc:py-3">
							<span className="wwc:text-sm wwc:text-muted-foreground">Unsaved changes</span>
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<Button variant="outline" onClick={discard}>
									Discard
								</Button>
								<Button onClick={save}>Save changes</Button>
							</div>
						</div>
					) : null}
				</SheetContent>
			</Sheet>

			{/* Implement interface on object type */}
			<Dialog open={implementOpen} onOpenChange={setImplementOpen}>
				<DialogContent closeAlign="padded" className="wwc:p-6 wwc:max-w-3xl">
					<DialogTitle className="wwc:text-lg wwc:font-semibold">Implement interface on object type</DialogTitle>
					<div className="wwc:grid wwc:grid-cols-2 wwc:gap-6">
						<div className="wwc:space-y-1.5">
							<FieldLabel>Interface</FieldLabel>
							<Select defaultValue="Locatable">
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{["Locatable", "Trackable", "Certifiable", "Assignable", "Auditable"].map((i) => (
										<SelectItem key={i} value={i}>
											{i}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="wwc:space-y-1.5">
							<FieldLabel>Object type</FieldLabel>
							<Select defaultValue={objectType.apiName}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={objectType.apiName}>{objectType.name}</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="wwc:space-y-2">
						<Label className="wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
							Property mapping{" "}
							<span className="wwc:font-medium wwc:normal-case wwc:text-muted-foreground">
								— auto-mapped where a shared property or API name matches; map the rest manually, skip optionals
							</span>
						</Label>
						<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:rounded-lg wwc:border wwc:border-emerald-500/30 wwc:bg-emerald-500/10 wwc:p-3">
							<code className="wwc:font-mono wwc:text-sm">geo_location *</code>
							<Badge variant="secondary" className="wwc:h-5 wwc:text-[10px]">
								geopoint
							</Badge>
							<Badge variant="secondary" className="wwc:h-5 wwc:text-[10px]">
								shared
							</Badge>
							<span className="wwc:text-muted-foreground">→</span>
							<Select defaultValue="geo_location">
								<SelectTrigger className="wwc:w-56">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="geo_location">Geo location</SelectItem>
								</SelectContent>
							</Select>
							<span className="wwc:text-sm wwc:text-emerald-600 wwc:dark:text-emerald-400">auto ✓</span>
						</div>
					</div>
					<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-4 wwc:border-t wwc:border-border wwc:pt-4">
						<span className="wwc:text-sm wwc:text-emerald-600 wwc:dark:text-emerald-400">
							All required mappings satisfied ✓
						</span>
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<Button variant="outline" onClick={() => setImplementOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={() => {
									setImplementOpen(false);
									markDirty();
									toast.success("Interface implemented");
								}}
							>
								Implement interface
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={confirmDelete}
				onOpenChange={setConfirmDelete}
				destructive
				title="Delete object type?"
				description={
					<>
						<span className="wwc:font-medium wwc:text-foreground">{displayName}</span> and its schema will be
						permanently deleted. Instances and datasource links are detached. This can't be undone.
					</>
				}
				confirmLabel="Delete"
				onConfirm={() => {
					setConfirmDelete(false);
					if (objectType) onDelete?.(objectType);
					onOpenChange(false);
					toast.success(`“${displayName}” deleted`);
				}}
			/>
		</>
	);
}
