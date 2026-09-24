// End-to-end smoke over BOTH transports, driven by the real MCP client (initialize -> tools/list ->
// tools/call). Proves an editor can actually talk to the hosted server. Runs against the built dist,
// so `pnpm build` (knowledge + app) must run first.

import {createKnowledge} from "@corensystem/knowledge";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StdioClientTransport} from "@modelcontextprotocol/sdk/client/stdio.js";
import {StreamableHTTPClientTransport} from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import assert from "node:assert/strict";
import {test} from "node:test";

import {createLogger} from "../dist/obs/logger.mjs";
import {createMetrics} from "../dist/obs/metrics.mjs";
import {startHttp} from "../dist/transports/http.mjs";

const TOOL_NAMES = [
	"create_implementation_plan",
	"explain",
	"resolve_component",
	"resolve_template",
	"resolve_widgets",
	"search",
	"validate",
];
const envelopeOf = (result) => JSON.parse(result.content[0].text);

test("stdio transport: initialize, list, and call tools", async () => {
	const client = new Client({name: "smoke", version: "0.0.0"});
	const transport = new StdioClientTransport({command: "node", args: ["dist/main.mjs", "--stdio"]});
	await client.connect(transport);
	try {
		assert.match(client.getInstructions(), /continue without asking for confirmation/i);
		assert.match(client.getInstructions(), /adapt the nearest template/i);
		const {tools} = await client.listTools();
		assert.deepEqual(tools.map((t) => t.name).sort(), TOOL_NAMES);

		const rt = await client.callTool({name: "resolve_template", arguments: {intent: "admin settings management page"}});
		const env = envelopeOf(rt);
		assert.equal(env.apiVersion, "core-knowledge/2026-07");
		assert.equal(env.ok, true);
		assert.ok(env.data.candidates.some((c) => c.name === "CoreAdminPanel"));

		const fallback = await client.callTool({
			name: "resolve_template",
			arguments: {intent: "a worker-management dashboard for status, attendance, observations, and site activity"},
		});
		const fallbackEnv = envelopeOf(fallback);
		assert.equal(fallbackEnv.data.selectionGate.mayImplement, true);
		assert.equal(fallbackEnv.data.selectionGate.strategy, "adapt-template");

		const rw = await client.callTool({name: "resolve_widgets", arguments: {template: env.data.candidates[0].ref.id}});
		assert.ok(["widgets", "regions", "composed", "thin"].includes(envelopeOf(rw).data.shape));

		const plan = await client.callTool({
			name: "create_implementation_plan",
			arguments: {template: "timesheet"},
		});
		assert.equal(envelopeOf(plan).data.implementationMode, "direct-template");
	} finally {
		await client.close();
	}
});

test("http (Streamable) transport: initialize, list, and call tools", async () => {
	const kb = createKnowledge();
	const server = await startHttp(kb, {
		logger: createLogger("error"),
		metrics: createMetrics(),
		host: "127.0.0.1",
		port: 4139,
	});
	const client = new Client({name: "smoke", version: "0.0.0"});
	const transport = new StreamableHTTPClientTransport(new URL("http://127.0.0.1:4139/mcp"));
	try {
		await client.connect(transport);
		const {tools} = await client.listTools();
		assert.deepEqual(tools.map((t) => t.name).sort(), TOOL_NAMES);

		const bad = await client.callTool({
			name: "validate",
			arguments: {code: 'import {Button} from "@corensystem/coren-ui";'},
		});
		const env = envelopeOf(bad);
		assert.equal(env.ok, true, "tool ran");
		assert.equal(env.data.pass, false, "barrel import fails validation");

		const approximation = await client.callTool({
			name: "validate",
			arguments: {
				mode: "core-only",
				template: "timesheet",
				code: "<!doctype html><html><style>.card{}</style><div>Workers</div></html>",
			},
		});
		assert.equal(envelopeOf(approximation).data.compliant, false);

		const search = await client.callTool({name: "search", arguments: {query: "confirm destructive action", limit: 3}});
		assert.ok(envelopeOf(search).data.results.length > 0);
	} finally {
		await client.close();
		await new Promise((resolve) => server.close(() => resolve()));
	}
});

test("http operational endpoints", async () => {
	const kb = createKnowledge();
	const server = await startHttp(kb, {
		logger: createLogger("error"),
		metrics: createMetrics(),
		host: "127.0.0.1",
		port: 4140,
	});
	try {
		const health = await (await fetch("http://127.0.0.1:4140/health")).json();
		assert.equal(health.status, "ok");
		const ready = await (await fetch("http://127.0.0.1:4140/ready")).json();
		assert.equal(ready.status, "ready");
		assert.ok(ready.counts.component > 0);
		const schemas = await (await fetch("http://127.0.0.1:4140/schemas")).json();
		assert.deepEqual(schemas.tools.map((t) => t.name).sort(), TOOL_NAMES);
		assert.equal(schemas.schemas.resolve_template.type, "object");
	} finally {
		await new Promise((resolve) => server.close(() => resolve()));
	}
});
