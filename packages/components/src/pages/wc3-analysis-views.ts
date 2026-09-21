import type {ReactElement} from "react";

import {wc3AnalysisDefaultSpec} from "./wc3-analysis-data";
import {DataAnalysisView} from "./wc3-analysis-data-view";
import {ObjectAnalysisView} from "./wc3-analysis-object-view";
import {SavedAnalysesView} from "./wc3-analysis-saved-view";
import {analysisRun, type Wc3AnalysisSession, type Wc3AnalysisViewProps} from "./wc3-analysis-shared";

// The three declared tabs are all REAL surfaces, and all three are kept — unlike Products (six tabs
// collapsed to PRODUCT_TABS behind a SideMenu) and Processes (four tabs collapsed to detail-page
// sections). The reasoning is different in kind and is recorded here rather than rediscovered:
//
//   · `object` and `data` are two MODES of the prototype's one PageAnalysis (06-unified-workspace.html
//     :9889), not sections of a record page. The prototype already renders them as a TAB BAR at the top
//     of the page and resets the spec when you cross between them. Promoting that tab bar to the
//     perspective tab bar is a lossless move: the header stays the mode switch and no in-content mode
//     toggle has to be invented, which the "no in-content <h1>" rule would have made awkward anyway.
//   · They are NOT two components. Both entries mount the SAME AnalysisWorkbench from
//     wc3-analysis-shared.tsx and differ only in the two stage bodies the prototype itself writes
//     differently (Source and Traverse/Join). Everything else — the rail, filter/derive/group/viz/publish,
//     the result panel, the execution-meta panel — is one implementation, so the two tabs structurally
//     cannot drift.
//   · `saved` is a genuine list of records (spec + route + lineage) and gets the one-DataTable list/card
//     surface. It opens EMPTY and stays empty until the session saves something, because the prototype's
//     store opens with S.analyses = [] and S.materializations = []. That empty state is shipped honestly
//     with the prototype's own copy rather than seeded with invented history.
//
// Same seam as PRODUCT_VIEWS (wc3-product-views.ts:14), PIPELINE_VIEWS (wc3-pipeline-views.ts:17),
// LINEAGE_VIEWS (wc3-lineage-views.ts:11) and PROCESS_VIEWS (wc3-process-views.ts:17): keyed by TAB ID,
// looked up by the shell, and a tab left out of this record still falls through to the perspective's
// `placeholders` entry.
export const ANALYSIS_VIEWS: Record<string, (props: Wc3AnalysisViewProps) => ReactElement> = {
	object: ObjectAnalysisView,
	data: DataAnalysisView,
	saved: SavedAnalysesView,
};

/**
 * Seed for the shell's live analysis session.
 *
 * BOTH builder tabs are seeded up front — the prototype keeps one spec and destroys it on a mode
 * switch (anDefaultSpec is re-run every time UI.analysis.mode changes), but here object and data are
 * two tabs and the shell resolves exactly one ANALYSIS_VIEWS entry per render. Destroying the other
 * mode's half-built query on every tab switch would be a regression, not fidelity. Documented
 * divergence.
 *
 * `wc3AnalysisDefaultSpec` returns a fresh object literal per call, so there is nothing aliased to a
 * frozen fixture here; `saved` and `materialisations` start as NEW empty arrays rather than as the
 * WC3_*_SEED constants, so an in-session push can never reach a module-level array.
 *
 * The result is computed here, not left null: it is the result of the spec beside it and that
 * invariant is what lets every surface read `state.result` without a null check. Two runs over 210
 * and 210 rows at mount — measured in single-digit milliseconds.
 */
export function seedAnalysisSession(): Wc3AnalysisSession {
	const object = wc3AnalysisDefaultSpec("object");
	const data = wc3AnalysisDefaultSpec("data");
	return {
		object: {spec: object, result: analysisRun(object)},
		data: {spec: data, result: analysisRun(data)},
		saved: [],
		materialisations: [],
	};
}

// Re-exported so the shell needs one import line and never reaches into the shared module.
export type {Wc3AnalysisSession, Wc3AnalysisViewProps} from "./wc3-analysis-shared";
