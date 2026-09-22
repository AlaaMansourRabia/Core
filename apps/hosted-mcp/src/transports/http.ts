// Streamable HTTP transport — the HOSTED surface. Stateless: each POST /mcp gets a fresh server +
// transport (no session store), which is the simplest thing that scales horizontally and leaves a
// clean seam for sessions/auth later. Alongside MCP it serves operational endpoints:
//   GET /health   liveness (no index access)
//   GET /ready    readiness — 200 once the index is built, with tier counts
//   GET /schemas  self-describing API — the JSON Schema for every tool input
//   GET /metrics  in-memory per-capability counters
// stdout is free here (HTTP, not stdio), but we still log to stderr for consistency.

import type {Knowledge} from "@corensystem/knowledge";

import {StreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {randomUUID} from "node:crypto";
import {createServer, type IncomingMessage, type Server, type ServerResponse} from "node:http";

import type {Logger} from "../obs/logger";
import type {Metrics} from "../obs/metrics";
import {buildServer, SERVER_INFO} from "../server";

const CORS: Record<string, string> = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
};

function sendJson(res: ServerResponse, status: number, body: unknown): void {
	res.writeHead(status, {"Content-Type": "application/json", ...CORS});
	res.end(JSON.stringify(body, null, 2));
}

async function readBody(req: IncomingMessage): Promise<unknown> {
	const chunks: Buffer[] = [];
	for await (const chunk of req) chunks.push(chunk as Buffer);
	const raw = Buffer.concat(chunks).toString("utf8");
	return raw ? JSON.parse(raw) : undefined;
}

export interface HttpDeps {
	logger: Logger;
	metrics: Metrics;
	startedAt: number;
}

export function createHttpServer(kb: Knowledge, deps: HttpDeps): Server {
	const {logger, metrics, startedAt} = deps;

	return createServer(async (req, res) => {
		const reqId = randomUUID();
		const url = new URL(req.url ?? "/", "http://localhost");
		const path = url.pathname;
		const method = req.method ?? "GET";

		if (method === "OPTIONS") {
			res.writeHead(204, CORS);
			res.end();
			return;
		}

		try {
			if (method === "GET" && path === "/health") {
				sendJson(res, 200, {status: "ok", server: SERVER_INFO, uptimeMs: Date.now() - startedAt});
				return;
			}
			if (method === "GET" && path === "/ready") {
				const meta = kb.meta();
				sendJson(res, 200, {
					status: "ready",
					indexVersion: meta.indexVersion,
					manifestSchema: meta.manifestSchema,
					counts: meta.counts,
					builtAt: meta.builtAt,
				});
				return;
			}
			if (method === "GET" && path === "/schemas") {
				sendJson(res, 200, {server: SERVER_INFO, tools: kb.tools, schemas: kb.jsonSchemas()});
				return;
			}
			if (method === "GET" && path === "/metrics") {
				sendJson(res, 200, {metrics: metrics.snapshot()});
				return;
			}

			if (path === "/mcp") {
				if (method !== "POST") {
					// Stateless mode has no server-initiated stream — only POST is meaningful.
					sendJson(res, 405, {
						jsonrpc: "2.0",
						error: {code: -32000, message: "Method not allowed. Use POST /mcp."},
						id: null,
					});
					return;
				}
				const body = await readBody(req);
				const server = buildServer(kb, {logger, metrics});
				const transport = new StreamableHTTPServerTransport({sessionIdGenerator: undefined, enableJsonResponse: true});
				res.on("close", () => {
					void transport.close();
					void server.close();
				});
				// CORS on the MCP response too (browser-based editors).
				for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
				await server.connect(transport);
				await transport.handleRequest(req, res, body);
				return;
			}

			sendJson(res, 404, {error: {code: "not_found", message: `No route ${method} ${path}`}});
		} catch (e) {
			logger.error("request failed", {reqId, path, error: e instanceof Error ? e.message : String(e)});
			if (!res.headersSent)
				sendJson(res, 500, {error: {code: "internal_error", message: e instanceof Error ? e.message : String(e)}});
		}
	});
}

export function startHttp(
	kb: Knowledge,
	deps: {logger: Logger; metrics: Metrics; host: string; port: number},
): Promise<Server> {
	const startedAt = Date.now();
	const server = createHttpServer(kb, {logger: deps.logger, metrics: deps.metrics, startedAt});
	return new Promise((resolve) => {
		server.listen(deps.port, deps.host, () => {
			deps.logger.info("http transport ready", {
				url: `http://${deps.host}:${deps.port}`,
				mcp: `http://${deps.host}:${deps.port}/mcp`,
				tools: kb.tools.length,
			});
			resolve(server);
		});
	});
}
