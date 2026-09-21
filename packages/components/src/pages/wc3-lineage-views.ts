import type {ReactElement} from "react";

import {LineageDataView} from "./wc3-lineage-data-view";
import {LineageImpactView} from "./wc3-lineage-impact-view";
import type {LineageViewProps} from "./wc3-lineage-shared";
import {LineageWorkflowView} from "./wc3-lineage-workflow-view";

// The three Lineage surfaces, ported from the unified-workspace prototype's "m7-lineage.js" module.
// Same seam as ONTOLOGY_VIEWS (wc3-ontology-views.tsx:1282): keyed by TAB ID, looked up by the shell,
// and a tab left out of this record still falls through to the perspective's `placeholders` entry.
export const LINEAGE_VIEWS: Record<string, (props: LineageViewProps) => ReactElement> = {
	data: LineageDataView,
	workflow: LineageWorkflowView,
	impact: LineageImpactView,
};

// Re-exported so the shell needs one import line, not two, and never reaches into the shared module.
export type {LineageViewProps, Wc3LineageNavTarget} from "./wc3-lineage-shared";
