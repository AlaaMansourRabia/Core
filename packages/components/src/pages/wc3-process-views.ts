import type {ReactElement} from "react";

import {WC3_PROCESSES} from "./wc3-process-data";
import {ProcessListView} from "./wc3-process-list-view";
import {seedProcessRecord, type Wc3ProcessRecord, type Wc3ProcessViewProps} from "./wc3-process-shared";

// The Processes perspective is ONE surface — the catalogue of process definitions. The four names the
// shell used to carry as top-level tabs (canvas / instances / bottlenecks / editor) are the SECTIONS of
// a SINGLE process's page (prototype PageProcesses, line 7195: one canvas, one token panel, one SLA
// panel and one editor panel, all for the process chosen in the header dropdown), so they live in
// wc3-process-detail.tsx behind a left SideMenu. Same correction already applied to Products, where six
// wrongly-declared tabs became PRODUCT_TABS on the detail page.
//
// Same seam as PRODUCT_VIEWS (wc3-product-views.ts:14), PIPELINE_VIEWS (wc3-pipeline-views.ts:17) and
// LINEAGE_VIEWS (wc3-lineage-views.ts:11): keyed by TAB ID, looked up by the shell, and a tab left out
// of this record still falls through to the perspective's `placeholders` entry.
export const PROCESS_VIEWS: Record<string, (props: Wc3ProcessViewProps) => ReactElement> = {
	processes: ProcessListView,
};

/**
 * Seed for the shell's live process array.
 *
 * Deep-cloned, not aliased: WC3_PROCESSES is a frozen module fixture and one accidental in-place
 * `proc.states.push` would corrupt it for the whole app. Every mutation helper in
 * wc3-process-shared.tsx is pure, so this is belt-and-braces — keep it anyway.
 *
 * seedProcessRecord ALSO computes the canvas layout (processLayout, ported from the prototype's
 * procLayout): a process state carries no x/y, unlike a pipeline node, so without this pass there is
 * nothing for a drag to commit to and every state would render at 0,0.
 */
export function seedProcesses(): Wc3ProcessRecord[] {
	return WC3_PROCESSES.map(seedProcessRecord);
}

// Re-exported so the shell needs one import line and never reaches into the shared module.
export type {Wc3ProcessRecord, Wc3ProcessViewProps} from "./wc3-process-shared";
