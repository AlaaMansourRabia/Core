export type Template = {
	id: string;
	name: string;
	archetype: string | null;
	intent: string;
	status: string | null;
};

export type Catalog = {
	// Canonical fingerprint — changes when merged/approved repository data changes (see server/canonical.ts).
	version: string;
	counts: {templates: number; widgets: number; components: number};
	templates: Template[];
	widgets: string[];
	components: string[];
};

export async function loadCatalog(): Promise<Catalog> {
	const res = await fetch("/api/catalog");
	if (!res.ok) throw new Error(`catalog ${res.status}`);
	return (await res.json()) as Catalog;
}

// Display name for a template: drop the leading "Core" and space out the camelCase.
// e.g. "CoreAnalyticsOverview" → "Analytics Overview", "CoreOrgAiReport" → "Org Ai Report".
export function formatTemplateName(name: string): string {
	return name
		.replace(/^Core(?=[A-Z])/, "")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/\bAi\b/g, "AI")
		.trim();
}
