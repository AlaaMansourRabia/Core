import type {ColumnDef, Row} from "@tanstack/react-table";
import type {ReactElement} from "react";

import {cn} from "@wakecap/core-utils";
import {ArrowUpRight, Plus} from "lucide-react";
import {useCallback, useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import {CatalogueCardGrid, CatalogueViewToggle, useCatalogueViewMode} from "../catalogue-view-toggle";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {HoverTooltip} from "../tooltip";
import {usePersistentState} from "../use-persistent-state";
import {Wc3FsPathLabel} from "./wc3-fs-path-label";
import {wc3FsLocationOf} from "./wc3-fs-store";
import {useOpenRecord} from "./wc3-lineage-shared";
import {getObjectType} from "./wc3-ontology-data";
import {CreateProcessDialog} from "./wc3-process-create";
import {ProcessDetail} from "./wc3-process-detail";
import {
	CustomTag,
	Mono,
	Pane,
	ProcessGlyphTile,
	ProcessNotFound,
	ProcessesEmptyState,
	ProductChip,
	ProposedTag,
	SlaModelBadge,
	OverSlaBadge,
	StateChip,
	TypeGlyphLabel,
	type Wc3ProcessBottleneck,
	type Wc3ProcessDraft,
	type Wc3ProcessFacts,
	type Wc3ProcessRecord,
	type Wc3ProcessViewProps,
	createProcess,
	formatHours,
	lineageNav,
	processBottlenecks,
	demoInstances,
	processFacts,
	processSearchText,
	processSiblings,
	processesByProduct,
	processProduct,
	replaceProcess,
	useDetailLabel,
} from "./wc3-process-shared";

// The Processes perspective's entry point: the list/card catalogue of process DEFINITIONS, the
// "Create process" dialog it owns, and the drill-in into one process's page.
//
// This is the same structural correction the Products perspective already took. The shell used to
// declare `canvas` / `instances` / `bottlenecks` / `editor` as four top-level tabs; in the prototype
// (PageProcesses, 06-unified-workspace.html:7195) all four are facets of ONE process chosen from a
// header dropdown, so they are sections of wc3-process-detail.tsx and the perspective's top level is
// this list.
//
// Nothing in this file reads WC3_PROCESSES, getProcess or processesForProduct. The live array arrives
// on props and every mutation is committed back through `onProcessesChange` — a fixture-bound lookup
// keeps reporting the seeded two the instant the session creates or renames one, exactly the trap
// wc3-pipeline-list-view.tsx:46-49 documents for getPipeline.
//
// HONEST SCALE NOTE, because it shapes every decision below: the fixture ships exactly TWO processes
// and both resolve to the same product. Pagination will never page, and only two facets earn a slot
// (see the FilterContent block). Nothing here is padded to make the surface look busier than the data.

// ─── Filter facet labels ─────────────────────────────────────────────────────

const ORIGIN_LABEL: Record<string, string> = {seeded: "Seeded", session: "Created in session"};

/**
 * Filter sentinel for a process whose object type carries no `installedBy` record.
 *
 * processesByProduct() deliberately OMITS such processes rather than filing them under an invented
 * key, which would otherwise make them unreachable through the product facet. This option appears
 * only when at least one such process exists, so it is never a dead option.
 */
const NO_PRODUCT = "__none__";

// ─── Derived row meta ────────────────────────────────────────────────────────

type ProcessMeta = {facts: Wc3ProcessFacts; top: Wc3ProcessBottleneck[]};

/**
 * Everything the columns, the cards and the facet counts read, derived ONCE per commit so the three
 * can never disagree about how many tokens a state holds.
 *
 * `top` is the ranked bottleneck list trimmed to the states that actually hold a token — a state with
 * zero tokens sorts last with overShare 0 and would pad the tooltip with non-answers.
 */
function processMeta(p: Wc3ProcessRecord): ProcessMeta {
	// The Processes catalogue is a demo surface over the shipped fixture, so it reads the fixture
	// accessor explicitly. A product mounting StateMachine passes its own rows through `instances`.
	const rows = demoInstances(p);
	return {
		facts: processFacts(p, rows),
		top: processBottlenecks(p, rows)
			.filter((b) => b.tokens > 0)
			.slice(0, 3),
	};
}

// ─── Shared cell/card fragments ──────────────────────────────────────────────

/**
 * Open tokens, with the over-SLA portion of the bar tinted.
 *
 * `over` is a subset of `open` by construction: processRowOverSla returns false for a terminal state
 * unconditionally, so a closed token can never be counted as breaching.
 */
function TokenBar({open, over}: {open: number; over: number}): ReactElement {
	if (open === 0) return <span className="wwc:text-muted-foreground">—</span>;
	const share = Math.min(1, over / open);
	return (
		<span
			className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-2 wwc:whitespace-nowrap"
			title={`${open} open token(s), ${over} past SLA`}
		>
			<span className="wwc:tabular-nums">{open}</span>
			<span className="wwc:h-1.5 wwc:w-12 wwc:shrink-0 wwc:overflow-hidden wwc:rounded-full wwc:bg-muted">
				<span
					className={cn("wwc:block wwc:h-full wwc:rounded-full", over > 0 ? "wwc:bg-destructive" : "wwc:bg-muted")}
					style={{width: `${share * 100}%`}}
				/>
			</span>
		</span>
	);
}

/**
 * The worst non-terminal state by processBottlenecks() order, with the top three behind a tooltip.
 *
 * "no open tokens" is the honest reading when everything has reached a terminal state — it is not the
 * same as a healthy queue and is not dressed up as one.
 */
function BottleneckCell({meta}: {meta: ProcessMeta}): ReactElement {
	const worst = meta.facts.worstBottleneck;
	if (!worst) return <span className="wwc:text-muted-foreground">no open tokens</span>;
	return (
		<HoverTooltip
			content={
				<span className="wwc:flex wwc:flex-col wwc:gap-0.5">
					{meta.top.map((b) => (
						<span key={b.state.id}>
							{`${b.state.name} — ${b.tokens} token${b.tokens === 1 ? "" : "s"}, ${b.over} over SLA, oldest ${formatHours(
								b.maxAgeHours,
							)}`}
						</span>
					))}
				</span>
			}
		>
			<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap">
				<StateChip state={worst.state} />
				{/* Badge forwards refs, but it is not the tooltip trigger here — the wrapping span is. */}
				<Badge variant={worst.over > 0 ? "dangerSoft" : "neutralSoft"}>
					{`${Math.round(worst.overShare * 100)}% over`}
				</Badge>
			</span>
		</HoverTooltip>
	);
}

/**
 * The two provenance markers the fixture carries, shown wherever a state count is shown.
 *
 * `proposedCount` spans states AND transitions (that is how the shared module defines it), so the
 * tooltip says so rather than implying every one of them is a state.
 */
function GraphMarkers({facts}: {facts: Wc3ProcessFacts}): ReactElement | null {
	if (facts.customStateCount === 0 && facts.proposedCount === 0) return null;
	return (
		<span className="wwc:flex wwc:items-center wwc:gap-1">
			{facts.customStateCount > 0 ? (
				<HoverTooltip
					content={`${facts.customStateCount} state(s) added on top of wakecap-standard-v1 — not part of the vendor default graph.`}
				>
					<span>
						<CustomTag />
					</span>
				</HoverTooltip>
			) : null}
			{facts.proposedCount > 0 ? (
				<HoverTooltip
					content={`${facts.proposedCount} state(s) / transition(s) that do not exist in the as-built product yet.`}
				>
					<span>
						<ProposedTag />
					</span>
				</HoverTooltip>
			) : null}
		</span>
	);
}

// ─── Card ────────────────────────────────────────────────────────────────────

/**
 * One catalogue card. It carries every fact the table row carries — including the two columns that
 * ship hidden (`sla model` and `evidence`, the latter shown in full rather than truncated).
 * Table-only facts: none. Card-only facts: none. That is the bar the toggle has to clear to be
 * lossless.
 */
function ProcessCard({
	process,
	meta,
	siblingCount,
	onOpen,
	onOpenProduct,
}: {
	process: Wc3ProcessRecord;
	meta: ProcessMeta;
	siblingCount: number;
	onOpen: (id: string) => void;
	onOpenProduct?: (productKey: string) => void;
}) {
	const {facts} = meta;
	const objectType = getObjectType(process.objectTypeId);
	const open = () => onOpen(process.id);
	return (
		// role="button" rather than a real <button> so the ProductChip button and the footer action can
		// nest legally — the same trade-off PipelineCard and ProductCard make. Enter/Space are wired by hand.
		<Card
			role="button"
			tabIndex={0}
			data-process-card={process.id}
			title={`Open ${process.name}`}
			onClick={open}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					open();
				}
			}}
			className="wwc:flex wwc:cursor-pointer wwc:flex-col wwc:gap-2 wwc:rounded-lg wwc:p-3 wwc:text-left wwc:transition-colors wwc:hover:bg-accent/40 wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
		>
			<div className="wwc:flex wwc:items-start wwc:gap-2">
				<ProcessGlyphTile process={process} />
				<div className="wwc:min-w-0 wwc:flex-1">
					<div className="wwc:truncate wwc:text-sm wwc:font-semibold">{process.name}</div>
					<Mono>{process.id}</Mono>
					<Wc3FsPathLabel perspectiveId="processes" recordId={process.id} className="wwc:mt-0.5" />
				</div>
				<SlaModelBadge process={process} />
			</div>

			{/* The user's "one product might have more than one process" requirement, on the card as well
			    as the row. Provenance is DERIVED, so a process without it says exactly that. */}
			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
				<ProductChip process={process} siblingCount={siblingCount} onOpenProduct={onOpenProduct} />
				<TypeGlyphLabel type={objectType} className="wwc:text-xs wwc:text-muted-foreground" />
				<Mono>{`${facts.tokenCount} row${facts.tokenCount === 1 ? "" : "s"}`}</Mono>
			</div>

			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
				<p className="wwc:text-xs wwc:text-muted-foreground wwc:tabular-nums">
					{`${facts.stateCount} state${facts.stateCount === 1 ? "" : "s"} · ${facts.transitionCount} transition${
						facts.transitionCount === 1 ? "" : "s"
					} · ${facts.terminalCount} terminal`}
				</p>
				<GraphMarkers facts={facts} />
			</div>

			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
				<Badge variant="neutralSoft">{`${facts.openCount} open`}</Badge>
				<OverSlaBadge over={facts.overSlaCount} total={facts.openCount} />
			</div>

			<BottleneckCell meta={meta} />

			{/* The card's advantage over the table, where `evidence` ships hidden: the provenance note in
			    full, quoted verbatim. Paraphrasing it would make the port claim as-built behaviour. */}
			<p className="wwc:text-xs wwc:text-muted-foreground">{process.evidenceNote}</p>

			<div className="wwc:mt-auto wwc:flex wwc:items-center wwc:gap-1.5 wwc:pt-1">
				<Mono>{process.statusProp}</Mono>
				<span className="wwc:flex-1" />
				<Button
					variant="ghost"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						open();
					}}
				>
					<ArrowUpRight />
					Open
				</Button>
			</div>
		</Card>
	);
}

// ─── View ────────────────────────────────────────────────────────────────────

export function ProcessListView({
	processes,
	onProcessesChange,
	onDetailChange,
	onNavigate,
	openRecordId,
	onOpenRecordConsumed,
	onShowInFiles,
	createLocationField,
	onRecordCreated,
}: Wc3ProcessViewProps) {
	const [filters, setFilters] = useState<FilterValue>({});
	// Controlled so the empty state's "Clear the filter" can clear the query as well as the facets.
	const [query, setQuery] = useState("");
	// Persisted: the perspective could grow a second tab, and the shell resolves exactly one
	// PROCESS_VIEWS entry per render — switching away would unmount this whole surface.
	const [mode, setMode] = useCatalogueViewMode("wc3.processes.view");
	const [openId, setOpenId] = usePersistentState<string | null>("wc3.processes.open", null);
	const [newOpen, setNewOpen] = useState(false);

	// The not-found guard is mandatory, not defensive: `openId` survives a reload in localStorage while
	// the process array does not, so a session-created id comes back dangling. It resolves to the
	// explicit 404 rather than silently bouncing to the list, which would look like a lost record.
	const open = openId ? (processes.find((p) => p.id === openId) ?? null) : null;
	const missingId = openId !== null && open === null ? openId : null;
	useDetailLabel(open?.name ?? null, onDetailChange);

	// Derived once per commit and shared by the columns, the cards and the facet counts.
	const metaById = useMemo(() => new Map(processes.map((p) => [p.id, processMeta(p)] as const)), [processes]);
	const metaOf = useCallback((p: Wc3ProcessRecord) => metaById.get(p.id) ?? processMeta(p), [metaById]);

	// ONE PRODUCT, MANY PROCESSES — off the LIVE array, so a process created this session counts.
	const byProduct = useMemo(() => processesByProduct(processes), [processes]);
	const siblingCountOf = useCallback((p: Wc3ProcessRecord) => processSiblings(processes, p).length, [processes]);

	const openProcess = useCallback(
		(id: string) => {
			// Opening an existing row ends the authoring session — see createdId.
			setCreatedId(null);
			setOpenId(id);
		},
		[setOpenId],
	);
	const openProduct = useCallback((productKey: string) => onNavigate?.(lineageNav.product(productKey)), [onNavigate]);

	// Arriving from the file system: the file's ref named this process, so open it.
	useOpenRecord(openRecordId, (id) => processes.some((p) => p.id === id), openProcess, onOpenRecordConsumed);

	/**
	 * The process created in THIS session, if the user is still inside it.
	 *
	 * Session state, never persisted: "new" means "you have not left it yet", not a field on the
	 * record. Opening any other process clears it, so coming back to the same one later — after it
	 * has actually run — shows the established page rather than the authoring one.
	 */
	const [createdId, setCreatedId] = useState<string | null>(null);

	const createFromDraft = useCallback(
		(draft: Wc3ProcessDraft) => {
			const created = createProcess(draft);
			onProcessesChange([...processes, created]);
			// The shell files it at whatever the Location field chose.
			onRecordCreated?.(created.id, created.name);
			// Straight into the new process's page, in AUTHORING mode: the canvas there is the only way
			// to add the first transition, and every readout on the page would otherwise report zeros
			// about a graph that has never run.
			setCreatedId(created.id);
			setOpenId(created.id);
		},
		[processes, onProcessesChange, onRecordCreated, setOpenId],
	);

	const clearAll = useCallback(() => {
		setFilters({});
		setQuery("");
	}, []);

	// ── Facets. TWO only, both counted off the LIVE array.
	//
	// Deliberately NOT shipped, because at this data size each one selects every row or no rows and
	// would read as broken rather than as a filter:
	//   · Backing object type — 1:1 with the rows (two types, one process each).
	//   · SLA model — one process is severity-driven and one is per-state, so it is the object-type
	//     facet under another name. It stays a COLUMN (hidden by default) instead.
	//   · Lint health — both seeded processes lint clean, so every option but "clean" is empty until
	//     the user edits a graph, and the detail page is where lint is actionable.
	//   · Has tokens over SLA — selects both rows.
	const productOptions = useMemo(() => {
		const options = [...byProduct.entries()].map(([key, list]) => {
			const first = list[0];
			const product = first ? processProduct(first) : undefined;
			return {value: key, label: product?.displayName ?? key, count: list.length};
		});
		options.sort((a, b) => a.label.localeCompare(b.label));
		// Only when at least one process genuinely has no provenance — never a dead option.
		const orphans = processes.length - [...byProduct.values()].reduce((n, list) => n + list.length, 0);
		if (orphans > 0) options.push({value: NO_PRODUCT, label: "No product provenance", count: orphans});
		return options;
	}, [byProduct, processes.length]);

	const originCounts = useMemo(() => {
		const seeded = processes.filter((p) => metaOf(p).facts.origin === "seeded").length;
		return {seeded, session: processes.length - seeded};
	}, [processes, metaOf]);

	// ONE predicate for both view modes — the toggle changes what DataTable's body renders, never what
	// it filters.
	const data = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return processes.filter((p) => {
			if (needle && !processSearchText(p).toLowerCase().includes(needle)) return false;
			const facts = metaOf(p).facts;
			const product = filters.product;
			if (product && product.length > 0 && !product.includes(facts.productKey ?? NO_PRODUCT)) return false;
			const origin = filters.origin;
			if (origin && origin.length > 0 && !origin.includes(facts.origin)) return false;
			return true;
		});
	}, [processes, query, filters, metaOf]);

	const columns: ColumnDef<Wc3ProcessRecord, unknown>[] = useMemo(
		() => [
			{
				// Ids are space-separated lowercase on purpose: the column-toggle popover capitalises
				// `column.id`, so "slaModel" would read "SlaModel" in the list.
				id: "process",
				accessorFn: (p) => p.name,
				header: ({column}) => <DataTableColumnHeader column={column} title="Process" />,
				enableHiding: false,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap">
						<ProcessGlyphTile process={row.original} />
						<span className="wwc:min-w-0">
							{/* The drill-in affordance is this button, not a whole-row onClick. */}
							<button
								type="button"
								onClick={() => openProcess(row.original.id)}
								className="wwc:block wwc:truncate wwc:text-left wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
							>
								{row.original.name}
							</button>
							<Mono>{row.original.id}</Mono>
						</span>
					</span>
				),
			},
			{
				id: "location",
				accessorFn: (p) => wc3FsLocationOf("processes", p.id)?.path ?? "",
				header: ({column}) => <DataTableColumnHeader column={column} title="Location" />,
				cell: ({row}) => (
					<Wc3FsPathLabel perspectiveId="processes" recordId={row.original.id} onOpenFolder={onShowInFiles} />
				),
			},
			{
				// The user's explicit requirement: a process must show which product it belongs to, and the
				// chip carries the sibling count so "one product, many processes" is legible on the row.
				// Provenance is DERIVED (objectTypeId -> installedBy.productKey), never stored.
				id: "product",
				accessorFn: (p) => processProduct(p)?.displayName ?? "",
				header: ({column}) => <DataTableColumnHeader column={column} title="Product" />,
				cell: ({row}) => (
					<ProductChip
						process={row.original}
						siblingCount={siblingCountOf(row.original)}
						onOpenProduct={onNavigate ? openProduct : undefined}
					/>
				),
			},
			{
				id: "object type",
				accessorFn: (p) => getObjectType(p.objectTypeId)?.displayName ?? p.objectTypeId,
				header: ({column}) => <DataTableColumnHeader column={column} title="Object type" />,
				cell: ({row}) => {
					const facts = metaOf(row.original).facts;
					return (
						<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap">
							<TypeGlyphLabel type={getObjectType(row.original.objectTypeId)} />
							<Mono>{`${facts.tokenCount} row${facts.tokenCount === 1 ? "" : "s"}`}</Mono>
						</span>
					);
				},
			},
			{
				id: "states",
				accessorFn: (p) => p.states.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="States" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right"},
				cell: ({row}) => {
					const facts = metaOf(row.original).facts;
					return (
						<span className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-1.5 wwc:whitespace-nowrap wwc:tabular-nums">
							{facts.stateCount}
							<GraphMarkers facts={facts} />
						</span>
					);
				},
			},
			{
				id: "transitions",
				accessorFn: (p) => p.transitions.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Transitions" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => row.original.transitions.length,
			},
			{
				// Tokens in a NON-terminal state — the live work, not the whole row set.
				id: "open",
				accessorFn: (p) => processFacts(p).openCount,
				header: ({column}) => <DataTableColumnHeader column={column} title="Open" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right"},
				cell: ({row}) => {
					const facts = metaOf(row.original).facts;
					return <TokenBar open={facts.openCount} over={facts.overSlaCount} />;
				},
			},
			{
				id: "over sla",
				accessorFn: (p) => processFacts(p).overSlaCount,
				header: ({column}) => <DataTableColumnHeader column={column} title="Over SLA" />,
				cell: ({row}) => {
					const facts = metaOf(row.original).facts;
					return <OverSlaBadge over={facts.overSlaCount} total={facts.openCount} />;
				},
			},
			{
				id: "bottleneck",
				accessorFn: (p) => processFacts(p).worstBottleneck?.overShare ?? -1,
				header: ({column}) => <DataTableColumnHeader column={column} title="Bottleneck" />,
				cell: ({row}) => <BottleneckCell meta={metaOf(row.original)} />,
			},
			{
				// Hidden by default: it is worth stating wherever an SLA number is shown, and both the card
				// and the detail header show it — but as a column it repeats what "over sla" already implies
				// on a two-row table. Still searched, and shown on the card.
				id: "sla model",
				accessorFn: (p) => processFacts(p).slaModel,
				header: "SLA model",
				cell: ({row}) => <SlaModelBadge process={row.original} />,
			},
			{
				// Hidden by default — every evidence note is 120+ chars and the shared Table is table-fixed,
				// so it would squeeze every other column. It still participates in the search predicate
				// regardless of visibility, and the card shows it in full.
				id: "evidence",
				accessorFn: (p) => p.evidenceNote,
				header: "Evidence",
				cell: ({row}) => <span className="wwc:text-xs wwc:text-muted-foreground">{row.original.evidenceNote}</span>,
			},
			{
				id: "actions",
				header: "",
				enableSorting: false,
				enableHiding: false,
				// Per DataTable's own doc comment — body cells truncate at max-w-0 by default, which would
				// ellipsise the button.
				meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:whitespace-nowrap"},
				cell: ({row}) => (
					<Button
						variant="ghost"
						size="sm"
						icon
						aria-label={`Open ${row.original.name}`}
						tooltip="Open"
						onClick={(e) => {
							e.stopPropagation();
							openProcess(row.original.id);
						}}
					>
						<ArrowUpRight />
					</Button>
				),
			},
		],
		[metaOf, openProcess, openProduct, onNavigate, siblingCountOf, onShowInFiles],
	);

	const renderGrid = useCallback(
		(rows: Row<Wc3ProcessRecord>[]) => {
			// The SAME rows the <Table> would have painted — already filtered, sorted and paginated by the
			// one DataTable this view mounts.
			if (rows.length === 0) {
				return <ProcessesEmptyState hasAny={processes.length > 0} onClear={clearAll} onNew={() => setNewOpen(true)} />;
			}
			return (
				<CatalogueCardGrid data-processes-catalogue={rows.length}>
					{rows.map((row) => (
						<ProcessCard
							key={row.id}
							process={row.original}
							meta={metaOf(row.original)}
							siblingCount={siblingCountOf(row.original)}
							onOpen={openProcess}
							onOpenProduct={onNavigate ? openProduct : undefined}
						/>
					))}
				</CatalogueCardGrid>
			);
		},
		[processes.length, clearAll, metaOf, siblingCountOf, openProcess, openProduct, onNavigate],
	);

	return (
		<>
			{/*
			 * Unconditional SIBLING of the drill-in, not a child of the catalogue branch: an early
			 * `if (open) return <ProcessDetail/>` would unmount the dialog the moment a process is open,
			 * and the empty catalogue's "Create process" action would open nothing.
			 */}
			<CreateProcessDialog
				open={newOpen}
				onOpenChange={setNewOpen}
				onCreate={createFromDraft}
				processes={processes}
				locationField={createLocationField}
			/>

			{missingId ? (
				<Pane>
					<ProcessNotFound processId={missingId} onBack={() => setOpenId(null)} />
				</Pane>
			) : open ? (
				/*
				 * ProcessDetail is NOT wrapped in Pane. It owns its own layout — a header band above a
				 * SideMenu/content row with its own p-6 — so Pane's px-6 would apply the gutter twice and
				 * inset the whole page (measured on the products precedent: 48px right gutter against 24px).
				 */
				<ProcessDetail
					// Keyed on the process so the detail's transient state (selection, SLA tint, refusal
					// banner, half-filled add-transition form) is dropped when the user crosses from one
					// process to another rather than carrying over.
					key={open.id}
					process={open}
					onChange={(next: Wc3ProcessRecord) => onProcessesChange(replaceProcess(processes, next))}
					onBack={() => {
						setCreatedId(null);
						setOpenId(null);
					}}
					onNavigate={onNavigate}
					isNew={open.id === createdId}
				/>
			) : (
				<Pane flush>
					{/* No in-content <h1> — the perspective tab bar is the header. */}
					<p className="wwc:pt-4 wwc:text-xs wwc:text-muted-foreground">
						State machines bound to one ontology object type, whose rows are the tokens — open one to edit its graph and
						read its bottleneck analysis, or create one from scratch. A product can own several processes; that
						provenance is derived from the backing object type's install record, not stored on the process. Everything
						here is session state: a reload restores the seeded catalogue.
					</p>

					<Filter value={filters} onChange={setFilters}>
						{/*
						 * ONE DataTable is mounted for the life of this view. `mode` appears in exactly two
						 * props — `renderGrid` and `showColumnToggle` — and nowhere else: no `key`, no
						 * conditional render, no second table. The sorting, the page index and the column
						 * visibility all live in useState INSIDE DataTable, so any structure that unmounts it
						 * would reset them; this one structurally cannot. The query and the applied filter are
						 * held above it, here, for the same reason.
						 */}
						<DataTable
							columns={columns}
							data={data}
							search={query}
							onSearchChange={setQuery}
							searchPlaceholder="Filter processes…"
							recordLabel="process"
							recordLabelPlural="processes"
							pageSize={25}
							flushToolbar
							getRowId={(p) => p.id}
							showColumnToggle={mode === "table"}
							initialColumnVisibility={{"sla model": false, evidence: false}}
							renderGrid={mode === "cards" ? renderGrid : undefined}
							emptyMessage={
								<ProcessesEmptyState hasAny={processes.length > 0} onClear={clearAll} onNew={() => setNewOpen(true)} />
							}
							filterChipLabel={(category, value) => {
								if (category === "product") {
									return productOptions.find((o) => o.value === value)?.label ?? value;
								}
								if (category === "origin") return ORIGIN_LABEL[value] ?? value;
								return value;
							}}
							toolbarExtra={
								<>
									<Button size="sm" onClick={() => setNewOpen(true)}>
										<Plus className="wwc:h-3.5 wwc:w-3.5" />
										Create process
									</Button>
									<CatalogueViewToggle value={mode} onValueChange={setMode} />
									<FilterTrigger />
									<FilterContent>
										{/*
										 * Degenerate on the seeded fixture — both processes resolve to Safety, so this
										 * facet has ONE non-empty option. It is kept because it is the facet the user
										 * asked for and the one that grows the moment a process is created on an object
										 * type another product installed; the count in the label states the truth
										 * either way.
										 */}
										<FilterCategory value="product" label="Product">
											{productOptions.map((option) => (
												<FilterOption key={option.value} value={option.value}>
													{`${option.label} (${option.count})`}
												</FilterOption>
											))}
										</FilterCategory>
										{/*
										 * Also degenerate at first paint — every seeded process reads "Seeded". Kept for
										 * the same reason the pipelines list keeps its Run-state facet: it is the one
										 * facet that becomes useful purely through use, because it is how you find what
										 * you just created.
										 */}
										<FilterCategory value="origin" label="Origin">
											<FilterOption value="seeded">{`Seeded (${originCounts.seeded})`}</FilterOption>
											<FilterOption value="session">{`Created in session (${originCounts.session})`}</FilterOption>
										</FilterCategory>
									</FilterContent>
								</>
							}
						/>
					</Filter>
				</Pane>
			)}
		</>
	);
}
