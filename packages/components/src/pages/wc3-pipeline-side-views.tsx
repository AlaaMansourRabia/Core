import type {ColumnDef, Row} from "@tanstack/react-table";
import type {ReactElement, ReactNode} from "react";

import {cn} from "@corensystem/core-utils";
import {ChevronDown, ChevronRight, LayoutGrid, List, Play, Workflow, XCircle} from "lucide-react";
import {useCallback, useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import {Combobox} from "../combobox";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Empty} from "../empty";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";
import {HoverTooltip} from "../tooltip";
import {usePersistentState} from "../use-persistent-state";
import {
	WC3_NODE_KINDS,
	type Wc3NodeKind,
	type Wc3NodeKindCategory,
	type Wc3Pipeline,
	type Wc3PipelineNode,
	type Wc3PipelineRun,
} from "./wc3-lineage-data";
import {Mono, Pane, TypeGlyphLabel, type Wc3LineageNavTarget, lineageNav} from "./wc3-lineage-shared";
import {getObjectType} from "./wc3-ontology-data";
import {
	NodeKindBadge,
	NodeKindGlyph,
	PipelineGlyph,
	PortDot,
	PortLegend,
	WC3_NODE_CATEGORIES,
	WC3_PORT_TYPES,
	type Wc3PipelineViewMode,
	type Wc3PipelineViewProps,
	checkWire,
	kindConnectivity,
	kindOutputCols,
	kindsUsedIn,
	nodeKindLabel,
	replacePipeline,
	runPipeline,
} from "./wc3-pipeline-shared";

// The Pipelines perspective's two SIDE tabs, in one file because each is a single flat surface with
// no drill-in and they share the node-kind row rendering, the chip and the two empty-state shapes.
//
// PALETTE is the reference catalogue of the 15 node kinds — read-only over the live pipeline array,
// with deliberately NO add affordance, so exactly one surface (the detail's canvas palette) ever
// mutates a pipeline's graph.
//
// RUNS is the run log across every pipeline. The seeded fixture has ZERO runs on all three
// pipelines, so at first paint this tab is genuinely empty and says so; the only thing that fills it
// is running a pipeline in this session.
//
// Both read `pipelines` from props — never WC3_PIPELINES — so a pipeline created or run in-session
// is counted here the moment the shell commits it.

// ─── Shared bits ─────────────────────────────────────────────────────────────

/** A small bordered chip. Same shape as the products catalogue's file-local Chip. */
function Chip({children, title, onClick}: {children: ReactNode; title?: string; onClick?: () => void}) {
	const className =
		"wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/40 wwc:px-1.5 wwc:py-0.5 wwc:text-[10.5px] wwc:text-muted-foreground";
	if (!onClick) {
		return (
			<span className={className} title={title}>
				{children}
			</span>
		);
	}
	return (
		<button
			type="button"
			title={title}
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			className={cn(className, "wwc:transition-colors wwc:hover:border-primary/50 wwc:hover:text-primary")}
		>
			{children}
		</button>
	);
}

/**
 * A port side rendered as dots + type names, or an em dash when the side is empty.
 *
 * Keys are `<type>#<nth occurrence>` rather than the array index: no kind in the fixture carries two
 * ports of the same type on the same side, but the wire encoding is positional and `portPos` supports
 * N ports, so a future multi-port kind must not produce duplicate keys.
 */
function PortList({types}: {types: string[]}) {
	if (types.length === 0) return <span className="wwc:text-muted-foreground">—</span>;
	const seen = new Map<string, number>();
	return (
		<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-2 wwc:gap-y-1">
			{types.map((type) => {
				const nth = (seen.get(type) ?? 0) + 1;
				seen.set(type, nth);
				return (
					<span
						key={`${type}#${nth}`}
						className="wwc:flex wwc:items-center wwc:gap-1 wwc:whitespace-nowrap wwc:text-xs wwc:text-foreground"
					>
						<PortDot type={type} />
						{type}
					</span>
				);
			})}
		</span>
	);
}

/** `kindOutputCols` as Mono chips — or the plain sentence, for the one kind that emits nothing. */
function OutputSchema({kindId}: {kindId: string}) {
	const cols = kindOutputCols(kindId);
	// src_drone is the only kind pipeNodeData returns {cols: [], rows: []} for, so a drone node always
	// runs empty. Saying that in words beats leaving the cell blank and looking like missing data.
	if (cols.length === 0) return <span className="wwc:text-xs wwc:text-muted-foreground">produces no rows</span>;
	return (
		<span className="wwc:flex wwc:flex-wrap wwc:gap-1">
			{cols.map((col) => (
				<Chip key={col}>
					<Mono>{col}</Mono>
				</Chip>
			))}
		</span>
	);
}

/** The mode toggle, identical in both tabs so they cannot drift apart. */
function ModeToggle({
	mode,
	onModeChange,
}: {
	mode: Wc3PipelineViewMode;
	onModeChange: (next: Wc3PipelineViewMode) => void;
}) {
	return (
		<ToggleGroup
			type="single"
			value={mode}
			// Radix emits "" when the active item is pressed again; a segmented control has no
			// "neither" state, so that is swallowed.
			onValueChange={(next) => {
				if (next) onModeChange(next as Wc3PipelineViewMode);
			}}
			variant="outline"
			size="sm"
		>
			<ToggleGroupItem value="table" aria-label="Table view" title="Table view">
				<List className="wwc:h-3.5 wwc:w-3.5" />
			</ToggleGroupItem>
			<ToggleGroupItem value="cards" aria-label="Card view" title="Card view">
				<LayoutGrid className="wwc:h-3.5 wwc:w-3.5" />
			</ToggleGroupItem>
		</ToggleGroup>
	);
}

/** Shown by BOTH the table's `emptyMessage` and the grid callback, so the two modes cannot drift. */
function FilteredEmpty({noun, onClear}: {noun: string; onClear: () => void}) {
	return (
		<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2 wwc:py-8 wwc:text-center">
			<p className="wwc:text-sm wwc:text-muted-foreground">{`No ${noun} matches the search and filter.`}</p>
			<Button variant="outline" size="sm" onClick={onClear}>
				Clear the filter
			</Button>
		</div>
	);
}

// ─── Palette: the wiring rules, quoted rather than paraphrased ───────────────

/**
 * The four refusals, produced by CALLING {@link checkWire} on a throwaway pipeline built to trip
 * exactly one guard each — not by restating them.
 *
 * That matters: the strings are the shared module's single source of truth (they include the
 * prototype's ungrammatical "a Objects", kept verbatim by decision), and a rules panel that
 * paraphrased them would give the perspective two vocabularies for the same rule. This way the panel
 * physically cannot drift from the canvas banner.
 *
 * The mismatch example is Geometry → Objects into a Clash filter, which is the pair captured live in
 * the prototype.
 */
const ruleNode = (id: string, kind: string): Wc3PipelineNode => ({
	id,
	kind,
	label: nodeKindLabel(kind),
	x: 0,
	y: 0,
	params: {},
});

const RULES_PIPELINE: Wc3Pipeline = {
	id: "pipe_rules_probe",
	name: "",
	icon: "pipeline",
	dropRev: 1,
	desc: "",
	nodes: [
		ruleNode("geo", "src_ifc"), //      [] → Geometry
		ruleNode("clash", "tx_clash"), //   Objects → Objects
		ruleNode("uni", "tx_uniclass"), //  Objects → Objects
		ruleNode("map", "bhom_map"), //     Objects → Objects
	],
	// Occupies uni:0 (so guard 3 fires) and makes map reach uni (so guard 4 fires).
	wires: [{id: "w1", from: "map:0", to: "uni:0"}],
	runs: [],
};

const ruleReason = (from: string, to: string): string => {
	const check = checkWire(RULES_PIPELINE, from, to);
	return check.ok ? "" : check.reason;
};

const WIRING_RULES: {title: string; reason: string}[] = [
	{title: "A node cannot feed itself", reason: ruleReason("clash:0", "clash:0")},
	{title: "Port types must match exactly", reason: ruleReason("geo:0", "clash:0")},
	{title: "One wire per input", reason: ruleReason("clash:0", "uni:0")},
	{title: "The graph stays acyclic", reason: ruleReason("uni:0", "map:0")},
];

function WiringRulesPanel() {
	return (
		<Card className="wwc:flex wwc:flex-col wwc:gap-3 wwc:rounded-lg wwc:p-4">
			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:justify-between wwc:gap-2">
				<div className="wwc:text-sm wwc:font-semibold">Wiring rules</div>
				{/* The same component the canvas footer renders, so the key can never drift. */}
				<PortLegend />
			</div>
			<p className="wwc:text-xs wwc:text-muted-foreground">
				A wire is refused for exactly these four reasons, in this order. Type checking is plain equality — there is no
				subtyping and no coercion. An input takes exactly one wire; an output fans out without limit.
			</p>
			<ol className="wwc:grid wwc:gap-2 wwc:sm:grid-cols-2">
				{WIRING_RULES.map((rule, i) => (
					<li key={rule.title} className="wwc:flex wwc:gap-2 wwc:rounded-md wwc:bg-muted/40 wwc:p-2">
						<XCircle className="wwc:mt-0.5 wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-amber-600" />
						<span className="wwc:min-w-0">
							<span className="wwc:block wwc:text-xs wwc:font-medium">{`${i + 1}. ${rule.title}`}</span>
							<span className="wwc:block wwc:text-[11px] wwc:text-muted-foreground">{rule.reason}</span>
						</span>
					</li>
				))}
			</ol>
		</Card>
	);
}

// ─── Palette: rows, facets and the card ──────────────────────────────────────

type KindRow = {
	id: string;
	kind: Wc3NodeKind;
	/** Live — a pipeline created this session counts. */
	usedIn: Wc3Pipeline[];
};

/** Distinct port types a kind touches on EITHER side — what the "Port type" facet matches on. */
const kindPortTypes = (kind: Wc3NodeKind): string[] => [...new Set([...kind.inPorts, ...kind.outPorts])];

const kindSearchText = (row: KindRow): string =>
	[row.id, row.kind.label, row.kind.cat, kindPortTypes(row.kind).join(" "), kindOutputCols(row.id).join(" ")].join(" ");

/** Category counts off the fixture — the palette is the catalogue of kinds, not of pipelines. */
const CATEGORY_COUNTS = new Map<string, number>(
	WC3_NODE_CATEGORIES.map((cat) => [cat, Object.values(WC3_NODE_KINDS).filter((k) => k.cat === cat).length]),
);

const PORT_TYPE_COUNTS = new Map<string, number>(
	WC3_PORT_TYPES.map((type) => [
		type,
		Object.values(WC3_NODE_KINDS).filter((k) => kindPortTypes(k).includes(type)).length,
	]),
);

function RefChips({refs, onNavigate}: {refs: string[] | undefined; onNavigate?: (t: Wc3LineageNavTarget) => void}) {
	if (!refs || refs.length === 0) return <span className="wwc:text-muted-foreground">—</span>;
	return (
		<span className="wwc:flex wwc:flex-wrap wwc:gap-1">
			{refs.map((otId) => (
				<Chip
					key={otId}
					title={`Open ${getObjectType(otId)?.displayName ?? otId} in the Ontology perspective`}
					onClick={onNavigate ? () => onNavigate(lineageNav.objectType(otId)) : undefined}
				>
					<TypeGlyphLabel type={getObjectType(otId)} />
				</Chip>
			))}
		</span>
	);
}

function UsedInChips({usedIn, onNavigate}: {usedIn: Wc3Pipeline[]; onNavigate?: (t: Wc3LineageNavTarget) => void}) {
	if (usedIn.length === 0) {
		return <span className="wwc:text-xs wwc:text-muted-foreground">no pipeline</span>;
	}
	return (
		<span className="wwc:flex wwc:flex-wrap wwc:gap-1">
			{usedIn.map((p) => (
				<Chip
					key={p.id}
					title={`Open ${p.name}`}
					onClick={onNavigate ? () => onNavigate(lineageNav.pipeline(p.id)) : undefined}
				>
					<PipelineGlyph pipeline={p} className="wwc:h-3 wwc:w-3 wwc:shrink-0" />
					{p.name}
				</Chip>
			))}
		</span>
	);
}

function KindCard({row, onNavigate}: {row: KindRow; onNavigate?: (t: Wc3LineageNavTarget) => void}) {
	const {kind} = row;
	return (
		<Card className="wwc:flex wwc:flex-col wwc:gap-2 wwc:rounded-lg wwc:p-3" data-node-kind={row.id}>
			<div className="wwc:flex wwc:items-start wwc:gap-2">
				<span className="wwc:flex wwc:h-7 wwc:w-7 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/50">
					<NodeKindGlyph kindId={row.id} />
				</span>
				<span className="wwc:min-w-0 wwc:flex-1">
					<span className="wwc:block wwc:truncate wwc:text-sm wwc:font-semibold">{kind.label}</span>
					<Mono>{row.id}</Mono>
				</span>
				<NodeKindBadge kindId={row.id} />
			</div>

			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-2 wwc:gap-y-1 wwc:text-xs wwc:text-muted-foreground">
				in <PortList types={kind.inPorts} />
				<span className="wwc:text-border">→</span>
				out <PortList types={kind.outPorts} />
			</div>

			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1 wwc:text-xs wwc:text-muted-foreground">
				emits <OutputSchema kindId={row.id} />
			</div>

			{kind.refs && kind.refs.length > 0 && (
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1 wwc:text-xs wwc:text-muted-foreground">
					references <RefChips refs={kind.refs} onNavigate={onNavigate} />
				</div>
			)}

			<div className="wwc:mt-auto wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1 wwc:pt-1 wwc:text-xs wwc:text-muted-foreground">
				used in <UsedInChips usedIn={row.usedIn} onNavigate={onNavigate} />
			</div>
		</Card>
	);
}

// ─── Palette view ────────────────────────────────────────────────────────────

export function PipelinePaletteView({pipelines, onNavigate}: Wc3PipelineViewProps): ReactElement {
	const [filters, setFilters] = useState<FilterValue>({});
	// Controlled so the filtered empty state can clear the query as well as the facets.
	const [query, setQuery] = useState("");
	// Cards default: grouped by category, this is the closest thing to the prototype's sidebar and the
	// only mode that shows every fact about a kind at once.
	const [mode, setMode] = usePersistentState<Wc3PipelineViewMode>("wc3.pipelines.palette.view", "cards");

	const usage = useMemo(() => kindsUsedIn(pipelines), [pipelines]);

	const rows = useMemo<KindRow[]>(
		() =>
			Object.entries(WC3_NODE_KINDS).map(([id, kind]) => ({
				id,
				kind,
				usedIn: usage.get(id) ?? [],
			})),
		[usage],
	);

	const usedCount = useMemo(() => rows.filter((r) => r.usedIn.length > 0).length, [rows]);

	const clearAll = useCallback(() => {
		setFilters({});
		setQuery("");
	}, []);

	// ONE predicate for both modes — the toggle changes what DataTable's body renders, never what it
	// filters.
	const data = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return rows.filter((row) => {
			if (needle && !kindSearchText(row).toLowerCase().includes(needle)) return false;
			const cats = filters.category;
			if (cats && cats.length > 0 && !cats.includes(row.kind.cat)) return false;
			const ports = filters.portType;
			if (ports && ports.length > 0 && !ports.some((t) => kindPortTypes(row.kind).includes(t))) return false;
			const usedFacet = filters.usage;
			if (usedFacet && usedFacet.length > 0 && !usedFacet.includes(row.usedIn.length > 0 ? "used" : "unused")) {
				return false;
			}
			return true;
		});
	}, [filters, query, rows]);

	const columns: ColumnDef<KindRow, unknown>[] = useMemo(
		() => [
			{
				// Space-separated lowercase ids: the column-toggle popover capitalises `column.id`.
				id: "kind",
				accessorFn: (row) => row.kind.label,
				header: ({column}) => <DataTableColumnHeader column={column} title="Kind" />,
				enableHiding: false,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap">
						<span className="wwc:flex wwc:h-6 wwc:w-6 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/50">
							<NodeKindGlyph kindId={row.original.id} />
						</span>
						<span className="wwc:min-w-0">
							<span className="wwc:block wwc:truncate wwc:font-medium">{row.original.kind.label}</span>
							<Mono>{row.original.id}</Mono>
						</span>
					</span>
				),
			},
			{
				id: "category",
				accessorFn: (row) => row.kind.cat,
				header: ({column}) => <DataTableColumnHeader column={column} title="Category" />,
				cell: ({row}) => <NodeKindBadge kindId={row.original.id} />,
			},
			{
				id: "in ports",
				accessorFn: (row) => row.kind.inPorts.join(", "),
				header: "In ports",
				cell: ({row}) => <PortList types={row.original.kind.inPorts} />,
			},
			{
				id: "out ports",
				accessorFn: (row) => row.kind.outPorts.join(", "),
				header: "Out ports",
				cell: ({row}) => <PortList types={row.original.kind.outPorts} />,
			},
			{
				id: "output schema",
				accessorFn: (row) => kindOutputCols(row.id).join(", "),
				header: "Output schema",
				cell: ({row}) => <OutputSchema kindId={row.original.id} />,
			},
			{
				id: "used in",
				accessorFn: (row) => row.usedIn.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Used in" />,
				cell: ({row}) => <UsedInChips usedIn={row.original.usedIn} onNavigate={onNavigate} />,
			},
			{
				// The only reason a Transform knows about the ontology, and the edge Impact traverses.
				id: "references",
				accessorFn: (row) => (row.kind.refs ?? []).join(", "),
				header: "References",
				cell: ({row}) => <RefChips refs={row.original.kind.refs} onNavigate={onNavigate} />,
			},
			{
				// Hidden by default: it is a derived reachability read, useful when you are hunting for the
				// adapter that unblocks a chain, noise the rest of the time. Geometry is the striking one —
				// two kinds emit it and exactly ONE consumes it, so every geometry pipeline is forced
				// through the BHoM adapter.
				id: "connects to",
				accessorFn: (row) => {
					const {upstream, downstream} = kindConnectivity(row.id);
					return upstream.length + downstream.length;
				},
				header: ({column}) => <DataTableColumnHeader column={column} title="Connects to" />,
				cell: ({row}) => {
					const {upstream, downstream} = kindConnectivity(row.original.id);
					const list = (ids: string[]) => (ids.length ? ids.map(nodeKindLabel).join(", ") : "nothing");
					return (
						<HoverTooltip
							content={
								<span className="wwc:flex wwc:flex-col wwc:gap-0.5">
									<span>{`upstream: ${list(upstream)}`}</span>
									<span>{`downstream: ${list(downstream)}`}</span>
								</span>
							}
						>
							<span className="wwc:whitespace-nowrap wwc:tabular-nums">{`${upstream.length} up · ${downstream.length} down`}</span>
						</HoverTooltip>
					);
				},
			},
		],
		[onNavigate],
	);

	const renderGrid = useCallback(
		(gridRows: Row<KindRow>[]) => {
			if (gridRows.length === 0) return <FilteredEmpty noun="node kind" onClear={clearAll} />;
			// Card mode groups by category in the prototype's palette order. Only the rows DataTable
			// handed over are grouped, so search, filter and the pager still drive what is shown.
			const byCategory = new Map<Wc3NodeKindCategory, Row<KindRow>[]>();
			for (const row of gridRows) {
				const list = byCategory.get(row.original.kind.cat);
				if (list) list.push(row);
				else byCategory.set(row.original.kind.cat, [row]);
			}
			return (
				<div className="wwc:flex wwc:flex-col wwc:gap-5" data-node-kind-palette={gridRows.length}>
					{WC3_NODE_CATEGORIES.filter((cat) => byCategory.has(cat)).map((cat) => {
						const group = byCategory.get(cat) ?? [];
						return (
							<div key={cat} className="wwc:flex wwc:flex-col wwc:gap-2">
								<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
									{cat}
									<Badge variant="neutralSoft">{group.length}</Badge>
								</div>
								<div className="wwc:grid wwc:gap-3 wwc:sm:grid-cols-2 wwc:xl:grid-cols-3">
									{group.map((row) => (
										<KindCard key={row.id} row={row.original} onNavigate={onNavigate} />
									))}
								</div>
							</div>
						);
					})}
				</div>
			);
		},
		[clearAll, onNavigate],
	);

	return (
		<Pane flush>
			{/* No in-content <h1> — the perspective tab bar is the header. */}
			<p className="wwc:pt-4 wwc:text-xs wwc:text-muted-foreground">
				The node kinds a pipeline can be built from — {Object.keys(WC3_NODE_KINDS).length} kinds across{" "}
				{WC3_NODE_CATEGORIES.length} categories, with their typed ports, their output schema and the pipelines that use
				them. Reference only: nodes are added on a pipeline's own canvas, so exactly one surface edits a graph.
			</p>

			<WiringRulesPanel />

			<Filter value={filters} onChange={setFilters}>
				{/*
				 * ONE DataTable for the life of this view. `mode` appears in exactly two props —
				 * `renderGrid` and `showColumnToggle` — and nowhere else: no `key`, no conditional render,
				 * no second table, so the sort, page index and column visibility held inside it survive
				 * every toggle. 15 rows means the pager never engages; the mechanism stays identical
				 * anyway, so this table behaves like every other catalogue in the workspace.
				 */}
				<DataTable
					columns={columns}
					data={data}
					search={query}
					onSearchChange={setQuery}
					searchPlaceholder="Filter node kinds…"
					recordLabel="node kind"
					recordLabelPlural="node kinds"
					pageSize={25}
					flushToolbar
					getRowId={(row) => row.id}
					showColumnToggle={mode === "table"}
					initialColumnVisibility={{"connects to": false}}
					renderGrid={mode === "cards" ? renderGrid : undefined}
					emptyMessage={<FilteredEmpty noun="node kind" onClear={clearAll} />}
					filterChipLabel={(category, value) => {
						if (category === "usage") return value === "used" ? "Used" : "Unused";
						return value;
					}}
					toolbarExtra={
						<>
							<ModeToggle mode={mode} onModeChange={setMode} />
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="category" label="Category">
									{WC3_NODE_CATEGORIES.map((cat) => (
										<FilterOption key={cat} value={cat}>
											{`${cat} (${CATEGORY_COUNTS.get(cat) ?? 0})`}
										</FilterOption>
									))}
								</FilterCategory>
								{/* Membership on EITHER side, so "Objects" finds every kind that touches Objects. */}
								<FilterCategory value="portType" label="Port type">
									{WC3_PORT_TYPES.map((type) => (
										<FilterOption key={type} value={type}>
											{`${type} (${PORT_TYPE_COUNTS.get(type) ?? 0})`}
										</FilterOption>
									))}
								</FilterCategory>
								{/* Counted off the LIVE array — a kind used only by a session pipeline reads "Used". */}
								<FilterCategory value="usage" label="Usage">
									<FilterOption value="used">{`Used (${usedCount})`}</FilterOption>
									<FilterOption value="unused">{`Unused (${rows.length - usedCount})`}</FilterOption>
								</FilterCategory>
							</FilterContent>
						</>
					}
				/>
			</Filter>
		</Pane>
	);
}

// ─── Runs: rows and ordering ─────────────────────────────────────────────────

type RunRow = {
	/** Run ids are only unique within a pipeline, exactly as wire ids are — namespace them. */
	key: string;
	pipeline: Wc3Pipeline;
	run: Wc3PipelineRun;
	/** Index in its pipeline's own runs array; the tiebreak for two runs in the same second. */
	seq: number;
	rows: number;
};

/**
 * Seconds-of-day for a `Wc3PipelineRun.at` label.
 *
 * `at` is `toLocaleTimeString()` — a wall clock and nothing else, with no date and no epoch anywhere
 * on the record. Every run in the log was made in this session, so the clock IS a total order; the
 * one case this gets wrong is a session spanning midnight, which is not worth widening the fixture's
 * run shape for. An unparseable label sorts last rather than throwing.
 */
function atSeconds(at: string): number {
	const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i.exec(at.trim());
	if (!m) return -1;
	let hours = Number(m[1]);
	const meridiem = m[4]?.toUpperCase();
	if (meridiem === "PM" && hours < 12) hours += 12;
	if (meridiem === "AM" && hours === 12) hours = 0;
	return hours * 3600 + Number(m[2]) * 60 + Number(m[3] ?? 0);
}

const runRows = (pipelines: Wc3Pipeline[]): RunRow[] =>
	pipelines
		.flatMap((pipeline) =>
			pipeline.runs.map((run, seq) => ({
				key: `${pipeline.id}:${run.id}`,
				pipeline,
				run,
				seq,
				rows: Object.values(run.stats).reduce((total, n) => total + n, 0),
			})),
		)
		// Newest first, across every pipeline.
		.sort((a, b) => atSeconds(b.run.at) - atSeconds(a.run.at) || b.seq - a.seq);

const runSearchText = (row: RunRow): string =>
	[row.pipeline.name, row.pipeline.id, row.run.id, row.run.at, `rev ${row.run.rev}`, row.run.summary.join(" ")].join(
		" ",
	);

/** Lineage → Workflow, the prototype's own affordance on every run-log entry. */
const LINEAGE_WORKFLOW: Wc3LineageNavTarget = {perspectiveId: "lineage", tabId: "workflow"};

function SummaryLines({summary}: {summary: string[]}) {
	if (summary.length === 0) return <span className="wwc:text-xs wwc:text-muted-foreground">no sink effects</span>;
	return (
		<span className="wwc:flex wwc:flex-col wwc:gap-0.5">
			{summary.map((line) => (
				<span key={line} className="wwc:text-xs wwc:text-foreground">{`· ${line}`}</span>
			))}
		</span>
	);
}

/** The numbered topological order with each node's row count — the only place order + stats show. */
function RunNodeList({row}: {row: RunRow}) {
	const {pipeline, run} = row;
	return (
		<ol className="wwc:flex wwc:flex-col wwc:gap-1 wwc:p-4">
			{run.order.map((nodeId, i) => {
				const node = pipeline.nodes.find((n) => n.id === nodeId);
				return (
					<li key={nodeId} className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs">
						<span className="wwc:w-5 wwc:shrink-0 wwc:text-right wwc:tabular-nums wwc:text-muted-foreground">
							{i + 1}
						</span>
						{node ? <NodeKindGlyph kindId={node.kind} /> : null}
						{/* A node deleted since the run still has a stat — name it by id rather than dropping it. */}
						<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate">{node?.label ?? nodeId}</span>
						{node ? <Mono>{nodeKindLabel(node.kind)}</Mono> : <Mono>deleted</Mono>}
						<span className="wwc:w-20 wwc:shrink-0 wwc:text-right wwc:tabular-nums">{`${run.stats[nodeId] ?? 0} rows`}</span>
					</li>
				);
			})}
		</ol>
	);
}

function RunCard({row, onNavigate}: {row: RunRow; onNavigate?: (t: Wc3LineageNavTarget) => void}) {
	const {pipeline, run} = row;
	return (
		<Card className="wwc:flex wwc:flex-col wwc:gap-2 wwc:rounded-lg wwc:p-3" data-pipeline-run={row.key}>
			<div className="wwc:flex wwc:items-start wwc:gap-2">
				<span className="wwc:flex wwc:h-7 wwc:w-7 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/50">
					<PipelineGlyph pipeline={pipeline} />
				</span>
				<span className="wwc:min-w-0 wwc:flex-1">
					<span className="wwc:block wwc:truncate wwc:text-sm wwc:font-semibold">{pipeline.name}</span>
					<Mono>{`${run.id} · ${run.at} · rev ${run.rev}`}</Mono>
				</span>
				<Badge variant={run.summary.length > 0 ? "successSoft" : "neutralSoft"}>
					{run.summary.length > 0 ? `${run.summary.length} sink effects` : "no sink effects"}
				</Badge>
			</div>

			<p className="wwc:text-xs wwc:text-muted-foreground">{`${run.order.length} nodes · ${row.rows} rows produced`}</p>

			<SummaryLines summary={run.summary} />

			{onNavigate && (
				<div className="wwc:mt-auto wwc:flex wwc:items-center wwc:gap-1.5 wwc:pt-1">
					<Button variant="ghost" size="sm" onClick={() => onNavigate(LINEAGE_WORKFLOW)}>
						<Workflow />
						lineage →
					</Button>
					<span className="wwc:flex-1" />
					<Button variant="outline" size="sm" onClick={() => onNavigate(lineageNav.pipeline(pipeline.id))}>
						Open pipeline
					</Button>
				</div>
			)}
		</Card>
	);
}

/**
 * First paint, and the honest one: all three seeded pipelines ship `runs: []`, so the fixture holds
 * ZERO pipeline runs. (WC3_ACTION_RUNS has two entries, but those are action-type runs and belong to
 * Lineage → Workflow, not here.)
 *
 * The copy deliberately does NOT repeat the prototype's promise that sinks "upsert instances that
 * immediately appear in the Twin and the Ontology tables". There is no instance store in this port —
 * a run produces a run record and nothing else — so that sentence would be a lie.
 */
function RunsEmptyState({
	pipelines,
	onRun,
	onNavigate,
}: {
	pipelines: Wc3Pipeline[];
	onRun: (pipelineId: string) => void;
	onNavigate?: (t: Wc3LineageNavTarget) => void;
}) {
	return (
		<Empty
			icon={<Play className="wwc:h-8 wwc:w-8" />}
			title="No pipeline runs yet"
			description={`None of the ${pipelines.length} pipelines has been run in this session, and the fixture ships no run history. Running one executes its nodes in topological order and records what each node produced — the results appear here and as row counts on the pipeline's canvas.`}
			action={
				<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
					<Combobox
						options={pipelines.map((p) => ({
							value: p.id,
							label: p.name,
							icon: <PipelineGlyph pipeline={p} />,
						}))}
						value=""
						onValueChange={(id) => {
							if (id) onRun(id);
						}}
						placeholder="Run a pipeline…"
						searchPlaceholder="Search pipelines…"
						emptyMessage="No pipeline to run."
						className="wwc:w-[280px]"
						popoverClassName="wwc:w-[280px]"
					/>
					{onNavigate && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onNavigate({perspectiveId: "pipelines", tabId: "pipelines"})}
						>
							Back to the pipeline list
						</Button>
					)}
				</div>
			}
		/>
	);
}

// ─── Runs view ───────────────────────────────────────────────────────────────

export function PipelineRunsView({pipelines, onPipelinesChange, onNavigate}: Wc3PipelineViewProps): ReactElement {
	const [filters, setFilters] = useState<FilterValue>({});
	const [query, setQuery] = useState("");
	// Table default, unlike the other two surfaces: the expandable row carrying the topological order
	// and its per-node row counts exists in table mode only, and it is the reason to open this tab.
	const [mode, setMode] = usePersistentState<Wc3PipelineViewMode>("wc3.pipelines.runs.view", "table");

	const all = useMemo(() => runRows(pipelines), [pipelines]);

	const clearAll = useCallback(() => {
		setFilters({});
		setQuery("");
	}, []);

	// The empty state's only mutation — and the ONLY write this tab makes. Every graph edit lives on
	// the detail's canvas.
	const runOne = useCallback(
		(pipelineId: string) => {
			const target = pipelines.find((p) => p.id === pipelineId);
			if (!target) return;
			onPipelinesChange(replacePipeline(pipelines, runPipeline(target).pipeline));
		},
		[pipelines, onPipelinesChange],
	);

	const data = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return all.filter((row) => {
			if (needle && !runSearchText(row).toLowerCase().includes(needle)) return false;
			const pipes = filters.pipeline;
			if (pipes && pipes.length > 0 && !pipes.includes(row.pipeline.id)) return false;
			const outcome = filters.outcome;
			if (outcome && outcome.length > 0 && !outcome.includes(row.run.summary.length > 0 ? "sinks" : "none")) {
				return false;
			}
			const revs = filters.rev;
			if (revs && revs.length > 0 && !revs.includes(String(row.run.rev))) return false;
			return true;
		});
	}, [all, filters, query]);

	const pipelineCounts = useMemo(() => {
		const counts = new Map<string, number>();
		for (const row of all) counts.set(row.pipeline.id, (counts.get(row.pipeline.id) ?? 0) + 1);
		return counts;
	}, [all]);
	const sinkCount = useMemo(() => all.filter((row) => row.run.summary.length > 0).length, [all]);
	// Revs are derived from the runs themselves, so the facet never offers a rev no run pinned.
	const revs = useMemo(() => [...new Set(all.map((row) => row.run.rev))].sort((a, b) => a - b), [all]);

	const columns: ColumnDef<RunRow, unknown>[] = useMemo(
		() => [
			{
				// The expander. DataTable renders `renderSubComponent` for an expanded row but ships no
				// toggle of its own, so the affordance is a column.
				id: "details",
				header: "",
				enableSorting: false,
				enableHiding: false,
				meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:whitespace-nowrap"},
				cell: ({row}) => (
					<Button
						variant="ghost"
						size="sm"
						icon
						aria-label={row.getIsExpanded() ? "Hide node order" : "Show node order"}
						tooltip={row.getIsExpanded() ? "Hide node order" : "Show node order"}
						onClick={row.getToggleExpandedHandler()}
					>
						{row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
					</Button>
				),
			},
			{
				id: "pipeline",
				accessorFn: (row) => row.pipeline.name,
				header: ({column}) => <DataTableColumnHeader column={column} title="Pipeline" />,
				enableHiding: false,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap">
						<PipelineGlyph pipeline={row.original.pipeline} />
						{onNavigate ? (
							<button
								type="button"
								onClick={() => onNavigate(lineageNav.pipeline(row.original.pipeline.id))}
								className="wwc:min-w-0 wwc:truncate wwc:text-left wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
							>
								{row.original.pipeline.name}
							</button>
						) : (
							<span className="wwc:min-w-0 wwc:truncate wwc:font-medium">{row.original.pipeline.name}</span>
						)}
					</span>
				),
			},
			{
				id: "run id",
				accessorFn: (row) => row.run.id,
				header: "Run id",
				cell: ({row}) => <Mono>{row.original.run.id}</Mono>,
			},
			{
				id: "at",
				accessorFn: (row) => atSeconds(row.run.at),
				header: ({column}) => <DataTableColumnHeader column={column} title="At" />,
				cell: ({row}) => <span className="wwc:whitespace-nowrap">{row.original.run.at}</span>,
			},
			{
				id: "drop rev",
				accessorFn: (row) => row.run.rev,
				header: ({column}) => <DataTableColumnHeader column={column} title="Drop rev" />,
				cell: ({row}) => <Mono>{`rev ${row.original.run.rev}`}</Mono>,
			},
			{
				id: "nodes",
				accessorFn: (row) => row.run.order.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Nodes" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => row.original.run.order.length,
			},
			{
				id: "rows",
				accessorFn: (row) => row.rows,
				header: ({column}) => <DataTableColumnHeader column={column} title="Rows" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => row.original.rows,
			},
			{
				id: "sinks",
				accessorFn: (row) => row.run.summary.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Sinks" />,
				cell: ({row}) =>
					row.original.run.summary.length === 0 ? (
						<span className="wwc:text-muted-foreground">no sink effects</span>
					) : (
						<HoverTooltip content={<SummaryLines summary={row.original.run.summary} />}>
							<span className="wwc:tabular-nums">{row.original.run.summary.length}</span>
						</HoverTooltip>
					),
			},
			{
				id: "actions",
				header: "",
				enableSorting: false,
				enableHiding: false,
				meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:whitespace-nowrap"},
				cell: ({row}) =>
					onNavigate ? (
						<span className="wwc:flex wwc:items-center wwc:gap-1">
							<Button
								variant="ghost"
								size="sm"
								icon
								aria-label="Open the workflow lineage"
								tooltip="lineage →"
								onClick={() => onNavigate(LINEAGE_WORKFLOW)}
							>
								<Workflow />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								icon
								aria-label={`Open ${row.original.pipeline.name}`}
								tooltip="Open pipeline"
								onClick={() => onNavigate(lineageNav.pipeline(row.original.pipeline.id))}
							>
								<Play />
							</Button>
						</span>
					) : null,
			},
		],
		[onNavigate],
	);

	const renderGrid = useCallback(
		(gridRows: Row<RunRow>[]) => {
			if (gridRows.length === 0) return <FilteredEmpty noun="run" onClear={clearAll} />;
			return (
				<div className="wwc:grid wwc:gap-3 wwc:sm:grid-cols-2 wwc:xl:grid-cols-3" data-pipeline-runs={gridRows.length}>
					{gridRows.map((row) => (
						<RunCard key={row.id} row={row.original} onNavigate={onNavigate} />
					))}
				</div>
			);
		},
		[clearAll, onNavigate],
	);

	// Nothing has ever been run, so there is nothing to search, filter or page — the table would be a
	// toolbar over an empty box. The Empty replaces it outright and carries the one action that fills
	// this tab. Once a run exists the table takes over, and its own empty state is the filtered one.
	if (all.length === 0) {
		return (
			<Pane>
				<RunsEmptyState pipelines={pipelines} onRun={runOne} onNavigate={onNavigate} />
			</Pane>
		);
	}

	return (
		<Pane flush>
			{/* No in-content <h1> — the perspective tab bar is the header. */}
			<p className="wwc:pt-4 wwc:text-xs wwc:text-muted-foreground">
				Every pipeline run made in this session, newest first. A run executes its nodes in topological order and records
				what each one produced; expand a row for that order and its per-node row counts. Runs are held on the pipeline
				record and capped at 12 each — nothing survives a reload.
			</p>

			<Filter value={filters} onChange={setFilters}>
				{/* ONE DataTable, same mechanism as the Palette and the pipeline catalogue. */}
				<DataTable
					columns={columns}
					data={data}
					search={query}
					onSearchChange={setQuery}
					searchPlaceholder="Filter runs…"
					recordLabel="run"
					recordLabelPlural="runs"
					pageSize={25}
					flushToolbar
					getRowId={(row) => row.key}
					showColumnToggle={mode === "table"}
					getRowCanExpand={(row) => row.original.run.order.length > 0}
					renderSubComponent={({row}) => <RunNodeList row={row.original} />}
					renderGrid={mode === "cards" ? renderGrid : undefined}
					emptyMessage={<FilteredEmpty noun="run" onClear={clearAll} />}
					filterChipLabel={(category, value) => {
						if (category === "pipeline") return pipelines.find((p) => p.id === value)?.name ?? value;
						if (category === "outcome") return value === "sinks" ? "Has sink effects" : "No sink effects";
						if (category === "rev") return `rev ${value}`;
						return value;
					}}
					toolbarExtra={
						<>
							<ModeToggle mode={mode} onModeChange={setMode} />
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="pipeline" label="Pipeline">
									{pipelines.map((p) => (
										<FilterOption key={p.id} value={p.id}>
											{`${p.name} (${pipelineCounts.get(p.id) ?? 0})`}
										</FilterOption>
									))}
								</FilterCategory>
								{/* summary carries sink lines only, so this genuinely splits: a pipeline with no
								    sink node runs fine and reports nothing. */}
								<FilterCategory value="outcome" label="Outcome">
									<FilterOption value="sinks">{`Has sink effects (${sinkCount})`}</FilterOption>
									<FilterOption value="none">{`No sink effects (${all.length - sinkCount})`}</FilterOption>
								</FilterCategory>
								<FilterCategory value="rev" label="Drop rev">
									{revs.map((rev) => (
										<FilterOption key={rev} value={String(rev)}>
											{`rev ${rev} (${all.filter((row) => row.run.rev === rev).length})`}
										</FilterOption>
									))}
								</FilterCategory>
							</FilterContent>
						</>
					}
				/>
			</Filter>
		</Pane>
	);
}
