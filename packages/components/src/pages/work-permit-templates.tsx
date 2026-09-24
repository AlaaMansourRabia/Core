import type {ColumnDef} from "@tanstack/react-table";

import {cn} from "@corensystem/coren-utils";
import {Copy, MoreHorizontal, Pencil, Plus, Save, Send, Trash2, X} from "lucide-react";
import {useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Checkbox} from "../checkbox";
import {ConfirmDialog} from "../confirm-dialog";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {toast, Toaster} from "../sonner";
import {Tabs, TabsList, TabsTrigger} from "../tabs";
import {StateMachine, permitTypeColor} from "./state-machine";
import {DEMO_ACTIONS, DEMO_EFFECTS, demoInstancesFor} from "./state-machine-fixtures";
import {FormBuilderWidgetRJSF} from "./typeform/FormBuilderWidgetRJSF";
import {permitInspectionForm} from "./typeform/model";
import {WC3_PROCESSES} from "./wc3-process-data";
import {createProcess, processFacts, seedProcessRecord, type Wc3ProcessRecord} from "./wc3-process-shared";

// Permit Templates — the Templates tab of the Work Permit template. Same shape and behaviour as the
// Workforce Crews list (workforce-crews.tsx): a Filter-wrapped DataTable with search, column toggle,
// row selection, bulk actions and a row-action menu — and, like Crews, NO title band of its own. The
// template's own PageContentHeader already names the surface; a second heading underneath it would be
// the same page announcing itself twice. New Template therefore lives in the table toolbar beside
// Columns, which is where every other list in this repo puts its create action.
//
// One thing Crews does not have: a status tab strip above the table. A template's status is its
// LIFECYCLE, not a facet — a draft and its published successor are different things to work on, not
// two rows of one list — so status switches the table rather than filtering it, and the Filters menu
// is left to the facets that are genuinely orthogonal (type, owner). All is the fourth tab and the
// one the page opens on: the register as a whole, before you have picked a lifecycle to work in.
//
// NO KPI row. It carried four numbers — total, published, drafts, archived — and every one of them is
// the count on a tab three lines below it, so the page opened by saying the same four things twice
// and spent a quarter of the viewport doing it. The tab badges are the counts now.
//
// Every count on this page is DERIVED from PERMIT_TEMPLATES: the tab badges read the same array the
// table renders, so a number can never drift from the rows behind it.
//
// Opening a template swaps this whole view for the EDITOR: StateMachine in its `work-permit`
// variant, whose own shell supplies the Back button. Not a dialog and not a push panel — authoring a
// permit template is a place you go, with its own sections and its own graph, and a sheet over the
// list would put a page inside a panel.

// ─── Data model ──────────────────────────────────────────────────────────────

/** The seven permit types this product issues. Fixture identity, not chrome. */
type PermitType =
	| "Hot Work"
	| "Cold Work"
	| "Confined Space"
	| "Work at Height"
	| "Electrical Work"
	| "Excavation"
	| "Lifting";

type TemplateStatus = "draft" | "published" | "archived";

interface PermitTemplate {
	id: string;
	name: string;
	type: PermitType;
	/** Major version only — a template is republished, never patched in place. */
	version: number;
	status: TemplateStatus;
	/** ISO date; rendered through {@link formatEdited}. */
	lastEdited: string;
	owner: string;
}

/**
 * A display name back to the `permit_type` value the colour map is keyed by.
 *
 * The register carries readable names ("Hot Work") while the ontology rows carry slugs
 * ("hot_work"). Deriving one from the other keeps ONE colour map — see PERMIT_TYPE_COLOR — so a type
 * cannot be red in this table and orange in the editor's pills.
 */
const typeSlug = (type: PermitType) => type.toLowerCase().replace(/\s+/g, "_");

const STATUS_LABEL: Record<TemplateStatus, string> = {
	draft: "Draft",
	published: "Published",
	archived: "Archived",
};

/**
 * What the tab strip switches between: the three lifecycle states, plus All.
 *
 * A separate type from {@link TemplateStatus} on purpose — "all" is not a status a template can be
 * in, and letting it into TemplateStatus would put it in the StatusChip, the row data and the
 * editor's landing argument, none of which can represent it.
 */
type TemplateTab = "all" | TemplateStatus;

const TAB_LABEL: Record<TemplateTab, string> = {all: "All", ...STATUS_LABEL};

const TEMPLATE_TABS: TemplateTab[] = ["all", "draft", "published", "archived"];

const OWNERS = ["Moayad Test", "Sara Idris", "Faisal Otaibi", "Lina Haddad"];

// The seven drafts are the ones the product actually carries today, verbatim — including the
// scratch names (`new`, `drghn`, `jjjj`) and the two RUNBOOK entries, because a template list that
// only ever shows tidy names hides the state a real project is in.
const PERMIT_TEMPLATES: PermitTemplate[] = [
	{
		id: "tpl-d1",
		name: "new",
		type: "Hot Work",
		version: 1,
		status: "draft",
		lastEdited: "2026-07-29",
		owner: OWNERS[0],
	},
	{
		id: "tpl-d2",
		name: "Cold Work Permit (Stage Workflow)",
		type: "Cold Work",
		version: 5,
		status: "draft",
		lastEdited: "2026-08-13",
		owner: OWNERS[1],
	},
	{
		id: "tpl-d3",
		name: "drghn",
		type: "Cold Work",
		version: 1,
		status: "draft",
		lastEdited: "2026-09-01",
		owner: OWNERS[0],
	},
	{
		id: "tpl-d4",
		name: "RUNBOOK — Publish warnings (draft)",
		type: "Cold Work",
		version: 1,
		status: "draft",
		lastEdited: "2026-08-11",
		owner: OWNERS[2],
	},
	{
		id: "tpl-d5",
		name: "RUNBOOK — Unsaved guard (draft)",
		type: "Cold Work",
		version: 1,
		status: "draft",
		lastEdited: "2026-08-12",
		owner: OWNERS[2],
	},
	{
		id: "tpl-d6",
		name: "Test",
		type: "Confined Space",
		version: 1,
		status: "draft",
		lastEdited: "2026-09-01",
		owner: OWNERS[3],
	},
	{
		id: "tpl-d7",
		name: "jjjj",
		type: "Work at Height",
		version: 1,
		status: "draft",
		lastEdited: "2026-07-30",
		owner: OWNERS[0],
	},

	// One live template per permit type — the set a project issues against.
	{
		id: "tpl-p1",
		name: "Hot Work Permit",
		type: "Hot Work",
		version: 4,
		status: "published",
		lastEdited: "2026-08-24",
		owner: OWNERS[1],
	},
	{
		id: "tpl-p2",
		name: "Cold Work Permit",
		type: "Cold Work",
		version: 4,
		status: "published",
		lastEdited: "2026-08-20",
		owner: OWNERS[1],
	},
	{
		id: "tpl-p3",
		name: "Confined Space Entry Permit",
		type: "Confined Space",
		version: 3,
		status: "published",
		lastEdited: "2026-08-18",
		owner: OWNERS[3],
	},
	{
		id: "tpl-p4",
		name: "Work at Height Permit",
		type: "Work at Height",
		version: 3,
		status: "published",
		lastEdited: "2026-08-06",
		owner: OWNERS[0],
	},
	{
		id: "tpl-p5",
		name: "Electrical Isolation Permit",
		type: "Electrical Work",
		version: 2,
		status: "published",
		lastEdited: "2026-07-31",
		owner: OWNERS[2],
	},
	{
		id: "tpl-p6",
		name: "Excavation Permit",
		type: "Excavation",
		version: 2,
		status: "published",
		lastEdited: "2026-07-22",
		owner: OWNERS[2],
	},
	{
		id: "tpl-p7",
		name: "Lifting Operations Permit",
		type: "Lifting",
		version: 2,
		status: "published",
		lastEdited: "2026-07-15",
		owner: OWNERS[3],
	},

	// Superseded versions of the live set, plus two retired pilots. Archived rows keep their version
	// so the history reads as a chain: Hot Work v1-v3 sit under the published v4.
	{
		id: "tpl-a1",
		name: "Hot Work Permit",
		type: "Hot Work",
		version: 3,
		status: "archived",
		lastEdited: "2026-06-30",
		owner: OWNERS[1],
	},
	{
		id: "tpl-a2",
		name: "Hot Work Permit",
		type: "Hot Work",
		version: 2,
		status: "archived",
		lastEdited: "2026-05-19",
		owner: OWNERS[1],
	},
	{
		id: "tpl-a3",
		name: "Hot Work Permit",
		type: "Hot Work",
		version: 1,
		status: "archived",
		lastEdited: "2026-04-02",
		owner: OWNERS[0],
	},
	{
		id: "tpl-a4",
		name: "Cold Work Permit",
		type: "Cold Work",
		version: 3,
		status: "archived",
		lastEdited: "2026-06-11",
		owner: OWNERS[1],
	},
	{
		id: "tpl-a5",
		name: "Cold Work Permit",
		type: "Cold Work",
		version: 2,
		status: "archived",
		lastEdited: "2026-05-04",
		owner: OWNERS[0],
	},
	{
		id: "tpl-a6",
		name: "Cold Work Permit",
		type: "Cold Work",
		version: 1,
		status: "archived",
		lastEdited: "2026-03-27",
		owner: OWNERS[0],
	},
	{
		id: "tpl-a7",
		name: "Confined Space Entry Permit",
		type: "Confined Space",
		version: 2,
		status: "archived",
		lastEdited: "2026-06-02",
		owner: OWNERS[3],
	},
	{
		id: "tpl-a8",
		name: "Confined Space Entry Permit",
		type: "Confined Space",
		version: 1,
		status: "archived",
		lastEdited: "2026-04-14",
		owner: OWNERS[3],
	},
	{
		id: "tpl-a9",
		name: "Work at Height Permit",
		type: "Work at Height",
		version: 2,
		status: "archived",
		lastEdited: "2026-05-28",
		owner: OWNERS[0],
	},
	{
		id: "tpl-a10",
		name: "Work at Height Permit",
		type: "Work at Height",
		version: 1,
		status: "archived",
		lastEdited: "2026-03-19",
		owner: OWNERS[2],
	},
	{
		id: "tpl-a11",
		name: "Electrical Isolation Permit",
		type: "Electrical Work",
		version: 1,
		status: "archived",
		lastEdited: "2026-04-23",
		owner: OWNERS[2],
	},
	{
		id: "tpl-a12",
		name: "Excavation Permit",
		type: "Excavation",
		version: 1,
		status: "archived",
		lastEdited: "2026-03-05",
		owner: OWNERS[2],
	},
	{
		id: "tpl-a13",
		name: "Lifting Operations Permit",
		type: "Lifting",
		version: 1,
		status: "archived",
		lastEdited: "2026-02-26",
		owner: OWNERS[3],
	},
	{
		id: "tpl-a14",
		name: "Scaffold Erection Permit (pilot)",
		type: "Work at Height",
		version: 1,
		status: "archived",
		lastEdited: "2026-02-11",
		owner: OWNERS[1],
	},
	{
		id: "tpl-a15",
		name: "Night Hot Work (pilot)",
		type: "Hot Work",
		version: 1,
		status: "archived",
		lastEdited: "2026-01-29",
		owner: OWNERS[1],
	},
	{
		id: "tpl-a16",
		name: "Radiography Permit (retired)",
		type: "Confined Space",
		version: 1,
		status: "archived",
		lastEdited: "2026-01-15",
		owner: OWNERS[3],
	},
];

// ─── Derivations ─────────────────────────────────────────────────────────────

const countBy = (rows: PermitTemplate[], status: TemplateStatus) => rows.filter((row) => row.status === status).length;

/** The ontology binding every permit template authors against — the Work Permit object type. */
const PERMIT_OBJECT_TYPE = "ot_permit";
const PERMIT_STATUS_PROP = "permit_status";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * A graph to open an EXISTING template on.
 *
 * The template register and the process fixtures are separate data today — a row carries no graph of
 * its own — so an existing template opens on a deep clone of the shipped Work Permit lifecycle. Freshly
 * seeded per open, never shared: `seedProcessRecord` also computes the canvas layout, and handing two
 * editors the same record would let a drag in one move a state in the other.
 */
const permitGraph = () => {
	const permit = WC3_PROCESSES.find((process) => process.objectTypeId === PERMIT_OBJECT_TYPE) ?? WC3_PROCESSES[0];
	return seedProcessRecord(permit);
};

/**
 * The graph a NEW template starts on: the standard permit lifecycle — Draft, Submitted, In review,
 * Issued, Closed and Rejected, wired together.
 *
 * NOT a bare Draft + Closed. A permit template is a variation on a lifecycle every permit already
 * shares, not a blank page, and starting from two disconnected states means every new template
 * begins by rebuilding the same six by hand.
 *
 * Exported because it is the START OF A SURFACE, not an internal detail: the New Permit Template
 * story mounts the widget on exactly this, so what Storybook shows and what New Template opens
 * cannot drift.
 *
 * Derived from the shipped lifecycle with its CUSTOM states removed, rather than typed out again as
 * a second fixture that would drift. Custom is precisely the flag for "a specific project added
 * this" — the shipped graph's `Suspended` carries it, and its own evidence note calls it "a labeled
 * custom state added to enable the occupancy gate". Transitions touching a dropped state go with it,
 * and the layout is recomputed by seedProcessRecord so the removal leaves no gap in the row.
 */
export const defaultTemplateGraph = (name: string): Wc3ProcessRecord => {
	const permit = WC3_PROCESSES.find((process) => process.objectTypeId === PERMIT_OBJECT_TYPE) ?? WC3_PROCESSES[0];
	const states = permit.states.filter((state) => !state.custom);
	const kept = new Set(states.map((state) => state.id));
	const transitions = permit.transitions.filter((t) => kept.has(t.from) && kept.has(t.to));
	const lifecycle = seedProcessRecord({...permit, states, transitions});

	// Identity and provenance from a genuinely new record — a fresh process id and the honest
	// "created in this session" notes — with the lifecycle spliced in as its graph. Taking the
	// fixture's record wholesale would give every new template the shipped process's id.
	const base = createProcess({
		name,
		icon: "clipboard",
		objectTypeId: PERMIT_OBJECT_TYPE,
		statusProp: PERMIT_STATUS_PROP,
	});
	return {...base, states: lifecycle.states, transitions: lifecycle.transitions, layout: lifecycle.layout};
};

/**
 * "29 July 2026" — the format the screen this page was drawn from uses.
 *
 * Explicit en-GB rather than the viewer's locale: a permit's edit date is read beside a version
 * number, and a list where one row says 29/07 and the next says 7/29 is worse than a list that is
 * consistently not the reader's convention.
 */
function formatEdited(iso: string) {
	return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	});
}

function TypeChip({type}: {type: PermitType}) {
	return (
		<Badge variant="outline" className={cn("wwc:gap-1.5 wwc:font-normal", permitTypeColor(typeSlug(type)).chip)}>
			{/* bg-current, so the dot can never disagree with the label it sits beside. */}
			<span className="wwc:size-1.5 wwc:shrink-0 wwc:rounded-full wwc:bg-current" />
			{type}
		</Badge>
	);
}

function StatusChip({status}: {status: TemplateStatus}) {
	return (
		<Badge variant={status === "published" ? "successSoft" : "neutralSoft"} className="wwc:font-normal">
			{STATUS_LABEL[status]}
		</Badge>
	);
}

// ─── Columns ─────────────────────────────────────────────────────────────────

function makeTemplateColumns(
	onOpen: (template: PermitTemplate) => void,
	onDuplicate: (template: PermitTemplate) => void,
	onDelete: (template: PermitTemplate) => void,
): ColumnDef<PermitTemplate>[] {
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
			header: ({column}) => <DataTableColumnHeader column={column} title="Template" />,
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
			accessorKey: "type",
			header: ({column}) => <DataTableColumnHeader column={column} title="Type" />,
			cell: ({row}) => <TypeChip type={row.original.type} />,
		},
		{
			accessorKey: "version",
			header: ({column}) => <DataTableColumnHeader column={column} title="Version" />,
			cell: ({row}) => (
				<Badge variant="outline" className="wwc:font-normal wwc:tabular-nums">
					v{row.original.version}
				</Badge>
			),
		},
		{
			accessorKey: "status",
			header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
			cell: ({row}) => <StatusChip status={row.original.status} />,
		},
		{
			accessorKey: "lastEdited",
			header: ({column}) => <DataTableColumnHeader column={column} title="Last edited" />,
			meta: {cellClassName: "wwc:whitespace-nowrap wwc:text-muted-foreground"},
			cell: ({row}) => formatEdited(row.original.lastEdited),
		},
		{
			accessorKey: "owner",
			header: ({column}) => <DataTableColumnHeader column={column} title="Owner" />,
			meta: {cellClassName: "wwc:whitespace-nowrap"},
			cell: ({row}) => row.original.owner,
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
					<DropdownMenuContent align="end" className="wwc:w-48">
						<DropdownMenuItem onClick={() => onOpen(row.original)}>
							<Pencil className="wwc:h-4 wwc:w-4" />
							Open template
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onDuplicate(row.original)}>
							<Copy className="wwc:h-4 wwc:w-4" />
							Duplicate as draft
						</DropdownMenuItem>
						<DropdownMenuItem
							className="wwc:text-destructive wwc:focus:text-destructive"
							onClick={() => onDelete(row.original)}
						>
							<Trash2 className="wwc:h-4 wwc:w-4" />
							Delete template
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}

const uniqueValues = (rows: PermitTemplate[], key: "type" | "owner") =>
	Array.from(new Set(rows.map((row) => row[key]))).sort();

// ─── The view ────────────────────────────────────────────────────────────────

/**
 * The Templates tab of the Work Permit template.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import.
 */
export function PermitTemplatesView() {
	const [templates, setTemplates] = useState<PermitTemplate[]>(PERMIT_TEMPLATES);
	// Opens on All: the register as a whole, which is what the KPI row used to answer.
	const [tab, setTab] = useState<TemplateTab>("all");
	const [filters, setFilters] = useState<FilterValue>({});
	const [pendingDelete, setPendingDelete] = useState<PermitTemplate[] | null>(null);
	const [pendingDiscard, setPendingDiscard] = useState(false);
	// The open editor: which ROW is being authored, the process graph behind it, and whether the row was
	// created by this session. `isNew` drives the header readouts — see the StateMachine call below.
	const [editing, setEditing] = useState<{
		templateId: string;
		process: Wc3ProcessRecord;
		isNew: boolean;
		/**
		 * The row exactly as the editor opened on it, so Discard has something to restore.
		 *
		 * Needed because edits apply LIVE — commitProcess syncs the name on every keystroke — so
		 * "discard" cannot mean "do not apply", only "put back what was there". Null for a new template:
		 * there is no earlier version, and discarding one deletes the row it created.
		 */
		snapshot: PermitTemplate | null;
	} | null>(null);

	const counts: Record<TemplateTab, number> = useMemo(
		() => ({
			all: templates.length,
			draft: countBy(templates, "draft"),
			published: countBy(templates, "published"),
			archived: countBy(templates, "archived"),
		}),
		[templates],
	);

	// The tab switches the table; the Filter menu narrows what is left. Applying both in one pass keeps
	// the row count in the footer honest — it counts what is on screen, not what is in the array.
	const rows = useMemo(
		() =>
			templates.filter(
				(template) =>
					(tab === "all" || template.status === tab) &&
					Object.entries(filters).every(([key, selected]) => {
						if (!selected || selected.length === 0) return true;
						return selected.includes(String(template[key as keyof PermitTemplate]));
					}),
			),
		[templates, tab, filters],
	);

	const openTemplate = (template: PermitTemplate) =>
		setEditing({
			templateId: template.id,
			process: {...permitGraph(), name: template.name},
			isNew: false,
			snapshot: template,
		});

	/**
	 * New Template creates the draft ROW first, then opens it.
	 *
	 * Not "author, then save": a draft IS the unsaved state, so a New Template that vanished on Back
	 * would be a dead end, and one that only appears after an explicit save would need a save button
	 * this surface does not have. The fixture is the evidence — `new`, `drghn` and `jjjj` are exactly
	 * what a draft-first list accumulates.
	 *
	 * It opens on the standard lifecycle, not an empty graph — see {@link defaultTemplateGraph}.
	 */
	const newTemplate = () => {
		const draft: PermitTemplate = {
			id: `tpl-new-${Date.now()}`,
			name: "Untitled template",
			type: "Hot Work",
			version: 1,
			status: "draft",
			lastEdited: today(),
			owner: OWNERS[0],
		};
		setTemplates((all) => [draft, ...all]);
		setTab("draft");
		setEditing({templateId: draft.id, isNew: true, snapshot: null, process: defaultTemplateGraph(draft.name)});
	};

	/**
	 * Every commit from the builder lands here. The row's NAME follows the record's, because the
	 * builder's General section edits `process.name` and a list showing the old name beside an editor
	 * showing the new one is the drift this mirroring exists to prevent.
	 */
	const commitProcess = (next: Wc3ProcessRecord) => {
		setEditing((open) => (open ? {...open, process: next} : open));
		setTemplates((all) =>
			all.map((template) =>
				template.id === editing?.templateId ? {...template, name: next.name, lastEdited: today()} : template,
			),
		);
	};

	const duplicateTemplate = (template: PermitTemplate) => {
		// A duplicate always lands as a v1 DRAFT: copying a published template and keeping its version
		// would put two rows at the same version, and the list could not say which one is live.
		const copy: PermitTemplate = {
			...template,
			id: `${template.id}-copy-${Date.now()}`,
			name: `${template.name} (copy)`,
			version: 1,
			status: "draft",
			lastEdited: new Date().toISOString().slice(0, 10),
		};
		setTemplates((all) => [copy, ...all]);
		setTab("draft");
		toast.success(`Duplicated as “${copy.name}”`);
	};

	const confirmDelete = () => {
		if (!pendingDelete) return;
		const ids = new Set(pendingDelete.map((template) => template.id));
		setTemplates((all) => all.filter((template) => !ids.has(template.id)));
		toast.success(pendingDelete.length === 1 ? "Template deleted" : `${pendingDelete.length} templates deleted`);
		setPendingDelete(null);
	};

	/** Close the editor and land the user on the tab the row now lives in. */
	const closeEditor = (landOn: TemplateStatus) => {
		setTab(landOn);
		setEditing(null);
	};

	const saveDraft = () => {
		if (!editing) return;
		setTemplates((all) =>
			all.map((template) =>
				template.id === editing.templateId
					? {...template, name: editing.process.name, status: "draft", lastEdited: today()}
					: template,
			),
		);
		toast.success(`Saved “${editing.process.name}” as a draft`);
		closeEditor("draft");
	};

	const publish = () => {
		if (!editing) return;
		const lint = processFacts(editing.process).lint;
		if (lint.length > 0) {
			// REFUSED, not disabled — the same rule CreateProcessDialog follows: a press while incomplete
			// names exactly what is missing, where a greyed-out button would leave the user guessing which
			// of seven rules it is waiting on. The messages are the engine's own, verbatim.
			toast.error(`Cannot publish — ${lint.length} rule${lint.length === 1 ? "" : "s"} still failing`, {
				description: lint.map((error) => `${error.rule} · ${error.msg}`).join("\n"),
			});
			return;
		}
		setTemplates((all) =>
			all.map((template) =>
				template.id === editing.templateId
					? {...template, name: editing.process.name, status: "published", lastEdited: today()}
					: template,
			),
		);
		toast.success(`Published “${editing.process.name}”`);
		closeEditor("published");
	};

	const discard = () => {
		if (!editing) return;
		const {isNew, snapshot, templateId} = editing;
		// A new template has no earlier version to restore, so discarding it removes the row New Template
		// created. An existing one is put back exactly as the editor found it.
		setTemplates((all) =>
			isNew
				? all.filter((template) => template.id !== templateId)
				: all.map((template) => (template.id === templateId && snapshot ? snapshot : template)),
		);
		toast(isNew ? "Draft discarded" : "Changes discarded");
		closeEditor(snapshot?.status ?? "draft");
		setPendingDiscard(false);
	};

	const columns = useMemo(
		() => makeTemplateColumns(openTemplate, duplicateTemplate, (template) => setPendingDelete([template])),
		[],
	);

	if (editing) {
		// The builder's own shell carries the header band and the Back button — passing `onBack` is what
		// draws it. No wrapper here: it manages its own height and scrolling.
		return (
			<>
				<StateMachine
					variant="work-permit"
					// The "Form" section hosts the permit's request form. Authors design it with the RJSF
					// form builder (builder-only: no forms table, no Publish — the section IS the editor),
					// seeded with a starter Permit inspection form.
					sectionLabels={{form: "Forms"}}
					formSlot={<FormBuilderWidgetRJSF mode="builder" seedForms={[permitInspectionForm()]} />}
					// Demo vocabularies, passed explicitly — see the note in wc3-process-detail.tsx.
					actions={DEMO_ACTIONS}
					effects={DEMO_EFFECTS}
					instances={demoInstancesFor(editing.process)}
					process={editing.process}
					onChange={commitProcess}
					// Back LEAVES, it does not commit. Every edit is already applied to the row, so Back is
					// "stop editing"; the three explicit outcomes are what the header actions are for.
					onBack={() => closeEditor(editing.snapshot?.status ?? "draft")}
					// A template created moments ago has no product, no SLA model and no tokens of its own, and
					// every rule it fails is just "not finished yet" — so authoring mode strips the readouts, the
					// two live-work sections and the provenance cards. An existing template keeps them all:
					// there the numbers are real.
					authoring={editing.isNew}
					headerActions={
						<>
							{/* Discard first and quietest, the two commits to its right in ascending consequence:
							    ghost, outline, filled. Reading order matches how hard each is to undo. */}
							<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={() => setPendingDiscard(true)}>
								<X className="wwc:h-4 wwc:w-4" />
								Discard
							</Button>
							<Button variant="outline" size="sm" className="wwc:gap-1.5" onClick={saveDraft}>
								<Save className="wwc:h-4 wwc:w-4" />
								Save as draft
							</Button>
							<Button size="sm" className="wwc:gap-1.5" onClick={publish}>
								<Send className="wwc:h-4 wwc:w-4" />
								Save and publish
							</Button>
						</>
					}
				/>

				<ConfirmDialog
					open={pendingDiscard}
					onOpenChange={setPendingDiscard}
					title={editing.isNew ? "Discard draft" : "Discard changes"}
					description={
						editing.isNew
							? `“${editing.process.name}” has not been saved. Discarding removes it from the register.`
							: `“${editing.process.name}” goes back to how it was when you opened it. Edits made since are lost.`
					}
					confirmLabel="Discard"
					destructive
					onConfirm={discard}
				/>
				<Toaster position="top-right" />
			</>
		);
	}

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-auto">
			<div className="wwc:p-6">
				{/*
				 * Status is a LIFECYCLE, so it switches the table rather than joining the Filters menu:
				 * a draft and its published successor are different things to work on, not two rows of one
				 * list. The badges are the counts the KPI row used to print, one line up from the rows they
				 * describe instead of four cards away from them.
				 */}
				<Tabs value={tab} onValueChange={(value) => setTab(value as TemplateTab)} className="wwc:mb-4">
					<TabsList>
						{TEMPLATE_TABS.map((id) => (
							<TabsTrigger key={id} value={id}>
								{TAB_LABEL[id]}
								<Badge variant="secondary" className="wwc:ml-2 wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
									{counts[id]}
								</Badge>
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>

				<Filter value={filters} onChange={setFilters}>
					<DataTable
						// Keyed on status: the table owns selection and page state, and carrying a page-2
						// selection across into a shorter tab would leave rows selected that are not shown.
						key={tab}
						columns={columns}
						data={rows}
						searchKey="name"
						searchPlaceholder="Search templates…"
						showColumnToggle
						recordLabel="template"
						pageSize={15}
						toolbarExtra={
							<>
								<FilterTrigger />
								<FilterContent>
									<FilterCategory value="type" label="Permit Type">
										{uniqueValues(templates, "type").map((type) => (
											<FilterOption key={type} value={type}>
												{type}
											</FilterOption>
										))}
									</FilterCategory>
									<FilterCategory value="owner" label="Owner">
										{uniqueValues(templates, "owner").map((owner) => (
											<FilterOption key={owner} value={owner}>
												{owner}
											</FilterOption>
										))}
									</FilterCategory>
								</FilterContent>
								{/* Last in `toolbarExtra`, which DataTable renders immediately before its Columns toggle —
								    the same slot Crews puts "Add Crew(s)" in, so the create action sits where this repo's
								    lists already put it. */}
								<Button onClick={newTemplate}>
									<Plus className="wwc:h-4 wwc:w-4" />
									New Template
								</Button>
							</>
						}
						bulkActions={[
							{
								label: "Delete",
								variant: "destructive",
								icon: <Trash2 className="wwc:h-4 wwc:w-4" />,
								onClick: (selectedIds) => {
									const picked = selectedIds
										.map((index) => rows[Number(index)])
										.filter((template): template is PermitTemplate => template !== undefined);
									if (picked.length > 0) setPendingDelete(picked);
								},
							},
						]}
					/>
				</Filter>
			</div>

			<ConfirmDialog
				open={pendingDelete !== null}
				onOpenChange={(open) => {
					if (!open) setPendingDelete(null);
				}}
				title={pendingDelete && pendingDelete.length > 1 ? "Delete templates" : "Delete template"}
				description={
					pendingDelete && pendingDelete.length > 1
						? `${pendingDelete.length} templates will be deleted. Permits already issued from them are not affected.`
						: `“${pendingDelete?.[0]?.name ?? ""}” will be deleted. Permits already issued from it are not affected.`
				}
				confirmLabel="Delete"
				destructive
				onConfirm={confirmDelete}
			/>
			<Toaster position="top-right" />
		</div>
	);
}
