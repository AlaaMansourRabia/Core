import type {EChartsOption} from "echarts";
import type {ReactElement, ReactNode} from "react";

import {cn} from "@corensystem/core-utils";
import {AlertTriangle, BarChart3, ChevronDown, Play, RotateCcw, Table2} from "lucide-react";
import {useState} from "react";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "../accordion";
import {Badge} from "../badge";
import {Banner} from "../banner";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {Empty} from "../empty";
import {toast} from "../sonner";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../table";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";
import {TrendChart} from "../trend-chart";
import {usePersistentState} from "../use-persistent-state";
import {
	WC3_ANALYSIS_GROUP_BYS,
	WC3_ANALYSIS_METRICS,
	WC3_ANALYSIS_SEVERITIES,
	WC3_ANALYSIS_STAGES,
	WC3_ANALYSIS_WINDOWS,
	WC3_OBSERVATION_ROWS,
	WC3_WORKER_ROWS,
	type Wc3AnalysisGrain,
	type Wc3AnalysisJoinedRow,
	type Wc3AnalysisMetric,
	type Wc3AnalysisMode,
	type Wc3AnalysisRouteId,
	type Wc3AnalysisRow,
	type Wc3AnalysisSpec,
	type Wc3AnalysisStageId,
	type Wc3Materialisation,
	type Wc3SavedAnalysis,
	analysisDatasetName,
	analysisDatasetRows,
	analysisMetric,
	analysisMetricMissingInput,
	analysisWorker,
	wc3AnalysisDefaultSpec,
} from "./wc3-analysis-data";
import {Mono, type Wc3LineageNavTarget} from "./wc3-lineage-shared";
import {WC3_LINK_TYPES} from "./wc3-ontology-data";
import {WC3_PROCESS_FIXTURE_NOW, WC3_PROCESS_FIXTURE_NOW_MS} from "./wc3-process-data";
import {WC3_PERSONAS} from "./wc3-product-shared";

// The ONE module the three Analysis surfaces share — the two builder tabs (Object analysis, Data
// analysis) and the Saved analyses list. Same rule as wc3-process-shared.tsx and
// wc3-pipeline-shared.tsx: it imports nothing from them, so there is no cycle and no helper has to
// be pasted three times.
//
// It owns six things that MUST NOT be restated anywhere else:
//   · the SESSION shape (one spec + its result per builder mode, plus the saved analyses and the
//     materialisations) and every mutation of it — each one pure, session in → NEW session out,
//   · the EXECUTION ROUTING RULE (analysisRoute) — derived from the shape of the query, never faked,
//   · the RESULT COMPUTATION (analysisRun) — a scan of the seeded rows returning aggregates only,
//   · the RESULT DIAGNOSIS (analysisDiagnose), which is the one thing the prototype lacks: it only
//     handles a source with 0 rows SCANNED, never 0 rows MATCHED, so three of the four data-mode
//     sources render a blank panel that reads as a crash,
//   · every user-readable string (WC3_ANALYSIS_MESSAGES), verbatim from the prototype except where
//     the prototype states something untrue (see analysisTraversalKind) or has no state at all,
//   · the entire staged-builder shell (AnalysisWorkbench): the rail, the stage config panel, the
//     result panel, the execution-meta panel and the publish panel. Both builder tabs mount THAT ONE
//     component and differ only in the two stage bodies the prototype itself writes differently
//     (Source and Traverse / Join), so the two tabs structurally cannot drift.
//
// What is deliberately NOT here, because each has exactly one consumer: the saved list's column
// defs, card, filter categories and view toggle (saved view); the object-mode source/traverse option
// bodies (object view); the data-mode dataset picker (data view). `useDetailLabel` is deliberately
// NOT re-exported either — no Analysis surface drills in.
//
// HONESTY CONTRACT. Every number rendered by anything in this file is computed from the seeded rows
// by analysisRun. No row count, group count, timing or engine name is ever hardcoded. Where a
// control cannot change a number, the UI says so (WC3_ANALYSIS_MESSAGES.windowInert); where a metric
// has no materialised input, the UI names the missing input instead of estimating one.

// ─── Props ───────────────────────────────────────────────────────────────────

/** The engine a spec routes to, plus the verbatim justification the prototype gives. */
export type Wc3AnalysisRoute = {id: Wc3AnalysisRouteId; label: string; why: string};

/** One grouped aggregate row. `vals` is keyed by metric id; a metric that returns null shows "—". */
export type Wc3AnalysisGroup = {key: string; n: number; vals: Record<string, number | null>};

/** The result of ONE execution of ONE spec. Aggregates only — the full row set is never held. */
export type Wc3AnalysisResult = {
	groups: Wc3AnalysisGroup[];
	/** Metrics with a compute fn. */
	supported: Wc3AnalysisMetric[];
	/** Metrics whose `needs` dataset has no materialised rows. */
	blocked: Wc3AnalysisMetric[];
	/** The source dataset itself returned 0 rows. */
	sourceEmpty: boolean;
	/** Any source row carries `observed_at`. */
	sourceHasTimeColumn: boolean;
	/** Source rows + worker rows when a traversal/join runs. */
	rowsScanned: number;
	/** After window + filters. */
	rowsMatched: number;
	/** === groups.length */
	rowsReturned: number;
	/** Matched rows whose `__worker` resolved to null. */
	rowsUnlinked: number;
	/** Measured in-browser at commit time, 0.1ms resolution. */
	ms: number;
	route: Wc3AnalysisRoute;
	/** Literal — nothing on this page is estimated. */
	exact: true;
	/** WC3_PROCESS_FIXTURE_NOW. */
	asOf: string;
	/** Flipped by analysisSaveMaterialisation, reset by any spec change. */
	materialised: boolean;
	/** DECLARED, not enforced — see WC3_ANALYSIS_SCOPE. */
	scope: string;
	lineage: string[];
};

/** One builder tab's live state. The result is ALWAYS the result of the spec beside it. */
export type Wc3AnalysisModeState = {spec: Wc3AnalysisSpec; result: Wc3AnalysisResult};

/** Everything the perspective mutates in-session. Owned by the shell, never by a view. */
export type Wc3AnalysisSession = {
	object: Wc3AnalysisModeState;
	data: Wc3AnalysisModeState;
	saved: Wc3SavedAnalysis[];
	materialisations: Wc3Materialisation[];
};

export type Wc3AnalysisViewProps = {
	/** The LIVE session, owned by the workspace shell. Never read the fixture in a surface. */
	session: Wc3AnalysisSession;
	/** Commit a whole new session. Every mutation goes through this. */
	onSessionChange: (next: Wc3AnalysisSession) => void;
	/** Reports the drill-in segment for the shell's breadcrumb. No Analysis surface uses it today. */
	onDetailChange?: (label: string | null) => void;
	/** Cross-perspective / cross-tab navigation — coarse by design. */
	onNavigate?: (target: Wc3LineageNavTarget) => void;
};

// Like Wc3ProcessViewProps and Wc3PipelineViewProps and unlike Wc3ProductViewProps, the first two
// props are REQUIRED with no `= {}` default: a frozen fixture cannot back an editable perspective.

/** Why a result panel looks the way it does. Derived, never authored. */
export type Wc3AnalysisDiagnosis = "ok" | "source-empty" | "no-time-column" | "filters-excluded-all" | "all-unlinked";

/** What the workbench hands a mode-specific stage body. */
export type Wc3AnalysisStageContext = {
	spec: Wc3AnalysisSpec;
	result: Wc3AnalysisResult;
	/** Commit a spec patch: re-runs the analysis and clears `materialised`. */
	setSpec: (patch: Partial<Wc3AnalysisSpec>) => void;
};

export type Wc3AnalysisWorkbenchProps = {
	mode: Wc3AnalysisMode;
	session: Wc3AnalysisSession;
	onSessionChange: (next: Wc3AnalysisSession) => void;
	onNavigate?: (target: Wc3LineageNavTarget) => void;
	/** Source stage body — one of exactly TWO stages whose options differ per mode. */
	renderSourceConfig: (ctx: Wc3AnalysisStageContext) => ReactNode;
	/** Traverse / Join stage body — the other one. */
	renderTraverseConfig: (ctx: Wc3AnalysisStageContext) => ReactNode;
};

// ─── Strings ─────────────────────────────────────────────────────────────────

/**
 * Every user-readable string on this perspective.
 *
 * Verbatim from the prototype (06-unified-workspace.html, PageAnalysis / AnStageConfig / anRoute /
 * AnResult / AnExecMeta / AnPublish / AnSavedList) EXCEPT for four entries that are marked NEW:
 * `noTimeColumn` and `allUnlinked` close the prototype's only genuine gap (it has no state for
 * 0 rows matched), `windowInert` states a verified fact the prototype's silence hides, and the
 * object-mode traverse hint is rewritten because the prototype's version is false — see
 * {@link analysisTraversalKind}.
 */
export const WC3_ANALYSIS_MESSAGES = {
	intro: {
		object:
			"Start from an ontology object set, traverse links, add metrics, group and chart. Object identity and permissions come from the ontology throughout.",
		data: "Start from a governed dataset or event history, join, derive and aggregate. Results can be saved as a materialisation or mapped back to an object type.",
	},
	stageHint: {
		source: {
			object: "An ontology object set. Identity, permissions and valid traversals are defined by the object type.",
			data: "A governed dataset from the catalogue. Datasets declared but not materialised in this prototype return no rows and say so.",
		},
		filter: "Bounded predicates evaluated before traversal. Filters narrow the set; they never widen permissions.",
		traverse: {
			// NEW. The prototype claims "Only traversals the object type declares are offered — this is
			// the ontology acting as the semantic plane." That is false of the second option it offers:
			// WC3_LINK_TYPES declares exactly two links off ot_observation (lt_obs_reporter on
			// reported_by, lt_obs_zone on zone_id) and ZERO reference assigned_to, which is a plain
			// string property. The join still resolves, so the option stays — but it is labelled for
			// what it is rather than passed off as ontology metadata.
			object:
				"One ontology-declared link traversal and one plain property join. Each option below says which it is: only a traversal backed by a link type is the ontology acting as the semantic plane.",
			data: "A declared join between governed datasets.",
		},
		derive:
			"Metric definitions belong to the ontology, not to this chart. A metric whose input has no materialised rows is unsupported and names what is required.",
		group:
			"One hierarchy level at a time. Aggregates come back as grouped rows; the full result set is never materialised in the browser.",
		viz: "Rendering reads the same grouped aggregate the engine returned. Drilling from a bar re-queries the objects behind it.",
		publish: "Every control below either mutates session state or states plainly that it is unsupported.",
	},
	routeWhy: {
		runtime:
			"A selected metric depends on an input the ontology does not hold as current state. A bounded product job would have to read the governed event set, compute the metric, and write results back through an Action — it cannot be answered by either the object store or a scan of current objects.",
		analytical: (grouped: boolean) =>
			`A historical time window with ${grouped ? "grouped aggregation" : "a join"} is a columnar scan over fact history, not a lookup of current state. The object store holds current state and would have to reconstruct history row-by-row, so this routes to the analytical adapter which reads columns and returns pages plus aggregates.`,
		operational: (joined: boolean) =>
			`Bounded filters over current object state with ${joined ? "a single link traversal" : "no traversal"} and no historical window. The operational object store answers this directly at low latency; sending it to the analytical engine would add scan cost for no benefit.`,
	},
	/**
	 * The complete reachable routing rule, stated plainly so the panel does not oversell the thesis.
	 * The Group stage offers no "none" option (faithfully, as in the prototype), so `grouped` is true
	 * for every spec this UI can produce and the traversal choice can never move the branch.
	 */
	routeLevers:
		"The route is computed from the spec, not chosen: any metric with a declared input requirement routes to Product Runtime; otherwise a historical window routes to Analytical and current-state-only routes to Operational. Because the Group stage always sets a grouping, the traversal and group-by choices do not move this decision — the panel does not pretend otherwise.",
	blockedMetrics:
		"These need presence intervals per worker. The prototype declares badge_events_import_raw in the dataset catalogue, but it has no materialised rows, so there are no badge-in/badge-out pairs to integrate into exposure hours — and a rate has no denominator without them. Required input: badge events with fld_badge_no and fld_ts landed as a governed event set. No exposure figure is shown, estimated or interpolated.",
	sourceEmpty: (dsName: string) =>
		`The selected source is declared in the catalogue but holds no materialised rows in this prototype. Required input: a pipeline that lands ${dsName} into the object store or the analytical adapter. Nothing is estimated in its place.`,
	/** NEW — the prototype renders a blank panel here. */
	noTimeColumn: (dsName: string, window: number, scanned: number) =>
		`0 of ${scanned.toLocaleString()} rows matched. ${dsName} has no observed_at column, so the ${window}-week window excludes every row. Switch the window to “current state only” to scan current state.`,
	/** NEW — likewise. */
	filtersExcludedAll: (scanned: number) =>
		`0 of ${scanned.toLocaleString()} rows matched. The declared filters and the time window together exclude every scanned row. Nothing is widened to fill the panel.`,
	/** NEW — likewise. */
	allUnlinked: (joinKey: string) =>
		`Every matched row grouped as “— unlinked —”: grouping by contractor reads it off the joined ot_worker, and the join on ${joinKey} resolved for none of these rows.`,
	/**
	 * NEW, and verified by executing the engine: all 65 seeded observations fall between
	 * 2026-05-29 14:00 and 2026-07-22 06:55, i.e. inside even the 8-week window measured back from
	 * the 2026-07-22 08:00 fixture clock. Windows 0 / 8 / 26 / 56 all match the same rows and produce
	 * the same groups. Without this note the control reads as a broken filter.
	 */
	windowInert:
		"Changes the execution route, not the row count — every seeded row falls inside even the shortest window.",
	proofScope: (objects: number) =>
		`these timings are measured over ${objects.toLocaleString()} seeded objects in one browser tab. They demonstrate the query contract, routing rule and result lifecycle. They are not evidence of production-scale execution, and nothing here is projected to billions of rows.`,
	scopeQualifier: "declared — no row on this page is permission-filtered",
	savedEmpty:
		"Nothing saved yet. Saving keeps the spec, the execution route and the lineage together, so a result can always be traced back to the question that produced it.",
	resultFooter: (groups: number, matched: number) =>
		`${groups.toLocaleString()} groups from ${matched.toLocaleString()} matched rows. Aggregates only; the browser never holds the full set.`,
	drillThrough: (key: string, n: number) =>
		`Drill-through: ${key} — ${n.toLocaleString()} objects. Object identity is preserved from the ontology, so drilling lands on real instances.`,
	savedToast: (name: string) => `Saved analysis “${name}” with its execution route and lineage.`,
	materialisedToast: (groups: number) =>
		`Materialised ${groups.toLocaleString()} grouped rows. Execution metadata now reads Materialised rather than Live query.`,
	publish: {
		commandCentre:
			"A Command Center tile would bind to this saved analysis by reference, re-running it under the viewer's own permissions rather than caching one user's result. Save the analysis first to create that reference.",
		mapToObjectType:
			"Unsupported in this prototype. Mapping an analytical result into the ontology creates a new object type owned by a package, which is a governed package install (spec §3.2) — not a runtime write. This surface cannot author packages.",
		productRuntime:
			"Product Runtime would receive a reference to this governed result set, not a copy. It reads the set, computes, and writes back only through ontology Actions.",
		actionProposal: (key: string, n: number) =>
			`Would open a governed Action proposal scoped to ${key} (${n.toLocaleString()} objects). Write-back is an Action, never a direct table write — this is the ontology round-trip.`,
		noGroups: "No grouped rows to propose against.",
	},
} as const;

/**
 * Route → Badge variant. operational = low-latency current state, analytical = columnar scan,
 * runtime = a bounded product job that does not exist yet. Theme tokens only.
 */
export const WC3_ANALYSIS_ROUTE_VARIANT: Record<Wc3AnalysisRouteId, "successSoft" | "infoSoft" | "warningSoft"> = {
	operational: "successSoft",
	analytical: "infoSoft",
	runtime: "warningSoft",
};

/** The prototype's route labels. Kept here so a saved record's `route` string can be read back. */
const ROUTE_LABEL: Record<Wc3AnalysisRouteId, string> = {
	operational: "Operational",
	analytical: "Analytical",
	runtime: "Product Runtime",
};

/**
 * DECLARED scope, not enforced. The workspace shell has no persona switcher, so this is the default
 * lens; no row on this page is permission-filtered and the panel says so next to it.
 */
export const WC3_ANALYSIS_SCOPE = `project · Falcon Heights Medical Tower — acting as ${WC3_PERSONAS[0].name}`;

/**
 * Intra-perspective nav. Literals rather than an import of PERSPECTIVES, for the same reason
 * lineageNav uses literals: it would close the cycle workspace → registry → tabs → shared →
 * workspace. The shell guards an unknown tab id, so a rename degrades to a no-op rather than a crash.
 */
export const analysisNav = {
	object: () => ({perspectiveId: "analysis", tabId: "object"}),
	data: () => ({perspectiveId: "analysis", tabId: "data"}),
	saved: () => ({perspectiveId: "analysis", tabId: "saved"}),
} satisfies Record<string, () => Wc3LineageNavTarget>;

// ─── Execution routing ───────────────────────────────────────────────────────

/**
 * The execution engine a spec routes to. DERIVED from the shape of the query, never chosen by the
 * user and never faked — this is the architectural point of the whole perspective: one semantic
 * spec, three engines.
 *
 * Transcribed from the prototype's `anRoute`. Two things are transcribed rather than "improved":
 *   · `needsRuntime` tests the metric's DECLARED `needs`, not the OBSERVED
 *     `analysisMetricMissingInput`. Today both `needs` metrics are unmaterialised so the two agree;
 *     the rule is the prototype's and stays. Materialising badge_events_import_raw would still route
 *     to Product Runtime, which is correct — the metric is a product job either way.
 *   · `grouped` is true for every spec this UI can produce, because the Group stage offers no "none"
 *     option. So `joined` never actually moves the branch. See WC3_ANALYSIS_MESSAGES.routeLevers,
 *     which the exec-meta panel renders so the surface does not imply otherwise.
 */
export function analysisRoute(spec: Wc3AnalysisSpec): Wc3AnalysisRoute {
	const hist = spec.window > 0;
	const grouped = !!spec.groupBy;
	const joined = spec.mode === "data" ? !!spec.joinDs : !!spec.traverse;
	const needsRuntime = spec.metrics.some((id) => !!analysisMetric(id)?.needs);
	if (needsRuntime) {
		return {id: "runtime", label: ROUTE_LABEL.runtime, why: WC3_ANALYSIS_MESSAGES.routeWhy.runtime};
	}
	if (hist && (grouped || joined)) {
		return {
			id: "analytical",
			label: ROUTE_LABEL.analytical,
			why: WC3_ANALYSIS_MESSAGES.routeWhy.analytical(grouped),
		};
	}
	return {
		id: "operational",
		label: ROUTE_LABEL.operational,
		why: WC3_ANALYSIS_MESSAGES.routeWhy.operational(joined),
	};
}

// ─── Execution ───────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;

/** "2026-07-22 06:55" → epoch ms. The fixture stamps use a space, not a T. */
const parseStamp = (s: string): number => Date.parse(s.replace(" ", "T"));

/** The join key an object-mode traversal / a data-mode join actually follows, or null. */
function analysisJoinKey(spec: Wc3AnalysisSpec): string | null {
	// Data mode's key is FIXED at reported_by in the prototype — the join is declared between
	// datasets, not per source — which is exactly why a non-observation source resolves to no worker
	// at all. The data view says so next to the option rather than hiding it.
	return spec.mode === "object" ? (spec.traverse ?? null) : spec.joinDs ? "reported_by" : null;
}

const stringField = (row: Wc3AnalysisRow, field: string): string | null => {
	const v = row[field];
	return typeof v === "string" ? v : null;
};

/**
 * Runs ONE spec over the seeded rows and returns aggregates only — never a materialised full result
 * set, mirroring the prototype's ObjectSetSpec/Costed&lt;T&gt; framing.
 *
 * MUTATION HAZARD, and the reason every step below copies: `WC3_OBSERVATION_ROWS` is not a copy of
 * the observation rows, it is the SAME array object as `WC3_PROCESS_INSTANCES.ot_observation`. The
 * traversal therefore builds joined rows with `{...r, __worker}` and never assigns `r.__worker`, and
 * nothing here calls `.sort()` or `.reverse()` on a source array — only on arrays this function has
 * just created. A single in-place write would silently change the Processes instance queue and the
 * ontology instance counts, and it would not show up in this perspective's own tests.
 */
export function analysisRun(spec: Wc3AnalysisSpec): Wc3AnalysisResult {
	const t0 = performance.now();

	const source: Wc3AnalysisRow[] =
		spec.mode === "object"
			? (WC3_OBSERVATION_ROWS as unknown as Wc3AnalysisRow[])
			: analysisDatasetRows(spec.sourceDs ?? "");
	const sourceEmpty = source.length === 0;
	const sourceHasTimeColumn = source.some((r) => typeof r.observed_at === "string");
	let rowsScanned = source.length;

	// Time window — weeks back from the frozen fixture clock.
	let rows: Wc3AnalysisRow[] = source;
	if (spec.window > 0) {
		const floor = WC3_PROCESS_FIXTURE_NOW_MS - spec.window * 7 * DAY_MS;
		rows = rows.filter((r) => {
			const stamp = stringField(r, "observed_at");
			return stamp !== null && parseStamp(stamp) >= floor;
		});
	}

	// Declared filters — bounded predicates evaluated before traversal.
	for (const f of spec.filters) {
		rows = rows.filter((r) => String(r[f.field]) === String(f.value));
	}

	// Traversal / join — attach the worker, and through it the worker's contractor.
	const joinKey = analysisJoinKey(spec);
	if (joinKey) rowsScanned += WC3_WORKER_ROWS.length;
	// The cast is only about the index signature: `Wc3AnalysisRow` declares every value as
	// string | number | boolean | null, and `__worker` holds a row object. The value is a FRESH
	// object built by spreading `r` — the source row is never written to.
	const joined: Wc3AnalysisJoinedRow[] = rows.map(
		(r) =>
			({
				...r,
				__worker: joinKey ? analysisWorker(stringField(r, joinKey)) : null,
			}) as Wc3AnalysisJoinedRow,
	);
	const rowsUnlinked = joinKey ? joined.filter((r) => !r.__worker).length : 0;

	// Grouping — one hierarchy level, optionally × month.
	const keyOf = (r: Wc3AnalysisJoinedRow): string => {
		const parts: string[] = [];
		if (spec.groupBy === "contractor") parts.push(r.__worker?.contractor ?? "— unlinked —");
		if (spec.groupBy === "severity") parts.push(stringField(r, "severity_level") ?? "—");
		if (spec.groupBy === "zone") parts.push(stringField(r, "zone_id") ?? "—");
		const observedAt = stringField(r, "observed_at");
		if (spec.grain === "month" && observedAt) parts.push(observedAt.slice(0, 7));
		return parts.join(" · ");
	};
	const buckets = new Map<string, Wc3AnalysisJoinedRow[]>();
	for (const r of joined) {
		const k = keyOf(r);
		const bucket = buckets.get(k);
		if (bucket) bucket.push(r);
		else buckets.set(k, [r]);
	}

	const chosen = spec.metrics.map((id) => analysisMetric(id)).filter((m): m is Wc3AnalysisMetric => m !== undefined);
	const supported = chosen.filter((m) => analysisMetricMissingInput(m) === null);
	const blocked = chosen.filter((m) => analysisMetricMissingInput(m) !== null);

	// Sorted by key, then re-sorted by size descending — the prototype does both, and keeping both is
	// what makes ties between equally-sized groups stable rather than insertion-ordered.
	const groups: Wc3AnalysisGroup[] = [...buckets.keys()]
		.sort()
		.map((key) => {
			const bucket = buckets.get(key) ?? [];
			const vals: Record<string, number | null> = {};
			for (const m of supported) vals[m.id] = m.compute ? m.compute(bucket) : null;
			return {key, n: bucket.length, vals};
		})
		.sort((a, b) => b.n - a.n);

	const ms = Math.max(1, Math.round((performance.now() - t0) * 10) / 10);
	return {
		groups,
		supported,
		blocked,
		sourceEmpty,
		sourceHasTimeColumn,
		rowsScanned,
		rowsMatched: joined.length,
		rowsReturned: groups.length,
		rowsUnlinked,
		ms,
		route: analysisRoute(spec),
		exact: true,
		asOf: WC3_PROCESS_FIXTURE_NOW,
		materialised: false,
		scope: WC3_ANALYSIS_SCOPE,
		lineage: analysisLineage(spec),
	};
}

/**
 * The provenance chain behind a result, as the exec-meta panel prints it.
 *
 * The object-mode middle line interpolates the traversal rather than hardcoding `reported_by`, and
 * appends whether the ontology actually declares that traversal — because one of the two offered
 * options is a plain property join. See {@link analysisTraversalKind}.
 */
export function analysisLineage(spec: Wc3AnalysisSpec): string[] {
	if (spec.mode === "object") {
		const lines = ["ot_observation (seeded instances)"];
		if (spec.traverse) {
			const kind = analysisTraversalKind(spec.traverse);
			lines.push(
				kind.declared
					? `→ link ${spec.traverse} (${kind.linkTypeId} · ${kind.apiName})`
					: `→ property join ${spec.traverse} (no link type declares it)`,
				"→ ot_worker.contractor",
			);
		} else {
			lines.push("→ no traversal");
		}
		return lines;
	}
	const lines = [analysisDatasetName(spec.sourceDs ?? "")];
	if (spec.joinDs) lines.push(`⨝ ${analysisDatasetName(spec.joinDs)}`);
	return lines;
}

/**
 * Why a result panel looks the way it does — ordered, first match wins.
 *
 * This is the fix for the prototype's only genuine gap: `AnResult` handles 0 rows SCANNED but not
 * 0 rows MATCHED, so data mode on ds_workers or ds_activities currently renders a blank result that
 * reads as a bug. Verified: at the shipped default window of 56 weeks, ds_workers scans 290 and
 * matches 0, ds_activities scans 230 and matches 0 — neither row table carries an observed_at
 * column. Drop the window to 0 and ds_workers matches every row but produces ONE group,
 * "— unlinked —", because the data-mode join key is fixed at reported_by.
 */
export function analysisDiagnose(spec: Wc3AnalysisSpec, res: Wc3AnalysisResult): Wc3AnalysisDiagnosis {
	if (res.sourceEmpty) return "source-empty";
	if (res.rowsMatched === 0 && spec.window > 0 && !res.sourceHasTimeColumn) return "no-time-column";
	if (res.rowsMatched === 0) return "filters-excluded-all";
	// Only when EVERY matched row is unlinked. Selecting the assigned_to property join leaves a large
	// but partial unlinked bucket (21 of 65 observations have no assignee), which is truthful and
	// must not trip this diagnosis.
	if (spec.groupBy === "contractor" && res.rowsMatched > 0 && res.rowsUnlinked === res.rowsMatched) {
		return "all-unlinked";
	}
	return "ok";
}

/**
 * Honest label for an object-mode traversal: is it an ontology-declared link, or a plain FK column
 * the ontology says nothing about?
 *
 * The prototype offers `reported_by → ot_worker` and `assigned_to → ot_worker` under the hint "Only
 * traversals the object type declares are offered". Verified against WC3_LINK_TYPES: ot_observation
 * declares exactly TWO links — lt_obs_reporter (fkProperty reported_by, apiName reportedBy) and
 * lt_obs_zone (fkProperty zone_id). ZERO link types reference assigned_to; it is the plain string
 * property p_assigned_to_139. The join resolves for all 44 non-null values, so the option is worth
 * keeping — but it is not the ontology acting as the semantic plane, and the UI must not say it is.
 *
 * Note the spec field is the raw FK COLUMN (`reported_by`), not the link apiName (`reportedBy`);
 * this maps one to the other so a label can cite the link type without changing the spec vocabulary.
 */
export function analysisTraversalKind(
	fkProperty: string,
): {declared: true; linkTypeId: string; apiName: string} | {declared: false} {
	const lt = WC3_LINK_TYPES.find(
		(l) => l.backing.fkObjectTypeId === "ot_observation" && l.backing.fkProperty === fkProperty,
	);
	return lt ? {declared: true, linkTypeId: lt.id, apiName: lt.sideA.apiName} : {declared: false};
}

/**
 * The three lines the rail prints per stage — label (from WC3_ANALYSIS_STAGES), a description of
 * what the spec says, and a count of what the run produced. Transcribed from `AnStageRail`, and
 * derivable in full for BOTH modes.
 *
 * `bad` flags a stage that is the reason the result is degenerate: the prototype flags derive when a
 * metric is unsupported and source when it holds no rows; the filter flag is added here because when
 * a source has no time column it is the WINDOW that excluded every row, and the rail should point at
 * the stage that did it.
 *
 * The `publish` entry cannot count saved analyses — that lives on the session, and this function is
 * pure over (spec, result). The workbench fills the count in.
 */
export function analysisStageSummary(
	spec: Wc3AnalysisSpec,
	res: Wc3AnalysisResult,
): Record<Wc3AnalysisStageId, {desc: string; count: string; bad: boolean}> {
	const diagnosis = analysisDiagnose(spec, res);
	const joinKey = analysisJoinKey(spec);
	const metricCount = `${spec.metrics.length} metric${spec.metrics.length === 1 ? "" : "s"}`;
	return {
		source: {
			desc: spec.mode === "object" ? "ot_observation" : analysisDatasetName(spec.sourceDs ?? ""),
			count: res.sourceEmpty ? "0 rows — not materialised" : `${res.rowsScanned.toLocaleString()} scanned`,
			bad: res.sourceEmpty,
		},
		filter: {
			desc: spec.filters.length ? spec.filters.map((f) => `${f.field}=${f.value}`).join(", ") : "none",
			count: `${res.rowsMatched.toLocaleString()} matched`,
			bad: diagnosis === "no-time-column",
		},
		traverse: {
			desc:
				spec.mode === "object"
					? spec.traverse
						? `→ ot_worker via ${spec.traverse}`
						: "none"
					: spec.joinDs
						? `⨝ ${analysisDatasetName(spec.joinDs)}`
						: "none",
			// The prototype prints "—" for data mode even when a join runs; the join is real in both
			// modes, so the count follows the effective join key instead of the mode.
			count: joinKey ? "joined ot_worker" : "—",
			bad: false,
		},
		derive: {
			desc: metricCount,
			count: res.blocked.length ? `${res.blocked.length} unsupported` : `${res.supported.length} computed`,
			bad: res.blocked.length > 0,
		},
		group: {
			desc: `${spec.groupBy ?? "none"}${spec.grain === "month" ? " × month" : ""}`,
			count: `${res.rowsReturned.toLocaleString()} groups`,
			bad: false,
		},
		viz: {desc: spec.viz, count: res.groups.length ? "ready" : "no rows", bad: false},
		publish: {desc: spec.name, count: "—", bad: false},
	};
}

// ─── Mutations ───────────────────────────────────────────────────────────────

// Every helper below is PURE: session in → NEW session out, never an in-place write.
//
// THE INVARIANT these keep, and which TypeScript cannot enforce: `state.result` is always
// `analysisRun(state.spec)` as of the last commit. It holds ONLY because analysisSetSpec /
// analysisResetSpec / analysisReopen are the sole writers of a spec. A surface that builds
// `{...session, object: {...session.object, spec: next}}` by hand type-checks perfectly and
// desynchronises the exec-meta panel from the query with no error anywhere. Do not do that.

const cloneSpec = (spec: Wc3AnalysisSpec): Wc3AnalysisSpec => ({
	...spec,
	filters: spec.filters.map((f) => ({...f})),
	metrics: [...spec.metrics],
});

/** Replace one mode's slot without a computed key, so the session type stays exact. */
const withMode = (s: Wc3AnalysisSession, mode: Wc3AnalysisMode, state: Wc3AnalysisModeState): Wc3AnalysisSession =>
	mode === "object" ? {...s, object: state} : {...s, data: state};

/** One builder tab's live spec + result. */
export function analysisModeState(s: Wc3AnalysisSession, mode: Wc3AnalysisMode): Wc3AnalysisModeState {
	return mode === "object" ? s.object : s.data;
}

/**
 * The ONE way a spec changes. Re-runs the analysis, so the stored result is never stale, and drops
 * `materialised` — a materialisation is a fact about one executed spec, not about the builder.
 */
export function analysisSetSpec(
	s: Wc3AnalysisSession,
	mode: Wc3AnalysisMode,
	patch: Partial<Wc3AnalysisSpec>,
): Wc3AnalysisSession {
	const next = {...analysisModeState(s, mode).spec, ...patch};
	return withMode(s, mode, {spec: next, result: analysisRun(next)});
}

/**
 * Back to the mode's default spec.
 *
 * The prototype resets on every MODE SWITCH, destroying the other mode's half-built query. Here the
 * two modes are two tabs and both stay alive, so the reset is offered explicitly instead — reachable
 * but never accidental. Documented divergence.
 */
export function analysisResetSpec(s: Wc3AnalysisSession, mode: Wc3AnalysisMode): Wc3AnalysisSession {
	const next = wc3AnalysisDefaultSpec(mode);
	return withMode(s, mode, {spec: next, result: analysisRun(next)});
}

/**
 * Save the spec together with the route, the counts and the timing AS EXECUTED — which is why the
 * result is stored beside its spec rather than re-derived: `ms` is a measurement, not a property of
 * the spec, and a saved record must agree with what the panel showed when Save was pressed.
 */
export function analysisSaveAnalysis(s: Wc3AnalysisSession, mode: Wc3AnalysisMode): Wc3AnalysisSession {
	const {spec, result} = analysisModeState(s, mode);
	const saved: Wc3SavedAnalysis = {
		id: `AN-${s.saved.length + 1}`,
		name: spec.name,
		// Deep-cloned so a later edit to the live spec cannot rewrite history.
		spec: cloneSpec(spec),
		route: result.route.label,
		rows: result.rowsMatched,
		groups: result.rowsReturned,
		ms: result.ms,
		at: WC3_PROCESS_FIXTURE_NOW,
	};
	return {...s, saved: [...s.saved, saved]};
}

/** The one mutation that writes a result without touching its spec: it flips `materialised`. */
export function analysisSaveMaterialisation(s: Wc3AnalysisSession, mode: Wc3AnalysisMode): Wc3AnalysisSession {
	const {spec, result} = analysisModeState(s, mode);
	const mat: Wc3Materialisation = {
		id: `MAT-${s.materialisations.length + 1}`,
		name: `${spec.name} (materialised)`,
		groups: result.rowsReturned,
		at: WC3_PROCESS_FIXTURE_NOW,
		route: result.route.label,
	};
	const next = withMode(s, mode, {spec, result: {...result, materialised: true}});
	return {...next, materialisations: [...s.materialisations, mat]};
}

export function analysisDeleteSaved(s: Wc3AnalysisSession, id: string): Wc3AnalysisSession {
	return {...s, saved: s.saved.filter((a) => a.id !== id)};
}

export function analysisDeleteMaterialisation(s: Wc3AnalysisSession, id: string): Wc3AnalysisSession {
	return {...s, materialisations: s.materialisations.filter((m) => m.id !== id)};
}

/** Re-open a saved analysis into ITS OWN mode's slot and re-run it. */
export function analysisReopen(s: Wc3AnalysisSession, saved: Wc3SavedAnalysis): Wc3AnalysisSession {
	const spec = cloneSpec(saved.spec);
	return withMode(s, spec.mode, {spec, result: analysisRun(spec)});
}

// ─── Inline components ───────────────────────────────────────────────────────

/**
 * One option in a stage config body — the prototype's `.an-opt`.
 *
 * NEVER `disabled` when `unavailable`: selecting the unmaterialised dataset and the unsupported
 * metric is precisely how this page demonstrates the "not materialised" and "Product Runtime"
 * states. A disabled control would hide the two honesty demos the perspective exists to show.
 *
 * An unavailable option keeps the outline variant even when selected, because the amber text a
 * `default` (primary-filled) button would carry is unreadable on a primary background; selection is
 * signalled with a tinted background and a ring instead.
 */
export function AnalysisOption({
	selected,
	unavailable,
	onSelect,
	children,
	hint,
}: {
	selected: boolean;
	unavailable?: boolean;
	onSelect: () => void;
	children: ReactNode;
	/**
	 * Detail about this option. A native title rather than a paragraph under the chip: the stage
	 * panels were stacking one explanatory sentence PER OPTION, which is what made the rail scroll.
	 * Native title also avoids HoverTooltip's asChild ref requirement on a plain function component.
	 */
	hint?: string;
}): ReactElement {
	return (
		<Button
			type="button"
			size="sm"
			title={hint}
			variant={selected && !unavailable ? "default" : "outline"}
			onClick={onSelect}
			aria-pressed={selected}
			className={cn(
				"wwc:mr-1.5 wwc:mb-1.5",
				unavailable && "wwc:border-amber-600/40 wwc:text-amber-700 wwc:dark:text-amber-400",
				selected && unavailable && "wwc:bg-amber-500/10 wwc:ring-1 wwc:ring-amber-600/40",
			)}
		>
			{children}
		</Button>
	);
}

/** The execution route as a Badge. Two consumers: the exec-meta panel and the saved list. */
export function AnalysisRouteBadge({route}: {route: Wc3AnalysisRoute | string}): ReactElement {
	// A saved record stores the route's LABEL, not its id, so a string is read back through the
	// label table rather than guessed at.
	const label = typeof route === "string" ? route : route.label;
	const id =
		typeof route === "string"
			? ((Object.keys(ROUTE_LABEL) as Wc3AnalysisRouteId[]).find((k) => ROUTE_LABEL[k] === label) ?? "operational")
			: route.id;
	return <Badge variant={WC3_ANALYSIS_ROUTE_VARIANT[id]}>{label}</Badge>;
}

/**
 * A spec rendered as labelled key/value pairs. Two consumers: the publish stage and the saved
 * cards/table — which is what lets the saved list's card be LOSSLESS against its row.
 */
export function AnalysisSpecSummary({spec, dense}: {spec: Wc3AnalysisSpec; dense?: boolean}): ReactElement {
	// Plain strings plus a `mono` flag rather than inline JSX values — an array literal holding JSX
	// trips react/jsx-key even though the wrapper below is the keyed element.
	const rows: {label: string; value: string; mono?: boolean}[] = [
		{label: "Mode", value: spec.mode === "object" ? "Object analysis" : "Data analysis"},
		{
			label: "Source",
			value: spec.mode === "object" ? (spec.sourceType ?? "—") : analysisDatasetName(spec.sourceDs ?? ""),
			mono: true,
		},
		{
			label: "Filters",
			value: spec.filters.length ? spec.filters.map((f) => `${f.field} = ${f.value}`).join(", ") : "none",
		},
		{
			label: spec.mode === "object" ? "Traverse" : "Join",
			value:
				spec.mode === "object"
					? spec.traverse
						? `${spec.traverse} → ot_worker`
						: "no traversal"
					: spec.joinDs
						? `⨝ ${analysisDatasetName(spec.joinDs)} on reported_by = worker_id`
						: "no join",
		},
		{
			label: "Metrics",
			value: spec.metrics.length ? spec.metrics.map((id) => analysisMetric(id)?.label ?? id).join(", ") : "none",
		},
		{label: "Group", value: `${spec.groupBy ?? "none"}${spec.grain === "month" ? " × month" : ""}`},
		{label: "Window", value: spec.window === 0 ? "current state only" : `${spec.window} weeks`},
		{label: "Chart", value: spec.viz},
	];
	return (
		<dl
			className={cn(
				"wwc:grid wwc:grid-cols-[minmax(0,7rem)_minmax(0,1fr)] wwc:text-sm",
				dense ? "wwc:gap-x-3 wwc:gap-y-0.5 wwc:text-xs" : "wwc:gap-x-4 wwc:gap-y-1",
			)}
		>
			{rows.map((row) => (
				<div key={row.label} className="wwc:contents">
					<dt className="wwc:truncate wwc:text-muted-foreground">{row.label}</dt>
					<dd className="wwc:min-w-0 wwc:break-words wwc:text-foreground">
						{row.mono ? <Mono>{row.value}</Mono> : row.value}
					</dd>
				</div>
			))}
		</dl>
	);
}

// ─── The staged builder ──────────────────────────────────────────────────────

/**
 * The horizontal bar option for a grouped result.
 *
 * No hardcoded hex: the series colour comes from TrendChart's `seriesThemes`. ECharts draws a
 * category axis bottom-up, so the already size-sorted groups are reversed to put the largest at the
 * top of the chart.
 *
 * DOCUMENTED DIVERGENCE: the prototype caps the chart at 14 bars and the table at 20 rows. Those
 * caps were a CSS-bar limitation, not a data one — the widest grouping this fixture can produce is
 * zone × month at 24 groups — so every group is charted and every group is tabled, and the height
 * grows with the group count instead.
 */
function horizontalBarOption(groups: Wc3AnalysisGroup[]): EChartsOption {
	const ordered = [...groups].reverse();
	return {
		grid: {left: 148, right: 24, top: 8, bottom: 28, containLabel: false},
		tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
		xAxis: {type: "value", splitLine: {lineStyle: {type: "dashed"}}},
		yAxis: {type: "category", data: ordered.map((g) => g.key), axisTick: {show: false}},
		series: [{type: "bar", data: ordered.map((g) => g.n), barWidth: 12, itemStyle: {borderRadius: 3}}],
	};
}

function MetaRow({label, children}: {label: string; children: ReactNode}): ReactElement {
	return (
		<div className="wwc:contents">
			<dt className="wwc:text-muted-foreground">{label}</dt>
			<dd className="wwc:min-w-0 wwc:break-words wwc:text-foreground">{children}</dd>
		</div>
	);
}

/** A persistent explanatory panel raised by the publish stage or the drill-through button. */
type WorkbenchNote = {variant: "info" | "warning"; title: string; description: string};

/**
 * THE STAGED BUILDER. Both builder tabs mount this one component and pass exactly two stage bodies —
 * Source and Traverse / Join, the only two the prototype itself writes differently per mode. The
 * rail, Filter, Derive, Group, Visualize, Publish, the result panel and the execution-meta panel are
 * one implementation, which is the reason the two tabs cannot drift.
 */
export function AnalysisWorkbench({
	mode,
	session,
	onSessionChange,
	onNavigate,
	renderSourceConfig,
	renderTraverseConfig,
}: Wc3AnalysisWorkbenchProps): ReactElement {
	// Persisted per mode, so the two builders keep their own place in the rail across a reload.
	// An ARRAY, and type="multiple" below: every stage opens and closes independently, so comparing
	// two stages side by side no longer means losing the one you were reading. Opening the first
	// stage by default keeps the rail from starting as six blank rows.
	const [openStages, setOpenStages] = usePersistentState<string[]>(`wc3.analysis.${mode}.stages`, ["source"]);
	const [note, setNote] = useState<WorkbenchNote | null>(null);
	// The run is now EXPLICIT. `result` is still derived from the spec on every keystroke (it is cheap
	// and the stage summaries need it), but the right-hand side stays closed until the user asks for
	// it — and `ranSpec` records WHICH spec produced what is on screen, so editing a stage afterwards
	// marks the result stale instead of silently swapping the numbers under the reader.
	const [ranSpec, setRanSpec] = usePersistentState<string | null>(`wc3.analysis.${mode}.ran`, null);

	const {spec, result} = analysisModeState(session, mode);
	const setSpec = (patch: Partial<Wc3AnalysisSpec>) => {
		setNote(null);
		onSessionChange(analysisSetSpec(session, mode, patch));
	};

	// Dangling-id guard: the stage id survives a reload in localStorage while WC3_ANALYSIS_STAGES
	// could be renamed under it. An unknown id resolves to the first stage rather than rendering an
	// empty config card.

	const rail = analysisStageSummary(spec, result);
	const diagnosis = analysisDiagnose(spec, result);
	const joinKey = analysisJoinKey(spec);
	const ctx: Wc3AnalysisStageContext = {spec, result, setSpec};

	// Config stages only: "publish" is not something you configure, it is what you do to a result.
	// "publish" is not configuration (it is what you do to a result), and "viz" is already a toggle in
	// the result header — a second control for the same value in the rail would just be two places to
	// change one thing.
	const configStages = WC3_ANALYSIS_STAGES.filter((s) => s.id !== "publish" && s.id !== "viz");
	const specToken = JSON.stringify(spec);
	// Reset has nothing to do when the spec is already default and nothing has been run.
	const defaultToken = JSON.stringify(wc3AnalysisDefaultSpec(mode));
	const hasRun = ranSpec !== null;
	const stale = hasRun && ranSpec !== specToken;

	const vizToggle = (
		<ToggleGroup
			type="single"
			value={spec.viz}
			// Radix emits "" when the active item is pressed again; a segmented control has no
			// "neither" state, so that is swallowed.
			onValueChange={(next) => {
				if (next === "bar" || next === "table") setSpec({viz: next});
			}}
			variant="outline"
			size="sm"
		>
			<ToggleGroupItem value="bar" aria-label="Bar chart" title="Bar chart">
				<BarChart3 className="wwc:h-3.5 wwc:w-3.5" />
			</ToggleGroupItem>
			<ToggleGroupItem value="table" aria-label="Table" title="Table">
				<Table2 className="wwc:h-3.5 wwc:w-3.5" />
			</ToggleGroupItem>
		</ToggleGroup>
	);

	const groupLabel = `${spec.groupBy ?? "group"}${spec.grain === "month" ? " · month" : ""}`;

	const stageBody = (id: Wc3AnalysisStageId): ReactNode => {
		switch (id) {
			case "source":
				return <div>{renderSourceConfig(ctx)}</div>;
			case "filter":
				return (
					<div>
						<div className="wwc:flex wwc:flex-wrap">
							{WC3_ANALYSIS_SEVERITIES.map((sev) => {
								const on = spec.filters.some((f) => f.value === sev);
								return (
									<AnalysisOption
										key={sev}
										selected={on}
										onSelect={() =>
											setSpec({
												filters: on
													? spec.filters.filter((f) => f.value !== sev)
													: [...spec.filters, {field: "severity_level", value: sev}],
											})
										}
									>
										severity = {sev}
									</AnalysisOption>
								);
							})}
						</div>
						<p className="wwc:mt-2 wwc:text-xs wwc:font-medium wwc:text-foreground">Window</p>
						<div className="wwc:mt-1 wwc:flex wwc:flex-wrap">
							{[...WC3_ANALYSIS_WINDOWS, 0].map((w) => {
								// The route each window would produce, computed by the same rule the engine
								// uses — never a label typed into the markup.
								const preview = analysisRoute({...spec, window: w});
								return (
									<AnalysisOption key={w} selected={spec.window === w} onSelect={() => setSpec({window: w})}>
										{w === 0 ? "current state only" : `${w} weeks`}
										<span className="wwc:opacity-70">· {preview.label}</span>
									</AnalysisOption>
								);
							})}
						</div>
						<p className="wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">{WC3_ANALYSIS_MESSAGES.windowInert}</p>
					</div>
				);
			case "traverse":
				return renderTraverseConfig(ctx);
			case "derive":
				return (
					<div className="wwc:flex wwc:flex-wrap">
						{WC3_ANALYSIS_METRICS.map((m) => {
							const missing = analysisMetricMissingInput(m);
							const on = spec.metrics.includes(m.id);
							return (
								<AnalysisOption
									key={m.id}
									selected={on}
									unavailable={missing !== null}
									onSelect={() =>
										setSpec({
											metrics: on ? spec.metrics.filter((x) => x !== m.id) : [...spec.metrics, m.id],
										})
									}
								>
									{m.label}
									{missing !== null ? <span className="wwc:opacity-70">· unavailable</span> : null}
								</AnalysisOption>
							);
						})}
					</div>
				);
			case "group":
				return (
					<div>
						<div className="wwc:flex wwc:flex-wrap">
							{WC3_ANALYSIS_GROUP_BYS.map((g) => (
								<AnalysisOption key={g} selected={spec.groupBy === g} onSelect={() => setSpec({groupBy: g})}>
									by {g}
								</AnalysisOption>
							))}
						</div>
						<div className="wwc:mt-1 wwc:flex wwc:flex-wrap">
							<AnalysisOption
								selected={spec.grain === "month"}
								onSelect={() => setSpec({grain: (spec.grain === "month" ? null : "month") as Wc3AnalysisGrain})}
							>
								× month
							</AnalysisOption>
						</div>
					</div>
				);
			case "viz":
				return (
					<div className="wwc:flex wwc:flex-wrap">
						{(["bar", "table"] as const).map((v) => (
							<AnalysisOption key={v} selected={spec.viz === v} onSelect={() => setSpec({viz: v})}>
								{v}
							</AnalysisOption>
						))}
					</div>
				);
		}
	};

	// The prototype's publish STAGE, lifted out of the rail: these are things you do to a RESULT, so
	// they belong beside it and only exist once an analysis has actually been run.
	// The prototype's publish STAGE, lifted out of the rail: these are things you do to a RESULT, so
	// they belong beside it and only exist once an analysis has actually been run.
	//
	// ONE ROW by design: the six labelled buttons wrapped onto a second line, which made this footer
	// taller than the rail's run-button footer and broke the symmetry between the two panels. The
	// primary action stays visible; the rest live behind "More", so the footer height is fixed
	// regardless of how many actions or how long their labels get.
	const publishActions = (
		<div className="wwc:flex wwc:items-center wwc:gap-1.5">
			<Button
				type="button"
				size="sm"
				onClick={() => {
					onSessionChange(analysisSaveAnalysis(session, mode));
					toast.success(WC3_ANALYSIS_MESSAGES.savedToast(spec.name));
				}}
			>
				Save analysis
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button type="button" size="sm" variant="outline">
						More
						<ChevronDown className="wwc:h-3.5 wwc:w-3.5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="wwc:w-64">
					<DropdownMenuItem
						onSelect={() => {
							onSessionChange(analysisSaveMaterialisation(session, mode));
							toast.success(WC3_ANALYSIS_MESSAGES.materialisedToast(result.rowsReturned));
						}}
					>
						Save as materialisation
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							return setNote({
								variant: "info",
								title: "Add to Command Center",
								description: WC3_ANALYSIS_MESSAGES.publish.commandCentre,
							});
						}}
					>
						Add to Command Center
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							return setNote({
								variant: "warning",
								title: "Map result to an Object Type",
								description: WC3_ANALYSIS_MESSAGES.publish.mapToObjectType,
							});
						}}
					>
						Map result to an Object Type
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							return setNote({
								variant: "info",
								title: "Feed to Product Runtime",
								description: WC3_ANALYSIS_MESSAGES.publish.productRuntime,
							});
						}}
					>
						Feed to Product Runtime
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							const top = result.groups[0];
							setNote(
								top
									? {
											variant: "info",
											title: "Create Action proposal",
											description: WC3_ANALYSIS_MESSAGES.publish.actionProposal(top.key, top.n),
										}
									: {
											variant: "warning",
											title: "Create Action proposal",
											description: WC3_ANALYSIS_MESSAGES.publish.noGroups,
										},
							);
						}}
					>
						Create Action proposal
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);

	const resultBody = (): ReactNode => {
		if (diagnosis === "source-empty") {
			return (
				<Banner
					variant="warning"
					title="No rows to analyse."
					description={WC3_ANALYSIS_MESSAGES.sourceEmpty(analysisDatasetName(spec.sourceDs ?? ""))}
				/>
			);
		}
		if (diagnosis === "no-time-column") {
			return (
				<Banner
					variant="warning"
					title="0 rows matched — this dataset has no time column."
					description={WC3_ANALYSIS_MESSAGES.noTimeColumn(
						analysisDatasetName(spec.sourceDs ?? ""),
						spec.window,
						result.rowsScanned,
					)}
				/>
			);
		}
		if (diagnosis === "filters-excluded-all") {
			return (
				<Banner
					variant="warning"
					title="0 rows matched."
					description={WC3_ANALYSIS_MESSAGES.filtersExcludedAll(result.rowsScanned)}
				/>
			);
		}
		if (diagnosis === "all-unlinked") {
			return (
				<Banner
					variant="warning"
					title="Every matched row is unlinked."
					description={WC3_ANALYSIS_MESSAGES.allUnlinked(joinKey ?? "no join key")}
				/>
			);
		}
		if (spec.viz === "bar") {
			return (
				<TrendChart
					title={`Grouped by ${groupLabel}`}
					actions={vizToggle}
					value={`${result.rowsMatched.toLocaleString()} rows`}
					option={horizontalBarOption(result.groups)}
					seriesThemes={[{tone: "primary"}]}
					height={Math.max(240, result.groups.length * 24 + 64)}
				/>
			);
		}
		return (
			<div>
				<div className="wwc:mb-2 wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
					<span className="wwc:text-sm wwc:font-medium">Grouped by {groupLabel}</span>
					{vizToggle}
				</div>
				<div className="wwc:overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{groupLabel}</TableHead>
								{result.supported.map((m) => (
									<TableHead key={m.id} className="wwc:text-right">
										{m.label}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{result.groups.map((g) => (
								<TableRow key={g.key}>
									<TableCell>{g.key}</TableCell>
									{result.supported.map((m) => (
										<TableCell key={m.id} className="wwc:text-right wwc:tabular-nums">
											{g.vals[m.id] === null || g.vals[m.id] === undefined ? "—" : g.vals[m.id]?.toLocaleString()}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		);
	};

	return (
		/*
		 * Deliberately NOT the shared Pane: Pane is the page-level scroller, which would let the left
		 * rail grow with its content and push "Run analysis" below the fold. This owns the height and
		 * lets each column scroll inside itself, so the run button stays pinned to the bottom of the rail.
		 * Same gutters as Pane (px-6 / pt-4 / pb-6).
		 */
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-4 wwc:overflow-hidden wwc:px-6 wwc:pb-6 wwc:pt-4">
			{/* No in-content <h1> and no intro paragraph — the perspective tab bar is the header, and on a
			    full-height two-pane workbench every line above the panels is height taken from the result.
			    WC3_ANALYSIS_MESSAGES.intro is still exported; nothing here renders it. */}
			{/*
			 * Two columns: a narrow CONFIG rail on the left, the result on the right. minmax(0,1fr) is
			 * load-bearing on the right track — an ECharts canvas lives there and a plain `1fr` cannot
			 * shrink below its content, which forces horizontal page scroll on narrow viewports.
			 */}
			<div className="wwc:grid wwc:min-h-0 wwc:min-w-0 wwc:flex-1 wwc:gap-4 wwc:xl:grid-cols-[21rem_minmax(0,1fr)]">
				{/* ── Left: the stages, collapsed — scrolls, with the run button pinned beneath ── */}
				{/* One surface for the whole rail — the stages and the pinned run button read as a single
				    panel rather than a floating list. bg-card, not a literal white, so dark mode follows. */}
				<div className="wwc:flex wwc:min-h-0 wwc:min-w-0 wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:text-card-foreground">
					<div className="wwc:flex wwc:min-h-0 wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:gap-3 wwc:overflow-y-auto wwc:overflow-x-hidden wwc:p-3">
						<Accordion
							type="multiple"
							value={openStages}
							onValueChange={setOpenStages}
							className="wwc:-mx-3 wwc:-mt-3 wwc:min-w-0"
						>
							{configStages.map((s) => {
								const cell = rail[s.id];
								return (
									<AccordionItem key={s.id} value={s.id} className="wwc:px-3 wwc:last:border-b-0">
										<AccordionTrigger className="wwc:py-2.5 wwc:hover:no-underline">
											<span className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:items-start wwc:gap-0.5 wwc:pr-2 wwc:text-left">
												<span className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs wwc:font-semibold">
													{s.label}
													{cell.bad ? <AlertTriangle className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" /> : null}
												</span>
												{/* The collapsed row still has to say what the stage is set to, or closing it
											    hides the whole query. */}
												<span className="wwc:w-full wwc:truncate wwc:text-xs wwc:font-normal wwc:text-muted-foreground">
													{cell.desc}
												</span>
											</span>
										</AccordionTrigger>
										<AccordionContent className="wwc:pb-3">{stageBody(s.id)}</AccordionContent>
									</AccordionItem>
								);
							})}
						</Accordion>

						{note ? (
							<Banner
								variant={note.variant}
								title={note.title}
								description={note.description}
								onDismiss={() => setNote(null)}
							/>
						) : null}
					</div>

					{/* Pinned: shrink-0 keeps it out of the scroll area, so it is reachable however long
					    the expanded stages get. The top border separates it from the scrolling list. */}
					<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2 wwc:border-t wwc:border-border wwc:p-3">
						<Button
							type="button"
							className="wwc:flex-1"
							onClick={() => {
								setNote(null);
								setRanSpec(specToken);
							}}
						>
							<Play className="wwc:h-4 wwc:w-4" />
							{hasRun ? "Run analysis again" : "Run analysis"}
						</Button>
						{/* Back to the true start point: default spec AND no result. Clearing `ranSpec` is what
						    returns the right-hand side to its empty state — resetting the spec alone would leave
						    the previous result on screen, which is the opposite of a reset. */}
						<Button
							type="button"
							variant="outline"
							icon
							aria-label="Reset analysis"
							tooltip="Reset to the starting point"
							disabled={!hasRun && specToken === defaultToken}
							onClick={() => {
								setNote(null);
								setRanSpec(null);
								onSessionChange(analysisResetSpec(session, mode));
							}}
						>
							<RotateCcw className="wwc:h-4 wwc:w-4" />
						</Button>
					</div>
				</div>

				{/* ── Right: result (large) BESIDE the execution summary (narrow) ── */}
				<div className="wwc:flex wwc:min-h-0 wwc:min-w-0 wwc:flex-col wwc:gap-4 wwc:overflow-hidden">
					{!hasRun ? (
						<Card className="wwc:flex wwc:min-h-[24rem] wwc:flex-1 wwc:items-center wwc:justify-center">
							<Empty
								icon={<Play className="wwc:h-6 wwc:w-6" />}
								title="No analysis run yet"
								description="Set the stages on the left — source, filter, traversal, metrics, grouping — then run the analysis to see its result and how it executed."
							/>
						</Card>
					) : (
						/* Result and Execution sit SIDE BY SIDE — the result takes the elastic track and the
						   execution summary a fixed narrow one, so the chart gets the width and the metadata
						   reads as a sidebar rather than something buried below a tall chart. */
						<div className="wwc:grid wwc:min-h-0 wwc:min-w-0 wwc:flex-1 wwc:gap-4 wwc:overflow-hidden wwc:xl:grid-cols-[minmax(0,1fr)_19rem]">
							{/* Mirrors the left rail: ONE panel whose body scrolls and whose actions are pinned. */}
							<div className="wwc:flex wwc:min-h-0 wwc:min-w-0 wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:text-card-foreground">
								<div className="wwc:flex wwc:min-h-0 wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:overflow-auto">
									<CardHeader className="wwc:gap-1 wwc:p-3">
										<CardTitle className="wwc:text-sm">Result</CardTitle>
										<p className="wwc:text-sm wwc:text-muted-foreground">
											{WC3_ANALYSIS_MESSAGES.resultFooter(result.rowsReturned, result.rowsMatched)}
										</p>
									</CardHeader>
									<CardContent className="wwc:min-w-0 wwc:flex-1 wwc:space-y-3 wwc:p-3 wwc:pt-0">
										{/* Editing a stage after a run does not silently repaint the numbers — it says so. */}
										{stale ? (
											<Banner
												variant="warning"
												title="Configuration changed since this ran"
												description="The result below is from the previous configuration. Run the analysis again to refresh it."
											/>
										) : null}
										{result.blocked.length > 0 ? (
											<Banner
												variant="warning"
												title={`${result.blocked.length} metric${result.blocked.length === 1 ? "" : "s"} cannot be computed`}
												description={WC3_ANALYSIS_MESSAGES.blockedMetrics}
												items={result.blocked.map((m) => m.label)}
											/>
										) : null}
										{resultBody()}
									</CardContent>
								</div>

								{/* Post-run actions, pinned exactly like the rail's run button: shrink-0 keeps them out of
								    the scroll area so they stay reachable however tall the chart gets. */}
								<div className="wwc:shrink-0 wwc:border-t wwc:border-border wwc:p-3">{publishActions}</div>
							</div>

							{/* ── Execution summary: the narrow track beside the result ── */}
							<Card className="wwc:min-h-0 wwc:min-w-0 wwc:overflow-auto">
								<CardHeader className="wwc:p-3">
									<CardTitle className="wwc:text-sm">Execution</CardTitle>
								</CardHeader>
								<CardContent className="wwc:space-y-3 wwc:p-3 wwc:pt-0">
									<dl className="wwc:grid wwc:grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] wwc:gap-x-3 wwc:gap-y-1.5 wwc:text-xs">
										<MetaRow label="Route">
											<AnalysisRouteBadge route={result.route} />
										</MetaRow>
										<MetaRow label="Rows scanned">{result.rowsScanned.toLocaleString()}</MetaRow>
										<MetaRow label="Rows returned">{result.rowsReturned.toLocaleString()} groups</MetaRow>
										<MetaRow label="Time">
											{result.ms} ms <span className="wwc:text-muted-foreground">measured, in-browser</span>
										</MetaRow>
										<MetaRow label="Result">{result.exact ? "Exact" : "Estimated"}</MetaRow>
										<MetaRow label="As of">{result.asOf}</MetaRow>
										<MetaRow label="Storage">{result.materialised ? "Materialised" : "Live query"}</MetaRow>
										<MetaRow label="Scope">
											{result.scope}{" "}
											<span className="wwc:text-muted-foreground">({WC3_ANALYSIS_MESSAGES.scopeQualifier})</span>
										</MetaRow>
										<MetaRow label="Lineage">
											{result.lineage.map((line) => (
												<span key={line} className="wwc:block wwc:font-mono wwc:text-[11px]">
													{line}
												</span>
											))}
										</MetaRow>
									</dl>

									<div className="wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/40 wwc:p-2 wwc:text-xs wwc:text-muted-foreground">
										<span className="wwc:font-semibold wwc:text-foreground">Why this engine:</span> {result.route.why}
										<p className="wwc:mt-1.5">{WC3_ANALYSIS_MESSAGES.routeLevers}</p>
									</div>

									<div className="wwc:rounded-md wwc:border wwc:border-amber-600/40 wwc:bg-amber-500/10 wwc:p-2 wwc:text-xs wwc:text-amber-700 wwc:dark:text-amber-400">
										<span className="wwc:font-semibold">Scope of this proof:</span>{" "}
										{WC3_ANALYSIS_MESSAGES.proofScope(WC3_OBSERVATION_ROWS.length)}
									</div>

									<p className="wwc:text-xs wwc:text-muted-foreground">
										{session.saved.length.toLocaleString()} saved {session.saved.length === 1 ? "analysis" : "analyses"}
										{onNavigate ? (
											<Button
												type="button"
												size="sm"
												variant="link"
												className="wwc:h-auto wwc:px-1 wwc:py-0"
												onClick={() => onNavigate(analysisNav.saved())}
											>
												Open Saved analyses
											</Button>
										) : null}
									</p>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// ─── Re-exports ──────────────────────────────────────────────────────────────

// Re-exported, not restated: the Analysis surfaces use the same pane, mono span, object-type chip
// and nav-target builders the Lineage tabs already ship. `useDetailLabel` is deliberately absent —
// no Analysis surface drills in, so a breadcrumb tail would have nothing to report.
export {Mono, Pane, TypeGlyphLabel, lineageNav} from "./wc3-lineage-shared";
export type {Wc3LineageNavTarget} from "./wc3-lineage-shared";

// The whole fixture surface, so a view has ONE import source and never reaches into
// wc3-analysis-data directly.
export {
	WC3_ANALYSIS_GROUP_BYS,
	WC3_ANALYSIS_METRICS,
	WC3_ANALYSIS_SEVERITIES,
	WC3_ANALYSIS_SOURCE_DATASET_IDS,
	WC3_ANALYSIS_STAGES,
	WC3_ANALYSIS_WINDOWS,
	WC3_OBSERVATION_ROWS,
	WC3_WORKER_ROWS,
	analysisDataset,
	analysisDatasetMaterialised,
	analysisDatasetName,
	analysisDatasetRows,
	analysisMetric,
	analysisMetricMissingInput,
	analysisWorker,
	wc3AnalysisDefaultSpec,
} from "./wc3-analysis-data";
export type {
	Wc3AnalysisFilter,
	Wc3AnalysisGrain,
	Wc3AnalysisGroupBy,
	Wc3AnalysisJoinedRow,
	Wc3AnalysisMetric,
	Wc3AnalysisMode,
	Wc3AnalysisRouteId,
	Wc3AnalysisSpec,
	Wc3AnalysisStageId,
	Wc3AnalysisViz,
	Wc3Materialisation,
	Wc3SavedAnalysis,
	Wc3WorkerRow,
} from "./wc3-analysis-data";
