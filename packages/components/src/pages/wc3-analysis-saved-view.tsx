import type {ColumnDef, Row} from "@tanstack/react-table";
import type {ReactElement} from "react";

import {ArrowUpRight, Bookmark, Search, Trash2} from "lucide-react";
import {useCallback, useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import {CatalogueCardGrid, CatalogueViewToggle, useCatalogueViewMode} from "../catalogue-view-toggle";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Empty} from "../empty";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {
	AnalysisRouteBadge,
	AnalysisSpecSummary,
	Mono,
	Pane,
	TypeGlyphLabel,
	WC3_ANALYSIS_MESSAGES,
	type Wc3AnalysisMode,
	type Wc3AnalysisSpec,
	type Wc3AnalysisViewProps,
	type Wc3Materialisation,
	type Wc3SavedAnalysis,
	analysisDatasetName,
	analysisDeleteMaterialisation,
	analysisDeleteSaved,
	analysisLineage,
	analysisMetric,
	analysisNav,
	analysisReopen,
} from "./wc3-analysis-shared";
import {getObjectType} from "./wc3-ontology-data";

// The Analysis perspective's third tab: the record list of saved analyses, plus the materialisations
// the builder's publish stage produced.
//
// THE LIST OPENS EMPTY, AND THAT IS THE HONEST STATE. The prototype's store boots with
// `S.analyses = []` and `S.materializations = []` (06-unified-workspace.html, AnSavedList ~10072), so
// WC3_SAVED_ANALYSES_SEED and WC3_MATERIALISATIONS_SEED are both `[]` and this surface renders the
// shared Empty with the prototype's own copy until the session saves something. Nothing is seeded to
// make the tab look populated; a fabricated saved analysis would carry a fabricated route and a
// fabricated timing, which is exactly the claim the rest of this perspective refuses to make.
//
// Nothing in this file reads the fixture's seeds. The live session arrives on props and every
// mutation is committed back through `onSessionChange` with a pure helper from
// wc3-analysis-shared.tsx — a raw spread over `session.saved` here would be a contract violation, and
// a raw spread over `session.object` / `session.data` would desynchronise a spec from its result.
//
// FOUR DIVERGENCES FROM THE PROTOTYPE, all deliberate:
//   1. The prototype renders this as a side panel inside the builder page (AnSavedList, injected below
//      the execution-meta block). Here it is the perspective's own declared tab, so the builder's
//      right column links to it instead of rendering the list a second time.
//   2. The prototype's "View lineage" button toasts the lineage as a sentence. The lineage is stored
//      derivably — it is a pure function of the saved spec — so it is RENDERED on the card and in a
//      column instead of hidden behind a transient toast. The button is therefore dropped, not lost.
//   3. Delete is net-new: the prototype has no way to remove a saved analysis or a materialisation, so
//      one mis-click is permanent for the session. Both deletes go through the shared pure mutators.
//   4. The three columns that carry the rest of the spec (`spec`, `lineage`) and the timing (`ms`)
//      ship HIDDEN rather than absent, so the card⇄table toggle is lossless in both directions: every
//      fact the card shows is reachable in the table through the column-toggle popover.
//
// HONEST SCALE NOTES, because they shape the facets and the sort affordances below:
//   · Every record here is created in-session. There is no seeded history, so an "Origin" facet would
//     select every row and read as broken.
//   · `at` is the frozen fixture clock (WC3_PROCESS_FIXTURE_NOW) for every save, because that is the
//     only clock this prototype has. Sorting by "saved at" is therefore a no-op on the seeded clock;
//     the column is kept because it is what the prototype prints and because it is the truth about
//     when the analysis was executed, not because it discriminates.

// ─── Labels ──────────────────────────────────────────────────────────────────

/** Matches the perspective's own tab labels, so a saved record names the tab it reopens into. */
const MODE_LABEL: Record<Wc3AnalysisMode, string> = {object: "Object analysis", data: "Data analysis"};

/** Object mode names an ontology object type; data mode names a catalogue dataset. */
const sourceLabel = (spec: Wc3AnalysisSpec): string =>
	spec.mode === "object" ? (spec.sourceType ?? "—") : analysisDatasetName(spec.sourceDs ?? "");

const groupLabel = (spec: Wc3AnalysisSpec): string =>
	`${spec.groupBy ?? "none"}${spec.grain === "month" ? " × month" : ""}`;

const metricsLabel = (spec: Wc3AnalysisSpec): string =>
	spec.metrics.length ? spec.metrics.map((id) => analysisMetric(id)?.label ?? id).join(", ") : "none";

const traverseLabel = (spec: Wc3AnalysisSpec): string =>
	spec.mode === "object"
		? spec.traverse
			? `traverse ${spec.traverse} → ot_worker`
			: "no traversal"
		: spec.joinDs
			? `join ${analysisDatasetName(spec.joinDs)} on reported_by = worker_id`
			: "no join";

/**
 * The part of the spec that does NOT already have a column of its own, on one line.
 *
 * Mode, Source and Group are columns; this covers the other five rows AnalysisSpecSummary renders, so
 * between them the table can show everything the card does.
 */
const specDetailLine = (spec: Wc3AnalysisSpec): string =>
	[
		`filters ${spec.filters.length ? spec.filters.map((f) => `${f.field} = ${f.value}`).join(", ") : "none"}`,
		traverseLabel(spec),
		`metrics ${metricsLabel(spec)}`,
		`window ${spec.window === 0 ? "current state only" : `${spec.window} weeks`}`,
		`chart ${spec.viz}`,
	].join(" · ");

/** One search haystack for both view modes — the toggle changes rendering, never matching. */
const savedSearchText = (a: Wc3SavedAnalysis): string =>
	[
		a.id,
		a.name,
		a.route,
		MODE_LABEL[a.spec.mode],
		sourceLabel(a.spec),
		groupLabel(a.spec),
		specDetailLine(a.spec),
		analysisLineage(a.spec).join(" "),
		a.at,
	].join(" ");

// ─── Shared cell/card fragments ──────────────────────────────────────────────

/** The source, with the ontology glyph in object mode and the catalogue name in data mode. */
function SourceLabel({spec}: {spec: Wc3AnalysisSpec}): ReactElement {
	if (spec.mode === "object" && spec.sourceType) {
		return <TypeGlyphLabel type={getObjectType(spec.sourceType)} className="wwc:text-sm" />;
	}
	return <Mono>{sourceLabel(spec)}</Mono>;
}

/**
 * The provenance chain, recomputed from the saved spec.
 *
 * It is not a stored field: `analysisLineage` is pure, so re-deriving it from the spec that was
 * saved beside the route is the same chain the execution-meta panel printed when Save was pressed.
 * That is the third of the three things this tab exists to keep together.
 */
function LineageChain({spec, className}: {spec: Wc3AnalysisSpec; className?: string}): ReactElement {
	return (
		<span className={className}>
			{analysisLineage(spec).map((line, i) => (
				<span key={line} className="wwc:whitespace-nowrap">
					{i > 0 ? <span className="wwc:px-1 wwc:text-muted-foreground">·</span> : null}
					<Mono>{line}</Mono>
				</span>
			))}
		</span>
	);
}

/** The prototype's saved-record meta line, verbatim apart from the route, which is the Badge. */
const metaLine = (a: Wc3SavedAnalysis): string =>
	`${a.rows.toLocaleString()} rows → ${a.groups.toLocaleString()} groups · ${a.ms} ms · ${a.at}`;

// ─── Card ────────────────────────────────────────────────────────────────────

/**
 * One saved analysis. It carries the SPEC (via AnalysisSpecSummary), the execution ROUTE and the
 * LINEAGE together — which is the whole claim the prototype's save flow makes — plus the counts and
 * the timing exactly as executed.
 *
 * Table-only facts: none. Card-only facts: none — `spec`, `lineage` and `ms` are columns that ship
 * hidden rather than facts the table cannot reach.
 */
function SavedAnalysisCard({
	saved,
	onReopen,
	onDelete,
}: {
	saved: Wc3SavedAnalysis;
	onReopen: (a: Wc3SavedAnalysis) => void;
	onDelete: (id: string) => void;
}): ReactElement {
	return (
		<Card
			data-saved-analysis={saved.id}
			className="wwc:flex wwc:flex-col wwc:gap-2 wwc:rounded-lg wwc:p-3 wwc:text-left"
		>
			<div className="wwc:flex wwc:items-start wwc:gap-2">
				<div className="wwc:min-w-0 wwc:flex-1">
					<div className="wwc:truncate wwc:text-sm wwc:font-semibold">{saved.name}</div>
					<Mono>{saved.id}</Mono>
				</div>
				<AnalysisRouteBadge route={saved.route} />
			</div>

			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
				<Badge variant="neutralSoft">{MODE_LABEL[saved.spec.mode]}</Badge>
				<SourceLabel spec={saved.spec} />
			</div>

			<p className="wwc:text-xs wwc:text-muted-foreground wwc:tabular-nums">{metaLine(saved)}</p>

			{/* The whole spec, so reopening is never a surprise and the card is lossless against the row. */}
			<AnalysisSpecSummary spec={saved.spec} dense />

			<div className="wwc:flex wwc:flex-col wwc:gap-0.5">
				<span className="wwc:text-xs wwc:text-muted-foreground">Lineage</span>
				<LineageChain spec={saved.spec} className="wwc:flex wwc:flex-wrap wwc:items-center" />
			</div>

			<div className="wwc:mt-auto wwc:flex wwc:items-center wwc:gap-1.5 wwc:pt-1">
				<Button variant="outline" size="sm" onClick={() => onReopen(saved)}>
					<ArrowUpRight />
					Reopen
				</Button>
				<span className="wwc:flex-1" />
				<Button
					variant="ghost"
					size="sm"
					icon
					aria-label={`Delete ${saved.name}`}
					tooltip="Delete"
					onClick={() => onDelete(saved.id)}
				>
					<Trash2 />
				</Button>
			</div>
		</Card>
	);
}

// ─── Empty states ────────────────────────────────────────────────────────────

/**
 * `hasAny` distinguishes "nothing has ever been saved" from "the search and facets exclude
 * everything". The first is the prototype's copy verbatim; the second must never be shown in its
 * place, or a filtered-out list would read as a lost record.
 */
function SavedEmptyState({
	hasAny,
	onClear,
	onBuild,
}: {
	hasAny: boolean;
	onClear: () => void;
	onBuild?: () => void;
}): ReactElement {
	if (!hasAny) {
		return (
			<Empty
				icon={<Bookmark className="wwc:h-6 wwc:w-6" />}
				title="No saved analyses"
				description={WC3_ANALYSIS_MESSAGES.savedEmpty}
				action={
					onBuild ? (
						<Button onClick={onBuild}>
							<ArrowUpRight />
							Build an analysis
						</Button>
					) : undefined
				}
			/>
		);
	}
	return (
		<Empty
			icon={<Search className="wwc:h-6 wwc:w-6" />}
			title="No saved analyses match"
			description="Nothing in this list matches the current search and filter."
			action={
				<Button variant="outline" onClick={onClear}>
					<Search />
					Clear the filter
				</Button>
			}
		/>
	);
}

// ─── Materialisations ────────────────────────────────────────────────────────

/**
 * The materialisations the publish stage produced, as the prototype's saved panel lists them:
 * `materialised · N groups · at`, verbatim.
 *
 * They are NOT rows of the table above. A materialisation holds no spec and no lineage — it is a
 * saved RESULT, not a saved question — so folding it into a list whose columns are spec fields would
 * mean printing "—" for most of the row. It renders only when at least one exists.
 */
function MaterialisationList({
	materialisations,
	onDelete,
}: {
	materialisations: Wc3Materialisation[];
	onDelete: (id: string) => void;
}): ReactElement {
	return (
		<section className="wwc:flex wwc:flex-col wwc:gap-2">
			<h3 className="wwc:text-sm wwc:font-semibold">{`Materialisations (${materialisations.length})`}</h3>
			<p className="wwc:text-xs wwc:text-muted-foreground">
				A materialisation stores the grouped result, not the question behind it. Its execution metadata reads
				Materialised rather than Live query for as long as the spec that produced it is untouched.
			</p>
			<div className="wwc:grid wwc:gap-2 wwc:sm:grid-cols-2 wwc:xl:grid-cols-3">
				{materialisations.map((m) => (
					<Card key={m.id} data-materialisation={m.id} className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:p-3">
						<div className="wwc:flex wwc:items-start wwc:gap-2">
							<div className="wwc:min-w-0 wwc:flex-1">
								<div className="wwc:truncate wwc:text-sm wwc:font-semibold">{m.name}</div>
								<Mono>{m.id}</Mono>
							</div>
							<AnalysisRouteBadge route={m.route} />
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-1.5">
							<p className="wwc:flex-1 wwc:text-xs wwc:text-muted-foreground wwc:tabular-nums">
								{`materialised · ${m.groups.toLocaleString()} groups · ${m.at}`}
							</p>
							<Button
								variant="ghost"
								size="sm"
								icon
								aria-label={`Delete ${m.name}`}
								tooltip="Delete"
								onClick={() => onDelete(m.id)}
							>
								<Trash2 />
							</Button>
						</div>
					</Card>
				))}
			</div>
		</section>
	);
}

// ─── View ────────────────────────────────────────────────────────────────────

export function SavedAnalysesView({session, onSessionChange, onNavigate}: Wc3AnalysisViewProps): ReactElement {
	const [filters, setFilters] = useState<FilterValue>({});
	// Controlled so the empty state's "Clear the filter" can clear the query as well as the facets.
	const [query, setQuery] = useState("");
	// Persisted: the perspective has three tabs and the shell resolves exactly one ANALYSIS_VIEWS entry
	// per render, so a plain useState here would reset on every trip to a builder tab.
	const [mode, setMode] = useCatalogueViewMode("wc3.analysis.saved.view");

	// No useDetailLabel and no persisted open id: this surface has no drill-in. A saved analysis is
	// reopened INTO the builder tab that owns its mode, which is a navigation, not a detail page — so
	// there is no breadcrumb tail to report and no dangling id to guard.

	const saved = session.saved;
	const materialisations = session.materialisations;

	const reopen = useCallback(
		(a: Wc3SavedAnalysis) => {
			// analysisReopen deep-clones the spec into ITS OWN mode's slot and re-runs it, so the builder
			// opens with a result that matches the spec rather than the one it was showing before.
			onSessionChange(analysisReopen(session, a));
			onNavigate?.(a.spec.mode === "object" ? analysisNav.object() : analysisNav.data());
		},
		[session, onSessionChange, onNavigate],
	);

	const deleteSaved = useCallback(
		(id: string) => onSessionChange(analysisDeleteSaved(session, id)),
		[session, onSessionChange],
	);

	const deleteMaterialisation = useCallback(
		(id: string) => onSessionChange(analysisDeleteMaterialisation(session, id)),
		[session, onSessionChange],
	);

	const build = useCallback(() => onNavigate?.(analysisNav.object()), [onNavigate]);

	const clearAll = useCallback(() => {
		setFilters({});
		setQuery("");
	}, []);

	// ── Facets. TWO only, both DERIVED from the live array so an option can never be dead.
	//
	// Deliberately NOT shipped, because each would select every row or none at this size and would read
	// as broken rather than as a filter:
	//   · Origin — every record here is created in-session; there is no seeded history to separate.
	//   · Saved at — one frozen fixture clock stamps every save with the same value.
	//   · Group by / window / chart — these are spec fields, not properties of the saved record, and
	//     they are already searchable through the hidden `spec` column's text.
	//   · Source — 1:1 with `mode` on everything the builders can produce today (object mode has one
	//     source type, and the data-mode picker offers four datasets of which three yield no rows).
	const routeOptions = useMemo(() => {
		const counts = new Map<string, number>();
		for (const a of saved) counts.set(a.route, (counts.get(a.route) ?? 0) + 1);
		return [...counts.entries()]
			.map(([value, count]) => ({value, count}))
			.sort((a, b) => a.value.localeCompare(b.value));
	}, [saved]);

	const modeCounts = useMemo(() => {
		const object = saved.filter((a) => a.spec.mode === "object").length;
		return {object, data: saved.length - object};
	}, [saved]);

	// ONE predicate for both view modes — the toggle changes what DataTable's body renders, never what
	// it filters.
	const data = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return saved.filter((a) => {
			if (needle && !savedSearchText(a).toLowerCase().includes(needle)) return false;
			const route = filters.route;
			if (route && route.length > 0 && !route.includes(a.route)) return false;
			const specMode = filters.mode;
			if (specMode && specMode.length > 0 && !specMode.includes(a.spec.mode)) return false;
			return true;
		});
	}, [saved, query, filters]);

	const columns: ColumnDef<Wc3SavedAnalysis, unknown>[] = useMemo(
		() => [
			{
				// Ids are space-separated lowercase on purpose: the column-toggle popover capitalises
				// `column.id`, so "savedAt" would read "SavedAt" in the list.
				id: "name",
				accessorFn: (a) => a.name,
				header: ({column}) => <DataTableColumnHeader column={column} title="Analysis" />,
				enableHiding: false,
				cell: ({row}) => (
					<span className="wwc:flex wwc:min-w-0 wwc:flex-col">
						<button
							type="button"
							onClick={() => reopen(row.original)}
							className="wwc:block wwc:truncate wwc:text-left wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
						>
							{row.original.name}
						</button>
						<Mono>{row.original.id}</Mono>
					</span>
				),
			},
			{
				// The execution route AS EXECUTED. It is stored on the record rather than re-derived, so a
				// saved analysis always reports the engine that actually answered it.
				id: "route",
				accessorFn: (a) => a.route,
				header: ({column}) => <DataTableColumnHeader column={column} title="Route" />,
				cell: ({row}) => <AnalysisRouteBadge route={row.original.route} />,
			},
			{
				id: "mode",
				accessorFn: (a) => MODE_LABEL[a.spec.mode],
				header: ({column}) => <DataTableColumnHeader column={column} title="Mode" />,
				cell: ({row}) => <Badge variant="neutralSoft">{MODE_LABEL[row.original.spec.mode]}</Badge>,
			},
			{
				id: "source",
				accessorFn: (a) => sourceLabel(a.spec),
				header: ({column}) => <DataTableColumnHeader column={column} title="Source" />,
				cell: ({row}) => <SourceLabel spec={row.original.spec} />,
			},
			{
				id: "group",
				accessorFn: (a) => groupLabel(a.spec),
				header: ({column}) => <DataTableColumnHeader column={column} title="Group" />,
				cell: ({row}) => <Mono>{groupLabel(row.original.spec)}</Mono>,
			},
			{
				id: "rows",
				accessorFn: (a) => a.rows,
				header: ({column}) => <DataTableColumnHeader column={column} title="Rows" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => row.original.rows.toLocaleString(),
			},
			{
				id: "groups",
				accessorFn: (a) => a.groups,
				header: ({column}) => <DataTableColumnHeader column={column} title="Groups" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => row.original.groups.toLocaleString(),
			},
			{
				// Hidden by default: `ms` is a measurement of one execution in one browser tab, so it is a
				// provenance fact rather than something to rank saved analyses by. Still reachable.
				id: "ms",
				accessorFn: (a) => a.ms,
				header: ({column}) => <DataTableColumnHeader column={column} title="Time" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => `${row.original.ms} ms`,
			},
			{
				id: "saved at",
				accessorFn: (a) => a.at,
				header: ({column}) => <DataTableColumnHeader column={column} title="Saved at" />,
				// The frozen fixture clock stamps every save identically — the column states the truth, it
				// does not discriminate. Said out loud rather than silently sorted on.
				cell: ({row}) => <Mono>{row.original.at}</Mono>,
			},
			{
				// Hidden by default. Carries the five spec fields that have no column of their own, so the
				// table can show everything the card's AnalysisSpecSummary shows.
				id: "spec",
				accessorFn: (a) => specDetailLine(a.spec),
				header: ({column}) => <DataTableColumnHeader column={column} title="Spec" />,
				cell: ({row}) => (
					<span className="wwc:text-xs wwc:text-muted-foreground">{specDetailLine(row.original.spec)}</span>
				),
			},
			{
				// Hidden by default, for the same reason: the card prints the chain, so the table must be
				// able to as well.
				id: "lineage",
				accessorFn: (a) => analysisLineage(a.spec).join(" "),
				header: ({column}) => <DataTableColumnHeader column={column} title="Lineage" />,
				cell: ({row}) => <LineageChain spec={row.original.spec} className="wwc:flex wwc:flex-wrap" />,
			},
			{
				id: "actions",
				header: () => null,
				enableHiding: false,
				enableSorting: false,
				meta: {headerClassName: "wwc:w-20", cellClassName: "wwc:text-right"},
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-0.5">
						<Button
							variant="ghost"
							size="sm"
							icon
							aria-label={`Reopen ${row.original.name}`}
							tooltip="Reopen"
							onClick={() => reopen(row.original)}
						>
							<ArrowUpRight />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							icon
							aria-label={`Delete ${row.original.name}`}
							tooltip="Delete"
							onClick={() => deleteSaved(row.original.id)}
						>
							<Trash2 />
						</Button>
					</span>
				),
			},
		],
		[reopen, deleteSaved],
	);

	const renderGrid = useCallback(
		(rows: Row<Wc3SavedAnalysis>[]) => {
			// The SAME rows the <Table> would have painted — already filtered, sorted and paginated by the
			// one DataTable this view mounts.
			if (rows.length === 0) {
				return (
					<SavedEmptyState hasAny={saved.length > 0} onClear={clearAll} onBuild={onNavigate ? build : undefined} />
				);
			}
			return (
				<CatalogueCardGrid data-saved-analyses={rows.length}>
					{rows.map((row) => (
						<SavedAnalysisCard key={row.id} saved={row.original} onReopen={reopen} onDelete={deleteSaved} />
					))}
				</CatalogueCardGrid>
			);
		},
		[saved.length, clearAll, onNavigate, build, reopen, deleteSaved],
	);

	return (
		<Pane flush>
			{/* No in-content <h1> — the perspective tab bar is the header. */}
			<p className="wwc:pt-4 wwc:text-xs wwc:text-muted-foreground">
				Every record here keeps three things together: the SPEC that was asked, the execution ROUTE the spec was
				computed onto, and the LINEAGE the answer came through — so a result can always be traced back to the question
				that produced it. Reopening restores the spec into the builder tab that owns its mode and re-runs it. Nothing is
				seeded: a record appears here only when a builder saves one, and a reload restores the empty list.
			</p>

			<Filter value={filters} onChange={setFilters}>
				{/*
				 * ONE DataTable is mounted for the life of this view. `mode` appears in exactly two props —
				 * `renderGrid` and `showColumnToggle` — and nowhere else: no `key`, no conditional render, no
				 * second table. The sorting, the page index and the column visibility all live in useState
				 * INSIDE DataTable, so any structure that unmounts it would reset them; this one structurally
				 * cannot. The query and the applied filter are held above it, here, for the same reason.
				 */}
				<DataTable
					columns={columns}
					data={data}
					search={query}
					onSearchChange={setQuery}
					searchPlaceholder="Filter saved analyses…"
					recordLabel="saved analysis"
					recordLabelPlural="saved analyses"
					pageSize={25}
					flushToolbar
					getRowId={(a) => a.id}
					showColumnToggle={mode === "table"}
					initialColumnVisibility={{ms: false, spec: false, lineage: false}}
					renderGrid={mode === "cards" ? renderGrid : undefined}
					emptyMessage={
						<SavedEmptyState hasAny={saved.length > 0} onClear={clearAll} onBuild={onNavigate ? build : undefined} />
					}
					filterChipLabel={(category, value) => {
						if (category === "mode") return MODE_LABEL[value as Wc3AnalysisMode] ?? value;
						return value;
					}}
					toolbarExtra={
						<>
							<CatalogueViewToggle value={mode} onValueChange={setMode} />
							<FilterTrigger />
							<FilterContent>
								{/*
								 * Derived from the live array, so only routes that have actually been executed appear.
								 * With no saved analyses the popover shows no route options at all rather than three
								 * dead ones — the honest state for a list that starts empty.
								 */}
								<FilterCategory value="route" label="Execution route">
									{routeOptions.map((option) => (
										<FilterOption key={option.value} value={option.value}>
											{`${option.value} (${option.count})`}
										</FilterOption>
									))}
								</FilterCategory>
								{/*
								 * The two builder tabs are the two things that produce records here, so this facet is
								 * the one that stays useful as the list grows. Counts come off the live array.
								 */}
								<FilterCategory value="mode" label="Mode">
									<FilterOption value="object">{`${MODE_LABEL.object} (${modeCounts.object})`}</FilterOption>
									<FilterOption value="data">{`${MODE_LABEL.data} (${modeCounts.data})`}</FilterOption>
								</FilterCategory>
							</FilterContent>
						</>
					}
				/>
			</Filter>

			{/* Only when at least one exists — an empty section here would be a second empty state. */}
			{materialisations.length > 0 ? (
				<MaterialisationList materialisations={materialisations} onDelete={deleteMaterialisation} />
			) : null}
		</Pane>
	);
}
