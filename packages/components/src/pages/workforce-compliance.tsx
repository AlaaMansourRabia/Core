import type {ColumnDef} from "@tanstack/react-table";

import {AlertTriangle, Download, Upload, X} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

import {Avatar, AvatarFallback} from "../avatar";
import {Badge, type BadgeProps} from "../badge";
import {Button} from "../button";
import {Checkbox} from "../checkbox";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {MetricCard} from "../metric-card";
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
import {toast, Toaster} from "../sonner";
import {Tabs, TabsList, TabsTrigger} from "../tabs";
import {HoverTooltip} from "../tooltip";
import {
	WorkerProfile,
	type WorkerProfileCompliance,
	type WorkerProfileField,
	type WorkerProfileFieldGroup,
} from "../worker-profile";

// Compliance — the Compliance tab of the Workforce template. A per-worker document-compliance matrix
// (Background Check / SST Card / Apex ID Badge / Core Asset / Active on Site) with Mobilized /
// Demobilized tabs, KPI cards, and the standard search / filter / column toolbar. Clicking a worker
// opens their WorkerProfile in a right push panel (defaulting to the Compliance tab).

type DocStatus =
	| {kind: "missing"}
	| {kind: "valid"; date: string}
	| {kind: "expiring"; date: string}
	| {kind: "expired"; date: string};

type AssetStatus = {kind: "no"} | {kind: "yes"; tag: string};
type SiteStatus = "not-on-site" | "offline" | "on-site";

interface ComplianceRow {
	id: string;
	name: string;
	code: string;
	company: string;
	trade: string;
	background: DocStatus;
	sst: DocStatus;
	apexId: DocStatus;
	core: AssetStatus;
	activeOnSite: SiteStatus;
	releaseDate: string | null;
	releasedBy: string | null;
	remarks: string | null;
	status: "mobilized" | "demobilized";
}

// ─── Configurable compliance rules ───────────────────────────────────────────
// Compliance is scored from a per-project set of conditions over the four elements. The Compliance
// settings tab edits these; the score column and the worker profile read them.

/** Worker-data keys that carry live status in the sample rows. Custom elements have no data key. */
export type ComplianceElement = "background" | "sst" | "apexId" | "core";
export type ComplianceType = "document" | "asset" | "boolean" | "date";
export type ComplianceCondition = "valid" | "not-expired" | "present";

export interface ComplianceRule {
	id: string;
	/** Display name — a built-in element or a custom one the user named. */
	name: string;
	/** What kind of thing it is; drives how it's collected/verified. */
	type: ComplianceType;
	/** Links to the worker's live status for scoring. Absent for custom elements (no data yet). */
	dataKey?: ComplianceElement;
	condition: ComplianceCondition;
	/** Contribution to the score, relative to the other enabled rules. */
	weight: number;
	enabled: boolean;
}

export const COMPLIANCE_TYPES: {value: ComplianceType; label: string}[] = [
	{value: "document", label: "Document"},
	{value: "asset", label: "Asset"},
	{value: "boolean", label: "Yes / No"},
	{value: "date", label: "Date"},
];

export const COMPLIANCE_CONDITIONS: {value: ComplianceCondition; label: string}[] = [
	{value: "valid", label: "Must be Valid"},
	{value: "not-expired", label: "Must not be expired"},
	{value: "present", label: "Must be present"},
];

/** The built-in elements with live worker data — offered in the picker (plus "add new"). */
export const KNOWN_COMPLIANCE_ELEMENTS: {name: string; type: ComplianceType; dataKey: ComplianceElement}[] = [
	{name: "Background Check", type: "document", dataKey: "background"},
	{name: "SST Card", type: "document", dataKey: "sst"},
	{name: "Apex ID Badge", type: "document", dataKey: "apexId"},
	{name: "Core Asset", type: "asset", dataKey: "core"},
];

export const typeLabel = (t: ComplianceType) => COMPLIANCE_TYPES.find((x) => x.value === t)?.label ?? t;
export const conditionLabel = (c: ComplianceCondition) => COMPLIANCE_CONDITIONS.find((x) => x.value === c)?.label ?? c;

export const DEFAULT_COMPLIANCE_RULES: ComplianceRule[] = [
	{
		id: "r-background",
		name: "Background Check",
		type: "document",
		dataKey: "background",
		condition: "valid",
		weight: 1,
		enabled: true,
	},
	{id: "r-sst", name: "SST Card", type: "document", dataKey: "sst", condition: "valid", weight: 1, enabled: true},
	{
		id: "r-apex",
		name: "Apex ID Badge",
		type: "document",
		dataKey: "apexId",
		condition: "valid",
		weight: 1,
		enabled: true,
	},
	{
		id: "r-core",
		name: "Core Asset",
		type: "asset",
		dataKey: "core",
		condition: "present",
		weight: 1,
		enabled: true,
	},
];

function ruleSatisfied(rule: ComplianceRule, row: ComplianceRow): boolean {
	if (!rule.dataKey) return false; // custom element — no sample data to check against yet
	if (rule.dataKey === "core") return row.core.kind === "yes";
	const s = rule.dataKey === "background" ? row.background : rule.dataKey === "sst" ? row.sst : row.apexId;
	if (rule.condition === "valid") return s.kind === "valid";
	if (rule.condition === "not-expired") return s.kind === "valid" || s.kind === "expiring";
	return s.kind !== "missing";
}

/**
 * A 0–100 compliance score for a worker, weighted across the enabled rules that map to live data.
 * Custom elements without a data key are excluded here (they'd be scored once wired to real project data).
 */
export function complianceScore(rules: ComplianceRule[], row: ComplianceRow): number {
	const active = rules.filter((r) => r.enabled && r.dataKey);
	const total = active.reduce((sum, r) => sum + r.weight, 0);
	if (total === 0) return 0;
	const got = active.filter((r) => ruleSatisfied(r, row)).reduce((sum, r) => sum + r.weight, 0);
	return Math.round((got / total) * 100);
}

const miss = (): DocStatus => ({kind: "missing"});
const valid = (date: string): DocStatus => ({kind: "valid", date});
const expiring = (date: string): DocStatus => ({kind: "expiring", date});
const expired = (date: string): DocStatus => ({kind: "expired", date});

function initials(name: string) {
	return (
		name
			.replace(/[^A-Za-z ]/g, "")
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
}

const dash = <span className="wwc:text-muted-foreground">—</span>;

// ─── Sample data ─────────────────────────────────────────────────────────────

function row(
	id: string,
	name: string,
	code: string,
	company: string,
	trade: string,
	docs: {background: DocStatus; sst: DocStatus; apexId: DocStatus; core: AssetStatus; site: SiteStatus},
	status: "mobilized" | "demobilized" = "mobilized",
): ComplianceRow {
	return {
		id,
		name,
		code,
		company,
		trade,
		background: docs.background,
		sst: docs.sst,
		apexId: docs.apexId,
		core: docs.core,
		activeOnSite: docs.site,
		releaseDate: null,
		releasedBy: null,
		remarks: null,
		status,
	};
}

const NO: AssetStatus = {kind: "no"};

const ROWS: ComplianceRow[] = [
	row("cp-1", "*****", "****", "Stage Company", "fasfs", {
		background: miss(),
		sst: miss(),
		apexId: miss(),
		core: NO,
		site: "not-on-site",
	}),
	row("cp-2", "01 newwww", "01 newwwww", "Stage Company", "Def-trd", {
		background: miss(),
		sst: miss(),
		apexId: miss(),
		core: NO,
		site: "not-on-site",
	}),
	row("cp-3", "123", "123", "Stage Company", "Def-trd", {
		background: miss(),
		sst: valid("12 Dec 27"),
		apexId: miss(),
		core: NO,
		site: "not-on-site",
	}),
	row("cp-4", "aaaalllaaaa", "pppppppx", "Stage Company", "fasfs", {
		background: miss(),
		sst: miss(),
		apexId: miss(),
		core: {kind: "yes", tag: "H26"},
		site: "offline",
	}),
	row("cp-5", "Abdelrahman Badawy 2", "10476", "Stage Company", "5555555", {
		background: miss(),
		sst: miss(),
		apexId: miss(),
		core: NO,
		site: "not-on-site",
	}),
	row("cp-6", "AbdelRhman Donia", "10427", "Stage Company", "fasfs", {
		background: valid("11 Mar 27"),
		sst: expired("28 Jun 26"),
		apexId: miss(),
		core: NO,
		site: "not-on-site",
	}),
	row("cp-7", "Abdelruhman Malek", "10434", "Stage Company", "Def-trd", {
		background: miss(),
		sst: miss(),
		apexId: miss(),
		core: NO,
		site: "not-on-site",
	}),
	row("cp-8", "Abdulaziz AlEssa", "10281", "Company 0", "Def-trd", {
		background: valid("20 May 27"),
		sst: valid("21 Oct 26"),
		apexId: valid("24 Nov 28"),
		core: {kind: "yes", tag: "I5"},
		site: "offline",
	}),
	row("cp-9", "Abdulaziz Al-Jaber", "W1030", "essam-8", "STW", {
		background: miss(),
		sst: miss(),
		apexId: miss(),
		core: NO,
		site: "not-on-site",
	}),
	row("cp-10", "Abdulaziz Alyousef", "10364", "Stage Company", "Def-trd", {
		background: miss(),
		sst: miss(),
		apexId: miss(),
		core: NO,
		site: "not-on-site",
	}),
	row("cp-11", "Abdullah Alateeq", "10274", "Company 0", "Def-trd", {
		background: miss(),
		sst: expiring("12 Aug 26"),
		apexId: miss(),
		core: NO,
		site: "not-on-site",
	}),
	row("cp-12", "Abdullah Alhilal", "10320", "Stage Company", "Def-trd", {
		background: miss(),
		sst: miss(),
		apexId: miss(),
		core: NO,
		site: "not-on-site",
	}),
	row("cp-13", "Bilal Hassan", "10688", "Company 0", "Def-trd", {
		background: valid("02 Feb 28"),
		sst: valid("14 Sep 27"),
		apexId: miss(),
		core: {kind: "yes", tag: "K3"},
		site: "on-site",
	}),
	row(
		"cp-14",
		"Chandra Bahadur",
		"10991",
		"Stage Company",
		"STW",
		{background: miss(), sst: miss(), apexId: miss(), core: NO, site: "not-on-site"},
		"demobilized",
	),
	row(
		"cp-15",
		"Dawit Mekonnen",
		"11204",
		"essam-8",
		"Def-trd",
		{background: expired("01 Jan 26"), sst: miss(), apexId: miss(), core: NO, site: "not-on-site"},
		"demobilized",
	),
];

// Population-level KPIs (the full 736-worker roster, not just the visible page).
const KPIS: {title: string; value: number; status?: "success" | "warning" | "danger"}[] = [
	{title: "Fully Compliant", value: 1, status: "success"},
	{title: "Expiring Soon", value: 3, status: "warning"},
	{title: "Failed / Expired", value: 1, status: "danger"},
	{title: "Missing Docs", value: 726},
	{title: "Not on Site", value: 736},
];

// ─── Status pills ────────────────────────────────────────────────────────────

/** A two-line status pill (label + optional date) rendered with a Badge tone. */
function Pill({variant, label, date}: {variant: BadgeProps["variant"]; label: string; date?: string}) {
	return (
		<Badge
			variant={variant}
			className="wwc:flex wwc:h-auto wwc:min-w-[4.75rem] wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-0 wwc:px-2 wwc:py-1 wwc:text-center"
		>
			<span className="wwc:text-[11px] wwc:font-semibold wwc:leading-tight">{label}</span>
			{date ? <span className="wwc:text-[10px] wwc:font-normal wwc:leading-tight wwc:opacity-90">{date}</span> : null}
		</Badge>
	);
}

function DocPill({status}: {status: DocStatus}) {
	switch (status.kind) {
		case "valid":
			return <Pill variant="success" label="Valid" date={status.date} />;
		case "expiring":
			return <Pill variant="warning" label="Expiring" date={status.date} />;
		case "expired":
			return <Pill variant="destructive" label="Expired" date={status.date} />;
		default:
			return <Pill variant="neutralSoft" label="Missing" />;
	}
}

function AssetPill({status}: {status: AssetStatus}) {
	return status.kind === "yes" ? (
		<Pill variant="success" label="YES" date={status.tag} />
	) : (
		<Pill variant="neutralSoft" label="No" />
	);
}

function SitePill({status}: {status: SiteStatus}) {
	const label = status === "on-site" ? "On Site" : status === "offline" ? "Offline" : "Not on Site";
	return <Pill variant="info" label={label} />;
}

const isFailed = (row: ComplianceRow) => [row.background, row.sst, row.apexId].some((doc) => doc.kind === "expired");

// ─── Worker profile mapping (for the push panel) ──────────────────────────────

function docFields(status: DocStatus): WorkerProfileField[] | undefined {
	if (status.kind === "missing") return undefined;
	const label = status.kind === "expired" ? "Expired" : "Expires";
	return [{label, value: status.date}];
}

function complianceGeneral(row: ComplianceRow): WorkerProfileFieldGroup[] {
	return [
		{
			id: "identity",
			fields: [
				{label: "Worker Code", value: row.code},
				{label: "Company", value: row.company},
				{label: "Trade", value: row.trade},
			],
		},
		{
			id: "site",
			fields: [
				{label: "Active on Site", value: <SitePill status={row.activeOnSite} />},
				{label: "Release Date", value: row.releaseDate ?? dash},
				{label: "Released By", value: row.releasedBy ?? dash},
				{label: "Remarks", value: row.remarks ?? dash},
			],
		},
	];
}

function complianceCompliance(row: ComplianceRow, onUpload: (id: string) => void): WorkerProfileCompliance {
	const validDocs =
		[row.background, row.sst, row.apexId].filter((d) => d.kind === "valid").length +
		(row.core.kind === "yes" ? 1 : 0);
	return {
		score: {value: validDocs, total: 4},
		items: [
			{
				id: "background",
				title: "Background Check",
				status: <DocPill status={row.background} />,
				uploadable: true,
				onUploadDocument: () => onUpload("background"),
				fields: docFields(row.background),
			},
			{
				id: "sst",
				title: "SST Card",
				status: <DocPill status={row.sst} />,
				uploadable: true,
				onUploadDocument: () => onUpload("sst"),
				fields: docFields(row.sst),
			},
			{
				id: "apex",
				title: "Apex ID Badge",
				status: <DocPill status={row.apexId} />,
				uploadable: true,
				onUploadDocument: () => onUpload("apex"),
				fields: docFields(row.apexId),
			},
			{id: "core", title: "Core Asset", auto: true, status: <AssetPill status={row.core} />},
			{
				id: "active",
				title: "Active on Site",
				auto: true,
				status: <SitePill status={row.activeOnSite} />,
				note: "Derived from the worker's on-site activity — not manually editable.",
			},
		],
	};
}

function complianceDevice(row: ComplianceRow): WorkerProfileField[] {
	return row.core.kind === "yes"
		? [
				{
					label: "Core Asset",
					value: (
						<Badge variant="successSoft" className="wwc:h-5 wwc:text-xs">
							Linked
						</Badge>
					),
				},
				{label: "Tag", value: row.core.tag},
			]
		: [
				{
					label: "Core Asset",
					value: (
						<Badge variant="infoSoft" className="wwc:h-5 wwc:text-xs">
							Not assigned
						</Badge>
					),
				},
			];
}

// ─── Columns ─────────────────────────────────────────────────────────────────

const docHeaderMeta = {headerClassName: "wwc:w-[6rem]", cellClassName: "wwc:whitespace-nowrap"};

function makeColumns(onView: (row: ComplianceRow) => void, rules: ComplianceRule[]): ColumnDef<ComplianceRow>[] {
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
			meta: {cellClassName: "wwc:whitespace-nowrap"},
			cell: ({row}) => (
				<button
					type="button"
					onClick={() => onView(row.original)}
					aria-label={`View ${row.original.name}`}
					className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-left"
				>
					<Avatar className="wwc:h-7 wwc:w-7">
						<AvatarFallback className="wwc:text-[10px]">{initials(row.original.name)}</AvatarFallback>
					</Avatar>
					<span className="wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary">
						{row.original.name}
					</span>
				</button>
			),
		},
		{
			accessorKey: "code",
			header: ({column}) => <DataTableColumnHeader column={column} title="Worker Code" />,
			cell: ({row}) => row.original.code,
		},
		{
			accessorKey: "company",
			header: ({column}) => <DataTableColumnHeader column={column} title="Company" />,
			cell: ({row}) => row.original.company,
		},
		{
			accessorKey: "trade",
			header: ({column}) => <DataTableColumnHeader column={column} title="Trade" />,
			cell: ({row}) => row.original.trade,
		},
		{
			id: "score",
			header: ({column}) => <DataTableColumnHeader column={column} title="Compliance Score" />,
			meta: {headerClassName: "wwc:w-[9rem]", cellClassName: "wwc:whitespace-nowrap"},
			cell: ({row}) => {
				const score = complianceScore(rules, row.original);
				const tone = score >= 80 ? "success" : score >= 50 ? "warning" : "danger";
				return (
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Progress value={score} tone={tone} className="wwc:h-1.5 wwc:w-16" />
						<span className="wwc:text-xs wwc:tabular-nums wwc:text-muted-foreground">{score}%</span>
					</div>
				);
			},
		},
		{
			id: "background",
			header: ({column}) => <DataTableColumnHeader column={column} title="Background Check" />,
			meta: docHeaderMeta,
			cell: ({row}) => <DocPill status={row.original.background} />,
		},
		{
			id: "sst",
			header: ({column}) => <DataTableColumnHeader column={column} title="SST Card" />,
			meta: docHeaderMeta,
			cell: ({row}) => <DocPill status={row.original.sst} />,
		},
		{
			id: "apexId",
			header: ({column}) => <DataTableColumnHeader column={column} title="Apex ID Badge" />,
			meta: docHeaderMeta,
			cell: ({row}) => <DocPill status={row.original.apexId} />,
		},
		{
			id: "core",
			header: ({column}) => <DataTableColumnHeader column={column} title="Core Asset" />,
			meta: docHeaderMeta,
			cell: ({row}) => <AssetPill status={row.original.core} />,
		},
		{
			id: "activeOnSite",
			header: ({column}) => <DataTableColumnHeader column={column} title="Active on Site" />,
			meta: docHeaderMeta,
			cell: ({row}) => <SitePill status={row.original.activeOnSite} />,
		},
		{
			accessorKey: "releaseDate",
			header: ({column}) => <DataTableColumnHeader column={column} title="Release Date" />,
			cell: ({row}) => row.original.releaseDate ?? dash,
		},
		{
			accessorKey: "releasedBy",
			header: ({column}) => <DataTableColumnHeader column={column} title="Released By" />,
			cell: ({row}) => row.original.releasedBy ?? dash,
		},
		{
			accessorKey: "remarks",
			header: ({column}) => <DataTableColumnHeader column={column} title="Remarks" />,
			cell: ({row}) => row.original.remarks ?? dash,
		},
		{
			id: "attn",
			enableSorting: false,
			enableHiding: false,
			header: () => <span className="wwc:text-xs wwc:font-medium">Attn</span>,
			meta: {cellClassName: "wwc:w-px wwc:text-center"},
			cell: ({row}) =>
				isFailed(row.original) ? (
					<HoverTooltip content="Attention: an expired document">
						<AlertTriangle className="wwc:mx-auto wwc:h-4 wwc:w-4 wwc:text-destructive" />
					</HoverTooltip>
				) : (
					dash
				),
		},
	];
}

// ─── View ────────────────────────────────────────────────────────────────────

/** The Compliance tab — a per-worker document-compliance matrix with Mobilized/Demobilized tabs. */
export function ComplianceView({rules = DEFAULT_COMPLIANCE_RULES}: {rules?: ComplianceRule[]} = {}) {
	const [statusTab, setStatusTab] = useState<ComplianceRow["status"]>("mobilized");
	const [filters, setFilters] = useState<FilterValue>({});
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const columns = useMemo(() => makeColumns((row) => setSelectedId(row.id), rules), [rules]);
	const selected = selectedId ? (ROWS.find((r) => r.id === selectedId) ?? null) : null;

	const [ownToaster, setOwnToaster] = useState(false);
	useEffect(() => {
		const has = document.querySelector('[data-sonner-toaster], section[aria-live][aria-label*="Notification"]');
		setOwnToaster(!has);
	}, []);

	const companies = useMemo(() => Array.from(new Set(ROWS.map((r) => r.company))).sort(), []);
	const trades = useMemo(() => Array.from(new Set(ROWS.map((r) => r.trade))).sort(), []);

	const filtered = useMemo(
		() =>
			ROWS.filter((r) =>
				Object.entries(filters).every(([key, sel]) => {
					if (!sel || sel.length === 0) return true;
					return sel.includes(String(r[key as keyof ComplianceRow]));
				}),
			),
		[filters],
	);

	const statusCounts = useMemo(
		() => ({
			mobilized: filtered.filter((r) => r.status === "mobilized").length,
			demobilized: filtered.filter((r) => r.status === "demobilized").length,
		}),
		[filtered],
	);

	const data = useMemo(() => filtered.filter((r) => r.status === statusTab), [filtered, statusTab]);

	return (
		<PushPanelProvider open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)} side="right">
			<PushPanelContainer className="wwc:min-h-0 wwc:flex-1">
				<PushPanelMain className="wwc:h-full wwc:overflow-auto">
					<div className="wwc:w-full wwc:p-6">
						<Tabs value={statusTab} onValueChange={(value) => setStatusTab(value as ComplianceRow["status"])}>
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

						<div className="wwc:my-4 wwc:grid wwc:grid-cols-2 wwc:gap-4 wwc:md:grid-cols-3 wwc:lg:grid-cols-5">
							{KPIS.map((kpi) => (
								<MetricCard key={kpi.title} title={kpi.title} value={kpi.value.toLocaleString()} status={kpi.status} />
							))}
						</div>

						<Filter value={filters} onChange={setFilters}>
							<DataTable
								key={statusTab}
								columns={columns}
								data={data}
								searchKey="name"
								searchPlaceholder="Search workers…"
								showColumnToggle
								recordLabel="worker"
								pageSize={25}
								toolbarExtra={
									<>
										<FilterTrigger />
										<FilterContent>
											<FilterCategory value="company" label="Company">
												{companies.map((company) => (
													<FilterOption key={company} value={company}>
														{company}
													</FilterOption>
												))}
											</FilterCategory>
											<FilterCategory value="trade" label="Trade">
												{trades.map((trade) => (
													<FilterOption key={trade} value={trade}>
														{trade}
													</FilterOption>
												))}
											</FilterCategory>
										</FilterContent>
										<Button
											variant="outline"
											onClick={() => toast.success("Upload documents — attach SST & OSHA files")}
										>
											<Upload className="wwc:h-4 wwc:w-4" />
											Upload documents
										</Button>
										<Button variant="outline" onClick={() => toast.success("Exporting compliance CSV…")}>
											<Download className="wwc:h-4 wwc:w-4" />
											Export CSV
										</Button>
									</>
								}
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
							<PushPanelClose asChild>
								<Button variant="ghost" icon aria-label="Close profile" className="wwc:h-6 wwc:w-6">
									<X className="wwc:h-4 wwc:w-4" />
								</Button>
							</PushPanelClose>
						</PushPanelHeaderActions>
					</PushPanelHeader>

					{selected && (
						<WorkerProfile
							defaultTab="compliance"
							general={complianceGeneral(selected)}
							compliance={complianceCompliance(selected, (id) => toast(`Upload requested for ${id}`))}
							device={complianceDevice(selected)}
						/>
					)}
				</PushPanel>
			</PushPanelContainer>

			{ownToaster ? <Toaster position="top-right" /> : null}
		</PushPanelProvider>
	);
}
