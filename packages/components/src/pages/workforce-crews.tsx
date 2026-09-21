import type {ColumnDef} from "@tanstack/react-table";

import {
	AlertTriangle,
	ArrowLeft,
	Download,
	MoreHorizontal,
	Plus,
	RotateCcw,
	SquarePen,
	Trash2,
	Users,
	X,
} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

import {Avatar, AvatarFallback} from "../avatar";
import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import {Checkbox} from "../checkbox";
import {ConfirmDialog} from "../confirm-dialog";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {DatePicker} from "../date-picker";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {Input} from "../input";
import {MetricCard} from "../metric-card";
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {toast, Toaster} from "../sonner";
import {HoverTooltip} from "../tooltip";
import {WorkerProfile, type WorkerProfileField, type WorkerProfileFieldGroup} from "../worker-profile";

// Crews — the Crews tab of the Workforce template. A list of crews (with KPI cards) that opens a full
// crew detail page (back button, roster table, worker push panel). Add / Edit crew is a modal, not a
// sheet. Core primitives; primary/neutral tokens only.

function initials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

function dash(value: React.ReactNode) {
	return value === null || value === undefined || value === "" ? (
		<span className="wwc:text-muted-foreground">—</span>
	) : (
		value
	);
}

// ─── Data model ──────────────────────────────────────────────────────────────

interface CrewWorker {
	id: string;
	name: string;
	code: string;
	title: string | null;
	trade: string;
	effectiveDate: string;
	shiftType: string;
	nationality: string | null;
}

interface Crew {
	id: string;
	name: string;
	code: string;
	managerName: string;
	managerId: string;
	type: string;
	discipline: string;
	createdAt: string;
	/** When true, the member count is unresolved and surfaces a "Missing Information" prompt. */
	missingInfo: boolean;
	members: CrewWorker[];
}

const CREW_MANAGERS = [
	{name: "Moayad Test", id: "12345666"},
	{name: "TAYYAB HASNAIN JANJUA", id: "2510300417"},
	{name: "AHMED AL-RASHID", id: "2481930022"},
];

const CREW_TYPES = ["Default resource pool crew type", "PKG4", "Manpower crew", "Direct labour crew"];
const DISCIPLINES = ["MANPOWER", "CIVIL", "MECHANICAL", "ELECTRICAL"];

function member(id: string, name: string, code: string, trade: string): CrewWorker {
	return {id, name, code, title: null, trade, effectiveDate: "03 Jan, 2026", shiftType: "day", nationality: "India"};
}

const TAMIMI_MEMBERS: CrewWorker[] = [
	member("cw-1", "MUHAMMAD SALEEM", "2528868132", "Indirect-Driver"),
	member("cw-2", "TEJ KUMAR PAKHRIN", "2415366026", "Indirect-Driver"),
	member("cw-3", "SABIN MATHEW", "2617843699", "Indirect-Driver"),
];

function roster(prefix: string, count: number): CrewWorker[] {
	const NAMES = [
		"RAJESH KUMAR",
		"BIKASH THAPA",
		"ARUN NAIR",
		"SANTOSH RANA",
		"DEEPAK SHARMA",
		"IMRAN KHAN",
		"SURESH PATEL",
		"NABIN GURUNG",
		"VIJAY SINGH",
		"MANOJ YADAV",
		"PRAKASH RAI",
		"AMIT VERMA",
		"RAM BAHADUR",
		"KRISHNA MAGAR",
	];
	const TRADES = ["Direct-Helper", "Direct-Scaffolder", "Indirect-Driver", "Direct-Mason", "Direct-Steel Fixer"];
	return Array.from({length: count}, (_, i) =>
		member(`${prefix}-${i}`, NAMES[i % NAMES.length], `25${(1000000 + i * 137) % 9999999}`, TRADES[i % TRADES.length]),
	);
}

const CREWS: Crew[] = [
	{
		id: "c-dsco",
		name: "DSCO",
		code: "DSCO",
		managerName: "Moayad Test",
		managerId: "12345666",
		type: "PKG4",
		discipline: "MANPOWER",
		createdAt: "08 Sep, 2025",
		missingInfo: false,
		members: roster("dsco", 3),
	},
	{
		id: "c-bq",
		name: "TR-BIN QURAYA",
		code: "TR-BQ",
		managerName: "TAYYAB HASNAIN JANJUA",
		managerId: "2510300417",
		type: "Default resource pool crew type",
		discipline: "MANPOWER",
		createdAt: "12 Oct, 2025",
		missingInfo: true,
		members: roster("bq", 5),
	},
	{
		id: "c-actavo",
		name: "TR-ACTAVO",
		code: "TR-ACTAVO",
		managerName: "TAYYAB HASNAIN JANJUA",
		managerId: "2510300417",
		type: "Default resource pool crew type",
		discipline: "MANPOWER",
		createdAt: "12 Oct, 2025",
		missingInfo: false,
		members: roster("actavo", 2),
	},
	{
		id: "c-tawal",
		name: "TR-TAWAL",
		code: "TR-TAWAL",
		managerName: "TAYYAB HASNAIN JANJUA",
		managerId: "2510300417",
		type: "Default resource pool crew type",
		discipline: "MANPOWER",
		createdAt: "12 Oct, 2025",
		missingInfo: true,
		members: roster("tawal", 6),
	},
	{
		id: "c-tamimi",
		name: "TR-TAMIMI",
		code: "TR-TAMIMI",
		managerName: "TAYYAB HASNAIN JANJUA",
		managerId: "2510300417",
		type: "Default resource pool crew type",
		discipline: "MANPOWER",
		createdAt: "12 Oct, 2025",
		missingInfo: false,
		members: TAMIMI_MEMBERS,
	},
	{
		id: "c-redcamel",
		name: "TR-RED CAMEL",
		code: "TR-RED CAMEL",
		managerName: "TAYYAB HASNAIN JANJUA",
		managerId: "2510300417",
		type: "Default resource pool crew type",
		discipline: "MANPOWER",
		createdAt: "12 Oct, 2025",
		missingInfo: false,
		members: roster("redcamel", 14),
	},
	{
		id: "c-united",
		name: "TR-UNITED",
		code: "TR-UNITED",
		managerName: "TAYYAB HASNAIN JANJUA",
		managerId: "2510300417",
		type: "Default resource pool crew type",
		discipline: "MANPOWER",
		createdAt: "12 Oct, 2025",
		missingInfo: false,
		members: roster("united", 10),
	},
	{
		id: "c-hurricane",
		name: "TR-HURRICANE",
		code: "TR-HURRICANE",
		managerName: "TAYYAB HASNAIN JANJUA",
		managerId: "2510300417",
		type: "Default resource pool crew type",
		discipline: "MANPOWER",
		createdAt: "12 Oct, 2025",
		missingInfo: true,
		members: roster("hurricane", 4),
	},
	{
		id: "c-falcon",
		name: "TR-FALCON",
		code: "TR-FALCON",
		managerName: "AHMED AL-RASHID",
		managerId: "2481930022",
		type: "PKG4",
		discipline: "CIVIL",
		createdAt: "20 Nov, 2025",
		missingInfo: false,
		members: roster("falcon", 8),
	},
	{
		id: "c-oryx",
		name: "TR-ORYX",
		code: "TR-ORYX",
		managerName: "AHMED AL-RASHID",
		managerId: "2481930022",
		type: "Manpower crew",
		discipline: "MECHANICAL",
		createdAt: "02 Dec, 2025",
		missingInfo: false,
		members: roster("oryx", 7),
	},
];

// ─── Worker profile mapping (for the roster push panel) ───────────────────────

function crewWorkerGeneral(worker: CrewWorker, crew: Crew): WorkerProfileFieldGroup[] {
	return [
		{
			id: "identity",
			fields: [
				{label: "Worker Code", value: worker.code},
				{label: "Title", value: dash(worker.title)},
				{label: "Trade", value: worker.trade},
				{label: "Nationality", value: dash(worker.nationality)},
			],
		},
		{
			id: "assignment",
			fields: [
				{label: "Crew", value: crew.name},
				{label: "Discipline", value: crew.discipline},
				{label: "Shift Type", value: worker.shiftType},
				{label: "Effective Date", value: worker.effectiveDate},
			],
		},
	];
}

function crewWorkerDevice(worker: CrewWorker): WorkerProfileField[] {
	return [
		{label: "Device ID", value: dash(null)},
		{
			label: "Assigned",
			value: (
				<Badge variant="infoSoft" className="wwc:h-5 wwc:text-xs">
					Not assigned
				</Badge>
			),
		},
		{label: "Worker Code", value: worker.code},
	];
}

// ─── Add / Edit crew modal ───────────────────────────────────────────────────

interface CrewDraft {
	name: string;
	code: string;
	managerId: string;
	effectiveDate?: Date;
	type: string;
	discipline: string;
}

const EMPTY_DRAFT: CrewDraft = {name: "", code: "", managerId: "", effectiveDate: undefined, type: "", discipline: ""};

function CrewFormModal({
	open,
	onOpenChange,
	mode,
	initial,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
	mode: "add" | "edit";
	initial: CrewDraft;
	onSubmit: (draft: CrewDraft) => void;
}) {
	const [draft, setDraft] = useState<CrewDraft>(initial);
	const [seed, setSeed] = useState<CrewDraft | null>(null);
	const [attempted, setAttempted] = useState(false);

	// Reseed whenever the modal opens with a different record (add vs a specific edit target).
	if (open && seed !== initial) {
		setSeed(initial);
		setDraft(initial);
		setAttempted(false);
	}

	const set = <K extends keyof CrewDraft>(key: K, value: CrewDraft[K]) => setDraft((d) => ({...d, [key]: value}));

	const missing = {
		name: !draft.name.trim(),
		code: !draft.code.trim(),
		managerId: !draft.managerId,
		effectiveDate: !draft.effectiveDate,
		type: !draft.type,
		discipline: !draft.discipline,
	};
	const valid = !Object.values(missing).some(Boolean);

	const submit = () => {
		if (!valid) {
			setAttempted(true);
			return;
		}
		onSubmit(draft);
		onOpenChange(false);
	};

	const err = (k: keyof typeof missing) => attempted && missing[k];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="wwc:flex wwc:max-h-[92vh] wwc:w-[calc(100vw-2rem)] wwc:max-w-md wwc:flex-col wwc:gap-0 wwc:overflow-hidden wwc:p-0 wwc:[&>button]:hidden">
				<DialogHeader>
					<DialogTitle>
						<Users className="wwc:h-5 wwc:w-5 wwc:text-primary" />
						{mode === "add" ? "Add New Crew" : "Edit Crew"}
					</DialogTitle>
					<Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
						Hide
					</Button>
				</DialogHeader>

				<div className="wwc:min-h-0 wwc:flex-1 wwc:space-y-5 wwc:overflow-y-auto wwc:px-6 wwc:py-5">
					<Field label="Crew Name" required error={err("name")}>
						<Input
							placeholder="Enter Crew Name"
							value={draft.name}
							aria-invalid={err("name")}
							onChange={(e) => set("name", e.target.value)}
						/>
					</Field>
					<Field label="Crew Code" required error={err("code")}>
						<Input
							placeholder="Enter Crew Code"
							value={draft.code}
							aria-invalid={err("code")}
							onChange={(e) => set("code", e.target.value)}
						/>
					</Field>
					<Field label="Crew Manager" required error={err("managerId")}>
						<Select value={draft.managerId} onValueChange={(v) => set("managerId", v)}>
							<SelectTrigger aria-invalid={err("managerId")} className="wwc:w-full">
								<SelectValue placeholder="Select Crew Manager" />
							</SelectTrigger>
							<SelectContent>
								{CREW_MANAGERS.map((m) => (
									<SelectItem key={m.id} value={m.id}>
										{m.name} · {m.id}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
					<Field label="Effective Date" required error={err("effectiveDate")}>
						<DatePicker
							date={draft.effectiveDate}
							onDateChange={(d) => set("effectiveDate", d)}
							placeholder="Select Effective Date"
							className="wwc:w-full"
						/>
					</Field>
					<Field label="Crew Type" required error={err("type")}>
						<Select value={draft.type} onValueChange={(v) => set("type", v)}>
							<SelectTrigger aria-invalid={err("type")} className="wwc:w-full">
								<SelectValue placeholder="Select Crew Type" />
							</SelectTrigger>
							<SelectContent>
								{CREW_TYPES.map((t) => (
									<SelectItem key={t} value={t}>
										{t}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
					<Field label="Discipline" required error={err("discipline")}>
						<Select value={draft.discipline} onValueChange={(v) => set("discipline", v)}>
							<SelectTrigger aria-invalid={err("discipline")} className="wwc:w-full">
								<SelectValue placeholder="Select Discipline" />
							</SelectTrigger>
							<SelectContent>
								{DISCIPLINES.map((d) => (
									<SelectItem key={d} value={d}>
										{d}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				</div>

				<DialogFooter>
					<Button variant="outline" className="wwc:flex-1" onClick={() => setDraft(EMPTY_DRAFT)}>
						Clear
					</Button>
					<Button className="wwc:flex-1" onClick={submit}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function Field({
	label,
	required,
	error,
	children,
}: {
	label: string;
	required?: boolean;
	error?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className="wwc:space-y-1.5">
			<label className="wwc:flex wwc:items-center wwc:gap-0.5 wwc:text-sm wwc:font-semibold">
				{label}
				{required ? <span className="wwc:text-destructive">*</span> : null}
			</label>
			{children}
			{error ? <p className="wwc:text-xs wwc:text-destructive">{label} is required.</p> : null}
		</div>
	);
}

// ─── Crew list ───────────────────────────────────────────────────────────────

function makeCrewColumns(
	onOpen: (crew: Crew) => void,
	onEdit: (crew: Crew) => void,
	onDelete: (crew: Crew) => void,
): ColumnDef<Crew>[] {
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
			header: ({column}) => <DataTableColumnHeader column={column} title="Crew Name" />,
			cell: ({row}) => (
				<button type="button" onClick={() => onOpen(row.original)} className="wwc:flex wwc:flex-col wwc:text-left">
					<span className="wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary">
						{row.original.name}
					</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">{row.original.code}</span>
				</button>
			),
		},
		{
			accessorKey: "managerName",
			header: ({column}) => <DataTableColumnHeader column={column} title="Crew Manager" />,
			meta: {cellClassName: "wwc:whitespace-nowrap"},
			cell: ({row}) => (
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<Avatar className="wwc:h-7 wwc:w-7">
						<AvatarFallback className="wwc:text-[10px]">{initials(row.original.managerName)}</AvatarFallback>
					</Avatar>
					<div className="wwc:flex wwc:flex-col">
						<span className="wwc:font-medium">{row.original.managerName}</span>
						<span className="wwc:text-xs wwc:text-muted-foreground">{row.original.managerId}</span>
					</div>
				</div>
			),
		},
		{
			accessorKey: "type",
			header: ({column}) => <DataTableColumnHeader column={column} title="Crew Type" />,
			cell: ({row}) => row.original.type,
		},
		{
			accessorKey: "discipline",
			header: ({column}) => <DataTableColumnHeader column={column} title="Discipline" />,
			cell: ({row}) => row.original.discipline,
		},
		{
			id: "members",
			header: ({column}) => <DataTableColumnHeader column={column} title="Members" />,
			cell: ({row}) =>
				row.original.missingInfo ? (
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<span className="wwc:flex wwc:h-6 wwc:w-6 wwc:items-center wwc:justify-center wwc:rounded wwc:bg-amber-100 wwc:text-amber-600 wwc:dark:bg-amber-500/20">
							<AlertTriangle className="wwc:h-3.5 wwc:w-3.5" />
						</span>
						<div className="wwc:flex wwc:flex-col">
							<span className="wwc:text-sm">Missing Information</span>
							<button
								type="button"
								onClick={() => onOpen(row.original)}
								className="wwc:flex wwc:items-center wwc:gap-1 wwc:text-xs wwc:text-primary wwc:hover:underline"
							>
								<RotateCcw className="wwc:h-3 wwc:w-3" />
								Resolve
							</button>
						</div>
					</div>
				) : (
					<span className="wwc:tabular-nums">{row.original.members.length}</span>
				),
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
						<DropdownMenuItem onClick={() => onOpen(row.original)}>
							<Users className="wwc:h-4 wwc:w-4" />
							View crew
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onEdit(row.original)}>
							<SquarePen className="wwc:h-4 wwc:w-4" />
							Edit crew
						</DropdownMenuItem>
						<DropdownMenuItem
							className="wwc:text-destructive wwc:focus:text-destructive"
							onClick={() => onDelete(row.original)}
						>
							<Trash2 className="wwc:h-4 wwc:w-4" />
							Delete crew
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}

const uniqueCrewValues = (crews: Crew[], key: "type" | "discipline" | "managerName") =>
	Array.from(new Set(crews.map((c) => c[key]))).sort();

function IconAction({label, icon, onClick}: {label: string; icon: React.ReactNode; onClick?: () => void}) {
	return (
		<HoverTooltip content={label}>
			<Button variant="outline" icon aria-label={label} onClick={onClick}>
				{icon}
			</Button>
		</HoverTooltip>
	);
}

function CrewsList({
	crews,
	onOpen,
	onAdd,
	onEdit,
	onDelete,
}: {
	crews: Crew[];
	onOpen: (crew: Crew) => void;
	onAdd: () => void;
	onEdit: (crew: Crew) => void;
	onDelete: (ids: string[]) => void;
}) {
	const [filters, setFilters] = useState<FilterValue>({});
	const columns = useMemo(
		() => makeCrewColumns(onOpen, onEdit, (crew) => onDelete([crew.id])),
		[onOpen, onEdit, onDelete],
	);

	const filtered = useMemo(
		() =>
			crews.filter((crew) =>
				Object.entries(filters).every(([key, selected]) => {
					if (!selected || selected.length === 0) return true;
					return selected.includes(String(crew[key as keyof Crew]));
				}),
			),
		[crews, filters],
	);

	const totalWorkers = useMemo(() => filtered.reduce((sum, c) => sum + c.members.length, 0), [filtered]);

	return (
		<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:p-6">
			<div className="wwc:mb-4 wwc:grid wwc:grid-cols-1 wwc:gap-4 wwc:sm:grid-cols-2">
				<MetricCard title="Total Crews" value={filtered.length} />
				<MetricCard title="Total Workers Assigned to Crews" value={totalWorkers.toLocaleString()} />
			</div>

			<Filter value={filters} onChange={setFilters}>
				<DataTable
					columns={columns}
					data={filtered}
					searchKey="name"
					searchPlaceholder="Search crews…"
					showColumnToggle
					recordLabel="crew"
					pageSize={15}
					toolbarExtra={
						<>
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="type" label="Crew Type">
									{uniqueCrewValues(crews, "type").map((type) => (
										<FilterOption key={type} value={type}>
											{type}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="discipline" label="Discipline">
									{uniqueCrewValues(crews, "discipline").map((discipline) => (
										<FilterOption key={discipline} value={discipline}>
											{discipline}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="managerName" label="Crew Manager">
									{uniqueCrewValues(crews, "managerName").map((manager) => (
										<FilterOption key={manager} value={manager}>
											{manager}
										</FilterOption>
									))}
								</FilterCategory>
							</FilterContent>
							<IconAction label="Export" icon={<Download className="wwc:h-4 wwc:w-4" />} />
							<Button onClick={onAdd}>
								<Plus className="wwc:h-4 wwc:w-4" />
								Add Crew(s)
							</Button>
						</>
					}
					bulkActions={[
						{
							label: "Delete",
							variant: "destructive",
							icon: <Trash2 className="wwc:h-4 wwc:w-4" />,
							onClick: (selectedIds) => {
								const ids = selectedIds
									.map((index) => filtered[Number(index)]?.id)
									.filter((id): id is string => id !== undefined);
								if (ids.length > 0) onDelete(ids);
							},
						},
					]}
				/>
			</Filter>
		</div>
	);
}

// ─── Crew detail page ────────────────────────────────────────────────────────

function makeRosterColumns(
	onView: (worker: CrewWorker) => void,
	onRemove: (worker: CrewWorker) => void,
): ColumnDef<CrewWorker>[] {
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
			header: ({column}) => <DataTableColumnHeader column={column} title="Worker Name" />,
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
					<div className="wwc:flex wwc:flex-col">
						<span className="wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary">
							{row.original.name}
						</span>
						<span className="wwc:text-xs wwc:text-muted-foreground">{row.original.code}</span>
					</div>
				</button>
			),
		},
		{
			accessorKey: "title",
			header: ({column}) => <DataTableColumnHeader column={column} title="Title" />,
			cell: ({row}) => dash(row.original.title),
		},
		{
			accessorKey: "trade",
			header: ({column}) => <DataTableColumnHeader column={column} title="Trade" />,
			cell: ({row}) => row.original.trade,
		},
		{
			accessorKey: "effectiveDate",
			header: ({column}) => <DataTableColumnHeader column={column} title="Effective Date" />,
			cell: ({row}) => row.original.effectiveDate,
		},
		{
			accessorKey: "shiftType",
			header: ({column}) => <DataTableColumnHeader column={column} title="Shift Type" />,
			cell: ({row}) => row.original.shiftType,
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
							<Users className="wwc:h-4 wwc:w-4" />
							View worker
						</DropdownMenuItem>
						<DropdownMenuItem
							className="wwc:text-destructive wwc:focus:text-destructive"
							onClick={() => onRemove(row.original)}
						>
							<Trash2 className="wwc:h-4 wwc:w-4" />
							Remove from crew
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}

function CrewDetail({crew, onBack, onEdit}: {crew: Crew; onBack: () => void; onEdit: () => void}) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	// Local roster copy so "Remove from crew" is functional; reseeded when the crew changes.
	const [members, setMembers] = useState<CrewWorker[]>(crew.members);
	const [seededId, setSeededId] = useState(crew.id);
	if (seededId !== crew.id) {
		setSeededId(crew.id);
		setMembers(crew.members);
	}
	// Member removal is staged here until the confirm dialog is accepted.
	const [pendingRemove, setPendingRemove] = useState<CrewWorker | null>(null);
	const columns = useMemo(
		() =>
			makeRosterColumns(
				(w) => setSelectedId(w.id),
				(w) => setPendingRemove(w),
			),
		[],
	);
	const selected = members.find((w) => w.id === selectedId) ?? null;

	return (
		<PushPanelProvider open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)} side="right">
			<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
				{/* Page header — back button, crew name, Edit */}
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-4 wwc:border-b wwc:border-border wwc:px-6 wwc:py-3">
					<div className="wwc:flex wwc:items-center wwc:gap-3">
						<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
							<ArrowLeft className="wwc:h-4 wwc:w-4" />
							Back
						</Button>
						<div className="wwc:h-5 wwc:w-px wwc:bg-border" />
						<h1 className="wwc:text-lg wwc:font-semibold wwc:tracking-tight">{crew.name}</h1>
					</div>
					<Button variant="outline" size="sm" className="wwc:gap-1.5" onClick={onEdit}>
						<SquarePen className="wwc:h-4 wwc:w-4" />
						Edit
					</Button>
				</div>

				<PushPanelContainer className="wwc:min-h-0 wwc:flex-1">
					<PushPanelMain className="wwc:h-full wwc:overflow-auto">
						<div className="wwc:w-full wwc:p-6">
							<div className="wwc:mb-6 wwc:grid wwc:grid-cols-1 wwc:gap-4 wwc:md:grid-cols-3">
								<Card className="wwc:p-4">
									<span className="wwc:text-sm wwc:text-muted-foreground">Crew Manager</span>
									<div className="wwc:mt-2 wwc:flex wwc:items-center wwc:gap-2">
										<Avatar className="wwc:h-8 wwc:w-8">
											<AvatarFallback className="wwc:text-[10px]">{initials(crew.managerName)}</AvatarFallback>
										</Avatar>
										<div className="wwc:flex wwc:flex-col">
											<span className="wwc:font-medium">{crew.managerName}</span>
											<span className="wwc:text-xs wwc:text-muted-foreground">{crew.managerId}</span>
										</div>
									</div>
								</Card>
								<Card className="wwc:p-4">
									<span className="wwc:text-sm wwc:text-muted-foreground">Total Workers</span>
									<div className="wwc:mt-2 wwc:text-2xl wwc:font-bold wwc:tabular-nums">{members.length}</div>
								</Card>
								<Card className="wwc:p-4">
									<span className="wwc:text-sm wwc:text-muted-foreground">Created at</span>
									<div className="wwc:mt-2 wwc:text-lg wwc:font-semibold">{crew.createdAt}</div>
								</Card>
							</div>

							<DataTable
								columns={columns}
								data={members}
								searchKey="name"
								searchPlaceholder="Search"
								recordLabel="worker"
								pageSize={15}
								toolbarExtra={
									<>
										<Button variant="outline">
											<Download className="wwc:h-4 wwc:w-4" />
											Export
										</Button>
										<Button onClick={() => toast.success("Assign workers — pick from the roster")}>
											<Plus className="wwc:h-4 wwc:w-4" />
											Assign Worker(s)
										</Button>
									</>
								}
							/>
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
							<WorkerProfile general={crewWorkerGeneral(selected, crew)} device={crewWorkerDevice(selected)} />
						)}
					</PushPanel>
				</PushPanelContainer>
			</div>
			<ConfirmDialog
				open={pendingRemove !== null}
				onOpenChange={(o) => !o && setPendingRemove(null)}
				destructive
				title="Remove from crew?"
				description={
					<>
						<span className="wwc:font-medium wwc:text-foreground">{pendingRemove?.name ?? "This worker"}</span> will be
						removed from {crew.name}. The worker's own record stays intact.
					</>
				}
				confirmLabel="Remove"
				onConfirm={() => {
					if (!pendingRemove) return;
					setMembers((prev) => prev.filter((m) => m.id !== pendingRemove.id));
					toast.success(`${pendingRemove.name} removed from ${crew.name}`);
					setPendingRemove(null);
				}}
			/>
		</PushPanelProvider>
	);
}

// ─── View ────────────────────────────────────────────────────────────────────

/** The Crews tab — a crew list that drills into a crew detail page, with an Add/Edit crew modal. */
export function CrewsView() {
	const [crews, setCrews] = useState<Crew[]>(CREWS);
	const [openCrewId, setOpenCrewId] = useState<string | null>(null);
	const [modal, setModal] = useState<{mode: "add" | "edit"; crewId: string | null} | null>(null);
	// Crew deletion is staged here until the confirm dialog is accepted.
	const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

	const openCrew = crews.find((c) => c.id === openCrewId) ?? null;

	const [ownToaster, setOwnToaster] = useState(false);
	useEffect(() => {
		const has = document.querySelector('[data-sonner-toaster], section[aria-live][aria-label*="Notification"]');
		setOwnToaster(!has);
	}, []);

	const draftFor = (crewId: string | null): CrewDraft => {
		const crew = crews.find((c) => c.id === crewId);
		if (!crew) return EMPTY_DRAFT;
		const mgr = CREW_MANAGERS.find((m) => m.name === crew.managerName);
		return {
			name: crew.name,
			code: crew.code,
			managerId: mgr?.id ?? "",
			effectiveDate: undefined,
			type: crew.type,
			discipline: crew.discipline,
		};
	};

	const submit = (draft: CrewDraft) => {
		const mgr = CREW_MANAGERS.find((m) => m.id === draft.managerId);
		if (modal?.mode === "edit" && modal.crewId) {
			setCrews((prev) =>
				prev.map((c) =>
					c.id === modal.crewId
						? {
								...c,
								name: draft.name,
								code: draft.code,
								managerName: mgr?.name ?? c.managerName,
								managerId: draft.managerId,
								type: draft.type,
								discipline: draft.discipline,
							}
						: c,
				),
			);
			toast.success(`Crew “${draft.name}” updated`);
		} else {
			const id = `c-new-${draft.code || draft.name}`;
			setCrews((prev) => [
				{
					id,
					name: draft.name,
					code: draft.code,
					managerName: mgr?.name ?? "—",
					managerId: draft.managerId,
					type: draft.type,
					discipline: draft.discipline,
					createdAt: "26 Jul, 2026",
					missingInfo: false,
					members: [],
				},
				...prev,
			]);
			toast.success(`Crew “${draft.name}” created`);
		}
	};

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
			{openCrew ? (
				<CrewDetail
					crew={openCrew}
					onBack={() => setOpenCrewId(null)}
					onEdit={() => setModal({mode: "edit", crewId: openCrew.id})}
				/>
			) : (
				<CrewsList
					crews={crews}
					onOpen={(crew) => setOpenCrewId(crew.id)}
					onAdd={() => setModal({mode: "add", crewId: null})}
					onEdit={(crew) => setModal({mode: "edit", crewId: crew.id})}
					onDelete={(ids) => setPendingDelete(ids)}
				/>
			)}

			<CrewFormModal
				open={modal !== null}
				onOpenChange={(o) => !o && setModal(null)}
				mode={modal?.mode ?? "add"}
				initial={modal ? draftFor(modal.crewId) : EMPTY_DRAFT}
				onSubmit={submit}
			/>
			<ConfirmDialog
				open={pendingDelete !== null}
				onOpenChange={(o) => !o && setPendingDelete(null)}
				destructive
				title={pendingDelete && pendingDelete.length > 1 ? "Delete crews?" : "Delete crew?"}
				description={
					pendingDelete ? (
						pendingDelete.length > 1 ? (
							<>
								{pendingDelete.length} crews will be permanently deleted. Their worker assignments are released. This
								can't be undone.
							</>
						) : (
							<>
								<span className="wwc:font-medium wwc:text-foreground">
									{crews.find((c) => c.id === pendingDelete[0])?.name ?? "This crew"}
								</span>{" "}
								will be permanently deleted. Its worker assignments are released. This can't be undone.
							</>
						)
					) : null
				}
				confirmLabel="Delete"
				onConfirm={() => {
					if (!pendingDelete) return;
					const set = new Set(pendingDelete);
					setCrews((prev) => prev.filter((c) => !set.has(c.id)));
					toast.success(pendingDelete.length > 1 ? `${pendingDelete.length} crews deleted` : "Crew deleted");
					setPendingDelete(null);
				}}
			/>
			{ownToaster ? <Toaster position="top-right" /> : null}
		</div>
	);
}
