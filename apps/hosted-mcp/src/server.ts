// Builds an MCP server from the knowledge capabilities. Both transports (stdio + Streamable HTTP)
// use THIS — one tool surface, one behavior. Each tool is a thin wrapper: validate + envelope live in
// @corensystem/knowledge (callTool), so the transport layer only marshals to/from MCP content.

import {INPUT_SCHEMAS, type Knowledge} from "@corensystem/knowledge";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

import type {Logger} from "./obs/logger";
import type {Metrics} from "./obs/metrics";

export const SERVER_INFO = {name: "core-knowledge", version: "0.1.0"} as const;

export const SERVER_INSTRUCTIONS = `Core is authoritative for Core UI implementation. When reference images are supplied, produce a structured referenceAnalysis before template selection; always call resolve_template first among MCP planning tools and pass that analysis, then continue without asking for confirmation solely because confidence is low or no template matched. Follow the returned strategy and fallback order: import an exact direct-template match; otherwise adapt the nearest template, compose Core widgets, compose Core components, and only then create new application-level UI with Core primitives, tokens, design philosophy, interaction patterns, and look and feel. Never substitute standalone HTML/CSS or another UI library. Call create_implementation_plan before editing and follow its artifact contract.

Screenshot work is Core-first: map shell, density, regions, hierarchy, scrolling, navigation semantics, interactions, responsiveness, and source-brand traits before implementation. Assign one Core owner or catalog gap to every region and obey its machine-readable ownership contract. Require a contiguous viewport shell with stationary sidebar and route-owned scrolling; reject shell gutters, duplicate surface dividers, gap utilities on non-flex/non-grid wrappers, DataTable/chart/tab repainting, duplicate composers, fabricated peer-route back buttons, redundant surface wrappers, and decorative zoom-only canvases. Use PageContentHeader for route identity, ContextToolbar for compact contextual actions, transparent ViewTabBar for header underline tabs, and semantic chart tones for canvas-safe ECharts colors. Compare reference fidelity and Core fidelity independently.

For multi-route applications, plan a stable shared Core sidebar and top bar plus a route/region map before individual screens. Record a normative shell fingerprint covering paired artifact IDs and density, brand, navigation, footer, provider ownership, allowed route mutations, and explicit module boundaries. Preserve Core identity over reference-image branding unless the user explicitly requires that brand. Enforce semantic token existence, role, and value type across CSS and TS/TSX. Style artifacts only through public props, variants, slots, and wrapper APIs; reject internal role/state/slot selectors, hybrid variants, and raw colors. Record an artifact utilization map for every required and recommended artifact; for adapt-template, record structured substitutions with route, region, attempted fallback artifacts, replacement, and rationale.

If React, TSX, or @corensystem/core-ui is missing, prepare the workspace by safely scaffolding or extending React + TypeScript and installing the Core packages; stop only when setup genuinely fails. For required runtime audits, install the returned dependency and package script; a missing audit command is blocking. Before completion, call validate with the complete TS/TSX, CSS, route, and entry-point files plus implementationPlan containing the returned plan/contract identity, goal, implementation mode, template context, referenceAnalysis, application/artifact contract, route/region map, and substitutions. For contract v2 product/showcase/screenshot plans, run runtimeAudit v4 with evidence covering every route at desktop and 820px, shell fingerprint and DOM continuity, stationary-sidebar/content-scroll geometry, zero-gutter boundaries, owned computed DataTable/chart/tab/shell visuals, duplicate surface dividers, duplicate affordances, horizontal overflow and responsive group collisions/splits, accessible icon actions, navigation semantics, functional canvas state, history behavior, console/accessibility errors, and required interactions. Use legacy code only when the installed schema has no files input.

Select mode by goal: core-product for product UI, core-showcase for a Core demonstration or component evaluation, core-template-strict for strict template reproduction, and core-imports only for import-level integration checks. core-only is a deprecated alias for core-imports and does not prove product, showcase, or template compliance. Do not report completion unless compliant=true for the selected mode with no blocking findings; report the compliance level, detailed scores, tier and component coverage, token compliance and provenance, CSS ownership, route adoption, runtime coverage, imported/rendered/exercised artifact inventory, blocking findings, and advisory findings.`;

export function buildServer(kb: Knowledge, deps: {logger?: Logger; metrics?: Metrics} = {}): McpServer {
	const server = new McpServer(SERVER_INFO, {instructions: SERVER_INSTRUCTIONS});

	for (const t of kb.tools) {
		const schema = INPUT_SCHEMAS[t.name as keyof typeof INPUT_SCHEMAS];
		server.registerTool(t.name, {description: t.description, inputSchema: schema.shape}, async (args: unknown) => {
			const started = Date.now();
			const env = await kb.callTool(t.name, args);
			deps.metrics?.record(t.name, {elapsedMs: Date.now() - started, ok: env.ok});
			deps.logger?.info("tool", {
				capability: t.name,
				ok: env.ok,
				requestId: env.requestId,
				elapsedMs: Date.now() - started,
			});
			return {content: [{type: "text" as const, text: JSON.stringify(env, null, 2)}], isError: !env.ok};
		});
	}

	return server;
}
