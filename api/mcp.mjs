// Core Hosted MCP — Vercel serverless function. Serves the knowledge capabilities over MCP
// (Streamable HTTP, stateless) at /mcp, plus /health, /ready, /schemas (routed here by vercel.json
// rewrites via ?op=). It loads a prebuilt JSON bundle (api/_bundle) — NO runtime filesystem discovery
// — so it runs the same locally and on Vercel. The knowledge core + validators are unchanged; only the
// data source differs (bundle instead of the repo tree).

import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {createKnowledge, createMemoryStore, INPUT_SCHEMAS} from "@core/knowledge";
import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {gradeFileSet, gradeSnippet} from "../scripts/validators/index.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const readBundle = (name) => JSON.parse(readFileSync(join(HERE, "_bundle", name), "utf8"));

const CORS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
};

const SERVER_INFO = {name: "core-knowledge", version: "0.1.0"};
const SERVER_INSTRUCTIONS = `Core is authoritative for Core UI implementation. When reference images are supplied, produce a structured referenceAnalysis before template selection; always call resolve_template first among MCP planning tools and pass that analysis, then continue without asking for confirmation solely because confidence is low or no template matched. Follow the returned strategy and fallback order: import an exact direct-template match; otherwise adapt the nearest template, compose Core widgets, compose Core components, and only then create new application-level UI with Core primitives, tokens, design philosophy, interaction patterns, and look and feel. Never substitute standalone HTML/CSS or another UI library. Call create_implementation_plan before editing and follow its artifact contract.

Screenshot work is Core-first: map shell, density, regions, hierarchy, scrolling, navigation semantics, interactions, responsiveness, and source-brand traits before implementation. Assign one Core owner or catalog gap to every region and obey its machine-readable ownership contract. Require a contiguous viewport shell with stationary sidebar and route-owned scrolling; reject shell gutters, duplicate surface dividers, gap utilities on non-flex/non-grid wrappers, DataTable/chart/tab repainting, duplicate composers, fabricated peer-route back buttons, redundant surface wrappers, and decorative zoom-only canvases. Use PageContentHeader for route identity, ContextToolbar for compact contextual actions, transparent ViewTabBar for header underline tabs, and semantic chart tones for canvas-safe ECharts colors. Compare reference fidelity and Core fidelity independently.

For multi-route applications, plan a stable shared Core sidebar and top bar plus a route/region map before individual screens. Record a normative shell fingerprint covering paired artifact IDs and density, brand, navigation, footer, provider ownership, allowed route mutations, and explicit module boundaries. Preserve Core identity over reference-image branding unless the user explicitly requires that brand. Enforce semantic token existence, role, and value type across CSS and TS/TSX. Style artifacts only through public props, variants, slots, and wrapper APIs; reject internal role/state/slot selectors, hybrid variants, and raw colors. Record an artifact utilization map for every required and recommended artifact; for adapt-template, record structured substitutions with route, region, attempted fallback artifacts, replacement, and rationale.

If React, TSX, or @corensystem/core-ui is missing, prepare the workspace by safely scaffolding or extending React + TypeScript and installing the Core packages; stop only when setup genuinely fails. For required runtime audits, install the returned dependency and package script; a missing audit command is blocking. Before completion, call validate with the complete TS/TSX, CSS, route, and entry-point files plus implementationPlan containing the returned plan/contract identity, goal, implementation mode, template context, referenceAnalysis, application/artifact contract, route/region map, and substitutions. For contract v2 product/showcase/screenshot plans, run runtimeAudit v4 with evidence covering every route at desktop and 820px, shell fingerprint and DOM continuity, stationary-sidebar/content-scroll geometry, zero-gutter boundaries, owned computed DataTable/chart/tab/shell visuals, duplicate surface dividers, duplicate affordances, horizontal overflow and responsive group collisions/splits, accessible icon actions, navigation semantics, functional canvas state, history behavior, console/accessibility errors, and required interactions. Use legacy code only when the installed schema has no files input.

Select mode by goal: core-product for product UI, core-showcase for a Core demonstration or component evaluation, core-template-strict for strict template reproduction, and core-imports only for import-level integration checks. core-only is a deprecated alias for core-imports and does not prove product, showcase, or template compliance. Do not report completion unless compliant=true for the selected mode with no blocking findings; report the compliance level, detailed scores, tier and component coverage, token compliance and provenance, CSS ownership, route adoption, runtime coverage, imported/rendered/exercised artifact inventory, blocking findings, and advisory findings.`;

// Lazily build the knowledge platform once per warm lambda instance.
let _kb;
function getKb() {
	if (_kb) return _kb;
	const {meta, records} = readBundle("index.json");
	const v = readBundle("validators.json");
	// Reconstruct the Sets/Maps the validators expect from the serialized arrays.
	const catalog = {
		coreUi: v.coreUi,
		components: v.components,
		patterns: v.patterns,
		exportsSet: new Set(v.exportsSet),
		requires: v.requires,
		failureModes: v.failureModes,
		byName: new Map(v.components.map((c) => [c.name, c])),
		failureModeById: new Map(v.failureModes.map((fm) => [fm.id, fm])),
	};
	const store = createMemoryStore(records, {builtAt: meta.builtAt});
	_kb = createKnowledge({store, validators: {gradeSnippet, gradeFileSet, catalog}});
	return _kb;
}

function buildServer(kb) {
	const server = new McpServer(SERVER_INFO, {instructions: SERVER_INSTRUCTIONS});
	for (const t of kb.tools) {
		const schema = INPUT_SCHEMAS[t.name];
		server.registerTool(t.name, {description: t.description, inputSchema: schema.shape}, async (args) => {
			const env = await kb.callTool(t.name, args);
			return {content: [{type: "text", text: JSON.stringify(env, null, 2)}], isError: !env.ok};
		});
	}
	return server;
}

function sendJson(res, status, body) {
	res.writeHead(status, {"Content-Type": "application/json", ...CORS});
	res.end(JSON.stringify(body, null, 2));
}

async function readBody(req) {
	if (req.body !== undefined) return req.body; // Vercel pre-parses JSON bodies
	const chunks = [];
	for await (const chunk of req) chunks.push(chunk);
	const raw = Buffer.concat(chunks).toString("utf8");
	return raw ? JSON.parse(raw) : undefined;
}

export default async function handler(req, res) {
	const op = new URL(req.url ?? "/", "http://localhost").searchParams.get("op");
	for (const [k, val] of Object.entries(CORS)) res.setHeader(k, val);

	if (req.method === "OPTIONS") {
		res.writeHead(204, CORS);
		res.end();
		return;
	}

	try {
		if (req.method === "GET" && op === "health")
			return sendJson(res, 200, {status: "ok", server: {name: "core-knowledge", version: "0.1.0"}});
		if (req.method === "GET" && op === "ready") {
			const meta = getKb().meta();
			return sendJson(res, 200, {
				status: "ready",
				indexVersion: meta.indexVersion,
				manifestSchema: meta.manifestSchema,
				counts: meta.counts,
				builtAt: meta.builtAt,
			});
		}
		if (req.method === "GET" && op === "schemas") {
			const kb = getKb();
			return sendJson(res, 200, {
				server: SERVER_INFO,
				tools: kb.tools,
				schemas: kb.jsonSchemas(),
			});
		}

		if (req.method === "POST") {
			const kb = getKb();
			const body = await readBody(req);
			const server = buildServer(kb);
			const transport = new StreamableHTTPServerTransport({sessionIdGenerator: undefined, enableJsonResponse: true});
			res.on("close", () => {
				void transport.close();
				void server.close();
			});
			await server.connect(transport);
			await transport.handleRequest(req, res, body);
			return;
		}

		return sendJson(res, 405, {
			jsonrpc: "2.0",
			error: {code: -32000, message: "Method not allowed. Use POST for MCP."},
			id: null,
		});
	} catch (e) {
		if (!res.headersSent)
			sendJson(res, 500, {error: {code: "internal_error", message: e instanceof Error ? e.message : String(e)}});
	}
}
