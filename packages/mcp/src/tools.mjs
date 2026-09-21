// The WakeCore tool surface — the tool-agnostic API any AI editor (Open Design first) calls to build
// UI from WakeCore instead of inventing it. Advisory tools (resolve_*, list_templates) help the agent
// choose; authoritative tools (generate_page_instance, validate_page) are the ONLY way a real, valid
// page comes into being. Each tool is a thin wrapper over the deterministic @wakecap/sdk.

/** @param {import("@wakecap/sdk").WakecoreSdk} sdk */
export function buildTools(sdk, catalog) {
	return [
		{
			name: "list_templates",
			description:
				"List every WakeCore page template (id, name, intent, region count). Call this to see what WakeCore can build before choosing.",
			inputSchema: {type: "object", properties: {}},
			run: () => ({
				templates: catalog.templates.map((t) => ({
					id: t.id,
					name: t.name,
					intent: t.intent,
					archetype: t.archetype,
					regions: (t.regions ?? []).length,
				})),
			}),
		},
		{
			name: "resolve_template",
			description:
				"Rank WakeCore templates by how well they match a natural-language intent. Returns candidates with id, name, score, rationale, and when/whenNot guidance. Use this to pick the right template for the user's request.",
			inputSchema: {
				type: "object",
				properties: {
					intent: {type: "string", description: "The user's natural-language intent."},
					limit: {type: "number", description: "Max candidates (default 3)."},
				},
				required: ["intent"],
			},
			run: (a) => sdk.resolveTemplate({intent: String(a.intent), limit: a.limit ? Number(a.limit) : 3}),
		},
		{
			name: "resolve_widgets",
			description:
				"For a chosen template id, list the widgets each region declares as required or recommended. Use this to decide which widgets to place.",
			inputSchema: {
				type: "object",
				properties: {
					template_id: {type: "string", description: "Template id from resolve_template."},
					region: {type: "string", description: "Optional region id to narrow to."},
				},
				required: ["template_id"],
			},
			run: (a) => sdk.resolveWidgets({template: {id: String(a.template_id)}, region: a.region ? String(a.region) : undefined}),
		},
		{
			name: "generate_page_instance",
			description:
				"Produce a validated WakeCore PageInstance (schema page-instance/0.1) for a template. This is the ONLY way to create a page — do not hand-write UI. Returns { page, validation, unresolved, rationale }. Emit `page` as the artifact; render it with the WakeCore renderer.",
			inputSchema: {
				type: "object",
				properties: {
					template_id: {type: "string", description: "Template id from resolve_template."},
					fill: {
						type: "string",
						enum: ["required", "recommended"],
						description: "required = only required widgets; recommended = required + recommended (default).",
					},
					widgets: {
						type: "array",
						description: "Optional explicit widget placements.",
						items: {
							type: "object",
							properties: {
								widget: {type: "string"},
								region: {type: "string"},
							},
							required: ["widget", "region"],
						},
					},
				},
				required: ["template_id"],
			},
			run: (a) => {
				const desired = Array.isArray(a.widgets)
					? a.widgets.map((w, i) => ({id: `${w.widget}-${w.region}-${i}`, widget: w.widget, region: w.region}))
					: [];
				return sdk.generatePageInstance({
					template: {id: String(a.template_id)},
					desired,
					fill: a.fill === "required" ? "required" : "recommended",
				});
			},
		},
		{
			name: "validate_page",
			description:
				"Validate a WakeCore PageInstance and return its issues (authoritative, deterministic). Use to check a page before presenting it. Pass the full `page` object.",
			inputSchema: {
				type: "object",
				properties: {
					page: {type: "object", description: "A page-instance/0.1 object (from generate_page_instance)."},
				},
				required: ["page"],
			},
			run: (a) => sdk.validatePage(a.page),
		},
	];
}
