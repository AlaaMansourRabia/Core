// The capability registry — the ONE place tools are declared (name, description, input schema, impl).
// Both transports (stdio + HTTP in apps/hosted-mcp) drive tools through `callTool`, so there is a
// single definition of the API. `respond()` applies the versioned envelope, generates a requestId,
// stamps provenance/meta, and turns any error into an ErrorEnvelope — errors are values, never thrown
// across the transport.

import {randomUUID} from "node:crypto";
import {z} from "zod";

import {API_VERSION, makeProvenance, type Envelope} from "../schemas/envelope";
import {INPUT_SCHEMAS} from "../schemas/inputs";
import {CapabilityError, type CapabilityContext, type CapabilityFn} from "./context";
import {createImplementationPlan} from "./create-implementation-plan";
import {explain} from "./explain";
import {resolveComponent} from "./resolve-component";
import {resolveTemplate} from "./resolve-template";
import {resolveWidgets} from "./resolve-widgets";
import {search} from "./search";
import {validate} from "./validate";

export interface ToolDef {
	name: string;
	description: string;
	input: z.ZodType;
	run: CapabilityFn<unknown, unknown>;
}

function tool<I, D>(name: string, description: string, input: z.ZodType<I>, run: CapabilityFn<I, D>): ToolDef {
	return {name, description, input: input as z.ZodType, run: run as CapabilityFn<unknown, unknown>};
}

export const TOOLS: ToolDef[] = [
	tool(
		"resolve_template",
		"Use this as the FIRST MCP planning tool for every UI task, after producing referenceAnalysis when screenshots are supplied. Ranks Core page templates and returns an executable strategy: direct import for an exact match, adapt the nearest template, or compose from Core artifacts. Low confidence and no-match results never require confirmation.",
		INPUT_SCHEMAS.resolve_template,
		resolveTemplate,
	),
	tool(
		"resolve_widgets",
		"Given a template id, return its widget composition (deterministic structural graph-walk). Unifies authored widget lists, region recommendations, and composedOf; reports required dependencies and flags synthesized plans. Use after resolve_template.",
		INPUT_SCHEMAS.resolve_widgets,
		resolveWidgets,
	),
	tool(
		"create_implementation_plan",
		"Create an executable Core implementation contract from a selected/nearest template or UI intent. Binds screenshot reference regions, a shared shell, and per-route regions to explicit Core owners for a multi-surface contract v2. Returns the strategy, composition candidates, fallback order, workspace requirements, and mandatory validation gate. Use after resolve_template and before editing files.",
		INPUT_SCHEMAS.create_implementation_plan,
		createImplementationPlan,
	),
	tool(
		"resolve_component",
		"Rank components by intent (or fetch one by name). Returns imports, variants/sizes, selection guidance, examples, and props. Use after templates/widgets and before creating a new Core-aligned application component.",
		INPUT_SCHEMAS.resolve_component,
		resolveComponent,
	),
	tool(
		"search",
		"Semantic search across the whole design system (templates, widgets, components, patterns, utilities). Returns ranked refs with intent snippets. Use to discover what exists.",
		INPUT_SCHEMAS.search,
		search,
	),
	tool(
		"validate",
		"Authoritatively validate complete Core implementation files against the implementation plan. Use core-product for product UI, core-showcase for evaluation/showcases, or core-template-strict for direct templates; core-only is a deprecated imports-only alias. Do not report completion unless compliant=true.",
		INPUT_SCHEMAS.validate,
		validate,
	),
	tool(
		"explain",
		"Explain a single artifact: purpose, when / when-not to use it, what to choose it over, alternatives, common mistakes, related templates/widgets, and its import + example.",
		INPUT_SCHEMAS.explain,
		explain,
	),
];

export const TOOL_BY_NAME: Map<string, ToolDef> = new Map(TOOLS.map((t) => [t.name, t]));

/** JSON Schema for every tool input (served at /schemas and used as MCP inputSchema). */
export function toolJsonSchemas(): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const t of TOOLS) out[t.name] = z.toJSONSchema(t.input);
	return out;
}

/** Call a tool by name with raw args, returning a fully-formed versioned Envelope (never throws). */
export async function callTool(name: string, args: unknown, ctx: CapabilityContext): Promise<Envelope<unknown>> {
	const requestId = `req_${randomUUID()}`;
	const started = Date.now();
	const meta = ctx.store.meta();

	const tool = TOOL_BY_NAME.get(name);
	if (!tool) {
		return {
			apiVersion: API_VERSION,
			capability: name,
			requestId,
			ok: false,
			error: {code: "unknown_tool", message: `Unknown tool: ${name}`, retryable: false},
		};
	}

	const parsed = tool.input.safeParse(args ?? {});
	if (!parsed.success) {
		return {
			apiVersion: API_VERSION,
			capability: name,
			requestId,
			ok: false,
			error: {
				code: "invalid_input",
				message: parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; "),
				retryable: false,
			},
		};
	}

	try {
		const result = await tool.run(parsed.data, ctx);
		return {
			apiVersion: API_VERSION,
			capability: name,
			requestId,
			ok: true,
			data: result.data,
			warnings: result.warnings ?? [],
			provenance: makeProvenance(meta, result.sources ?? []),
			meta: {
				elapsedMs: Date.now() - started,
				count: Array.isArray((result.data as {candidates?: unknown[]})?.candidates)
					? (result.data as {candidates: unknown[]}).candidates.length
					: undefined,
			},
		};
	} catch (e) {
		const err = e instanceof CapabilityError ? e : null;
		return {
			apiVersion: API_VERSION,
			capability: name,
			requestId,
			ok: false,
			error: {
				code: err?.code ?? "internal_error",
				message: e instanceof Error ? e.message : String(e),
				retryable: err?.retryable ?? false,
				target: err?.target,
			},
		};
	}
}
