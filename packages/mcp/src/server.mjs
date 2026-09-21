#!/usr/bin/env node
// WakeCore MCP server (stdio). The tool-agnostic seam every AI editor consults to build UI from
// WakeCore. Open Design is the first client — it mounts this as an MCP server and hands the tools to
// its inner agent. Zero client coupling: this speaks plain MCP over stdio and wraps @wakecap/sdk.
//
// Pinned to @modelcontextprotocol/sdk@1.29.0 to match Open Design's client.

import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {CallToolRequestSchema, ListToolsRequestSchema} from "@modelcontextprotocol/sdk/types.js";
import {createSdk, loadCatalog} from "@wakecap/sdk";
import {buildTools} from "./tools.mjs";

const catalog = loadCatalog();
const sdk = createSdk(catalog);
const tools = buildTools(sdk, catalog);
const byName = new Map(tools.map((t) => [t.name, t]));

const server = new Server(
	{name: "wakecore", version: "0.1.0"},
	{capabilities: {tools: {}}},
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
	tools: tools.map((t) => ({name: t.name, description: t.description, inputSchema: t.inputSchema})),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
	const tool = byName.get(req.params.name);
	if (!tool) {
		return {isError: true, content: [{type: "text", text: `Unknown tool: ${req.params.name}`}]};
	}
	try {
		const result = tool.run(req.params.arguments ?? {});
		return {content: [{type: "text", text: JSON.stringify(result, null, 2)}]};
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e?.message ?? e);
		return {isError: true, content: [{type: "text", text: `Error in ${req.params.name}: ${message}`}]};
	}
});

const transport = new StdioServerTransport();
await server.connect(transport);
// stderr is safe for logs; stdout is the MCP channel.
console.error(`[wakecore-mcp] ready — ${tools.length} tools, ${catalog.counts.templates} templates / ${catalog.counts.widgets} widgets`);
