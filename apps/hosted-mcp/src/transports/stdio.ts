// stdio transport — the local path any editor can spawn (parity with @core/mcp). stdout carries
// the MCP JSON-RPC channel; logs go to stderr (see obs/logger).

import type {Knowledge} from "@core/knowledge";

import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";

import type {Logger} from "../obs/logger";
import type {Metrics} from "../obs/metrics";
import {buildServer} from "../server";

export async function startStdio(kb: Knowledge, deps: {logger?: Logger; metrics?: Metrics} = {}): Promise<void> {
	const server = buildServer(kb, deps);
	await server.connect(new StdioServerTransport());
	deps.logger?.info("stdio transport ready", {tools: kb.tools.length});
}
