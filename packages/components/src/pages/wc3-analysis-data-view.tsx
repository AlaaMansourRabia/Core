import type {ReactElement, ReactNode} from "react";

import {
	AnalysisOption,
	AnalysisWorkbench,
	Mono,
	WC3_ANALYSIS_SOURCE_DATASET_IDS,
	analysisDataset,
	analysisDatasetName,
	analysisDatasetRows,
	type Wc3AnalysisStageContext,
	type Wc3AnalysisViewProps,
} from "./wc3-analysis-shared";
import {WC3_DATASOURCE_CATALOG, WC3_DATASOURCE_KIND_LABEL} from "./wc3-ontology-data";

// Tab "data" of the Analysis perspective — the Data analysis builder, ported from the prototype's
// PageAnalysis in data mode (06-unified-workspace.html, AnStageConfig).
//
// This file is deliberately thin. It mounts AnalysisWorkbench from wc3-analysis-shared.tsx and
// supplies exactly the TWO stage bodies the prototype itself writes differently per mode — Source
// and Traverse / Join. The rail, Filter, Derive, Group, Visualize, Publish, the result panel and the
// execution-meta panel are the shared implementation, which is the reason this tab and Object
// analysis structurally cannot drift.
//
// THE HONESTY DEMO THIS TAB EXISTS FOR. Of the four datasets the Source stage offers, three hold
// materialised rows and one — badge_events_import_raw — is declared in the catalogue and holds
// none. It is offered anyway and is NEVER `disabled`: selecting it is precisely how the page shows
// what an unmaterialised source does. `analysisDatasetRows` returns [], the rail's Source stage
// flags itself bad through `analysisStageSummary`, and the result panel renders the prototype's own
// "No rows to analyse" copy (WC3_ANALYSIS_MESSAGES.sourceEmpty) naming the pipeline that would have
// to land it. No row is invented to fill the panel, and the row counts on every option below are
// `analysisDatasetRows(id).length` — read from the fixture, never typed into the markup.
//
// THREE DOCUMENTED DIVERGENCES FROM THE PROTOTYPE, all deliberate:
//
//   1. OPTION ORDER. The prototype renders `DS_CATALOG.filter(d => [...].includes(d.id))`, so the
//      four options come out in CATALOGUE order (workers, activities, observations, badge import),
//      not in the order of the id list it filters with. WC3_ANALYSIS_SOURCE_DATASET_IDS holds that
//      id list, so it is used for MEMBERSHIP and re-ordered by catalogue position below to match
//      what the prototype actually paints.
//
//   2. NO "OPEN IN LINEAGE" AFFORDANCE. It was specified for datasets whose catalogue entry names a
//      producing pipeline. None does: `Wc3CatalogSource` is {id, kind, name, columns, pkDuplicates}
//      and declares no producer, and no node in WC3_PIPELINES references any of these four dataset
//      ids or names — the pipeline sinks name target OBJECT TYPES (`params.targetOt`) instead. A
//      button pointing at a guessed pipeline would fabricate provenance, so none is shipped. If the
//      catalogue ever gains a producer field, the affordance becomes derivable and can be added.
//
//   3. TWO DERIVED DETAIL LINES the prototype does not print — the selected dataset's catalogue
//      facts under Source, and the join's observed resolution rate under Traverse / Join. Both are
//      computed from the catalogue entry and from `ctx.result`; neither authors a number. They exist
//      because the prototype's own data-mode behaviour (a join key hardcoded to `reported_by`) is
//      otherwise invisible until the result panel comes back empty.

/** Position of a dataset in the catalogue — the order the prototype's Source stage paints. */
const catalogueIndex = (dsId: string): number => WC3_DATASOURCE_CATALOG.findIndex((c) => c.id === dsId);

/**
 * The four offered datasets in the prototype's render order. Sorted on a COPY: the fixture arrays
 * are shared with the Ontology and Processes perspectives and nothing here may sort one in place.
 */
const SOURCE_DATASET_IDS: string[] = [...WC3_ANALYSIS_SOURCE_DATASET_IDS].sort((a, b) => {
	return catalogueIndex(a) - catalogueIndex(b);
});

/** The join key the prototype hardcodes for data mode. Quoted, not re-derived — see the note below. */
const DATA_JOIN_KEY = "reported_by";

/** The dataset the prototype's one declared join brings in. */
const DATA_JOIN_DS = "ds_workers";

/**
 * Source stage — one option per offered catalogue dataset.
 *
 * The label is the prototype's verbatim: `{name} · {n} rows`, or `{name} · not materialised` when
 * the dataset has none. `unavailable` tints the option amber; it never disables it.
 */
function DataSourceConfig({spec, setSpec}: Wc3AnalysisStageContext): ReactElement {
	const selected = analysisDataset(spec.sourceDs ?? "");
	const selectedRows = analysisDatasetRows(spec.sourceDs ?? "").length;
	return (
		<div>
			<div className="wwc:flex wwc:flex-wrap">
				{SOURCE_DATASET_IDS.map((dsId) => {
					// Counted from the fixture rows on every render, so an option can never claim a row
					// count the engine would not then scan.
					const rows = analysisDatasetRows(dsId).length;
					return (
						<AnalysisOption
							key={dsId}
							selected={spec.sourceDs === dsId}
							unavailable={rows === 0}
							onSelect={() => setSpec({sourceDs: dsId})}
						>
							{analysisDatasetName(dsId)}
							<span className="wwc:opacity-70">· {rows === 0 ? "not materialised" : `${rows} rows`}</span>
						</AnalysisOption>
					);
				})}
			</div>
			{selected ? (
				// Catalogue facts about the current selection — kind, how many columns it declares, and
				// whether it declares duplicate primary keys. All read off the catalogue entry; the
				// "no materialised rows" clause is the row count, not a flag someone set.
				<p className="wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">
					<Mono>{selected.name}</Mono> · {WC3_DATASOURCE_KIND_LABEL[selected.kind] ?? selected.kind} ·{" "}
					{selected.columns.length} declared columns
					{selected.pkDuplicates ? " · declares duplicate primary keys" : ""}
					{selectedRows === 0 ? " · no materialised rows in this prototype" : ""}
				</p>
			) : null}
		</div>
	);
}

/**
 * Traverse / Join stage — the prototype offers exactly one declared join and "no join".
 *
 * THE HONEST PART. The prototype's data-mode join key is FIXED at `reported_by = worker_id`: the
 * join is declared between the two datasets, not resolved per source. That is faithful — the
 * catalogue declares a join, not a join per query — but it means a source without a `reported_by`
 * column resolves to no worker at all and every row then groups as "— unlinked —". The prototype
 * never says so and simply returns a degenerate result. The note below states it, and the
 * resolution line reports what the join actually achieved on the rows that matched.
 */
function DataJoinConfig({spec, result, setSpec}: Wc3AnalysisStageContext): ReactElement {
	const joined = spec.joinDs === DATA_JOIN_DS;
	// Observed, not declared: rowsUnlinked counts matched rows whose join resolved to no worker.
	const resolved = result.rowsMatched - result.rowsUnlinked;
	const resolution: ReactNode = !joined
		? null
		: result.rowsMatched === 0
			? "No rows matched, so the join resolved nothing — the result panel names the stage that excluded them."
			: `Resolved to a worker for ${resolved.toLocaleString()} of ${result.rowsMatched.toLocaleString()} matched rows.`;
	return (
		<div>
			<div className="wwc:flex wwc:flex-wrap">
				<AnalysisOption selected={joined} onSelect={() => setSpec({joinDs: DATA_JOIN_DS})}>
					⨝ {analysisDatasetName(DATA_JOIN_DS)} on {DATA_JOIN_KEY} = worker_id
				</AnalysisOption>
				<AnalysisOption selected={!spec.joinDs} onSelect={() => setSpec({joinDs: null})}>
					no join
				</AnalysisOption>
			</div>
			{/* One line: the key is fixed and unmatched rows land in "— unlinked —". The long version
			    spelled out the consequence three ways. */}
			<p className="wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">
				Join key fixed at <Mono>{DATA_JOIN_KEY}</Mono> = <Mono>worker_id</Mono>; rows without it group as “— unlinked
				—”.
			</p>
			{resolution ? <p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">{resolution}</p> : null}
		</div>
	);
}

/**
 * The Data analysis tab: start from a governed dataset in the catalogue, join a second one, derive,
 * group and aggregate.
 *
 * The live session arrives on props and every mutation is committed through `onSessionChange` with
 * one of the pure helpers in wc3-analysis-shared.tsx. Nothing in this file reads the fixture for
 * anything mutable, and nothing here builds a spec object by hand — `setSpec` from the workbench's
 * stage context is the only writer, so `result` can never drift from the spec beside it.
 */
export function DataAnalysisView({session, onSessionChange, onNavigate}: Wc3AnalysisViewProps): ReactElement {
	return (
		<AnalysisWorkbench
			mode="data"
			session={session}
			onSessionChange={onSessionChange}
			onNavigate={onNavigate}
			renderSourceConfig={(ctx) => <DataSourceConfig {...ctx} />}
			renderTraverseConfig={(ctx) => <DataJoinConfig {...ctx} />}
		/>
	);
}
