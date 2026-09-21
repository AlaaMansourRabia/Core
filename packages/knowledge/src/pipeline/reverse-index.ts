// Reverse indices — "what uses X". The manifest graph is directional (templates point at their
// widgets/components); `explain` and related-artifact lookups need the inverse. Built once at index
// time so lookups are O(1). This is the structural-graph-walk half of the two-operation retrieval
// model: dependencies are resolved from the graph, never re-discovered by keyword.

import type {NormalizedRecord} from "../model/record";

export interface ReverseIndex {
	/** artifact name -> templates that place it as a widget (requiredWidgets/optionalWidgets/regions). */
	widgetUsedByTemplate: Map<string, string[]>;
	/** artifact name -> artifacts that list it in `composedOf`. */
	composedByArtifact: Map<string, string[]>;
	/** artifact name -> artifacts that reference it via `chooseOver`/`pairsWith`. */
	referencedByArtifact: Map<string, string[]>;
}

function push(map: Map<string, string[]>, key: string, value: string): void {
	const list = map.get(key);
	if (!list) map.set(key, [value]);
	else if (!list.includes(value)) list.push(value);
}

export function buildReverseIndex(records: NormalizedRecord[]): ReverseIndex {
	const widgetUsedByTemplate = new Map<string, string[]>();
	const composedByArtifact = new Map<string, string[]>();
	const referencedByArtifact = new Map<string, string[]>();

	for (const r of records) {
		for (const w of r.widgets ?? []) push(widgetUsedByTemplate, w.name, r.name);
		for (const name of r.composedOf ?? []) push(composedByArtifact, name, r.name);
		for (const c of r.chooseOver) if (c.component) push(referencedByArtifact, c.component, r.name);
		for (const name of r.pairsWith) push(referencedByArtifact, name, r.name);
	}

	return {widgetUsedByTemplate, composedByArtifact, referencedByArtifact};
}
