// Studio's window into Core. A Vite dev-middleware that exposes the real Core catalog (the
// "installed software" of the OS) to the browser: templates, and the widget/component library. Reads it
// through the canonical layer — the single source of truth — and returns a `version` token so the client
// can reflect approved changes (see server/canonical.ts). The home surface IS Core, live.
import type {Plugin} from "vite";

import {canonicalVersion, getCatalog} from "./canonical";

export function studioCatalog(): Plugin {
	return {
		name: "core-studio-catalog",
		configureServer(server) {
			server.middlewares.use("/api/catalog", (_req, res) => {
				try {
					const cat = getCatalog();
					const templates = cat.templates
						.map((t: Record<string, unknown>) => ({
							id: t.id,
							name: t.name,
							archetype: t.archetype ?? null,
							intent: typeof t.intent === "string" ? t.intent : "",
							status: t.manifestStatus ?? null,
						}))
						.sort((a, b) => String(a.name).localeCompare(String(b.name)));
					const widgets = cat.widgets.map((w: Record<string, unknown>) => w.name).sort();
					const components = cat.components.map((c: Record<string, unknown>) => c.name).sort();
					res.setHeader("content-type", "application/json");
					res.end(
						JSON.stringify({
							version: canonicalVersion(),
							counts: {templates: templates.length, widgets: widgets.length, components: components.length},
							templates,
							widgets,
							components,
						}),
					);
				} catch (e) {
					res.statusCode = 500;
					res.setHeader("content-type", "application/json");
					res.end(JSON.stringify({error: e instanceof Error ? e.message : String(e)}));
				}
			});
		},
	};
}
