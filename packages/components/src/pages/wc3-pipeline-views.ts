import type {ReactElement} from "react";

import {WC3_PIPELINES, type Wc3Pipeline} from "./wc3-lineage-data";
import {PipelineListView} from "./wc3-pipeline-list-view";
import {clonePipeline, type Wc3PipelineViewProps} from "./wc3-pipeline-shared";
import {PipelinePaletteView, PipelineRunsView} from "./wc3-pipeline-side-views";

// The three Pipelines surfaces. Same seam as PRODUCT_VIEWS (wc3-product-views.ts:14) and
// LINEAGE_VIEWS (wc3-lineage-views.ts:11): keyed by TAB ID, looked up by the shell, and a tab left
// out of this record still falls through to the perspective's `placeholders` entry — so these three
// can be wired one at a time.
//
// Note the shape differs from the prototype on purpose. The prototype is ONE builder page for a
// pipeline chosen from a header dropdown, with the palette as a sidebar. Here the LIST is the entry
// point, the builder is its drill-in (wc3-pipeline-detail.tsx, rendered by the list, not registered
// here), and the palette and the run log are promoted to tabs of their own.
export const PIPELINE_VIEWS: Record<string, (props: Wc3PipelineViewProps) => ReactElement> = {
	pipelines: PipelineListView,
	palette: PipelinePaletteView,
	runs: PipelineRunsView,
};

/**
 * Seed for the shell's live pipeline array. Deep-cloned, not aliased: WC3_PIPELINES is a frozen
 * module fixture that wc3-lineage-data-view.tsx and the ontology's Impact view still read directly,
 * and one accidental in-place `pipe.runs.push` would corrupt it for the whole app. Every mutation
 * helper in wc3-pipeline-shared.tsx is pure, so this is belt-and-braces — keep it anyway.
 */
export function seedPipelines(): Wc3Pipeline[] {
	return WC3_PIPELINES.map(clonePipeline);
}

// Re-exported so the shell needs one import line and never reaches into the shared module.
export type {Wc3PipelineViewProps} from "./wc3-pipeline-shared";
