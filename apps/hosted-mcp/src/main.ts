#!/usr/bin/env node
// Entry point. Builds the knowledge index once (the "Build/Index" stage), then starts the requested
// transport. HTTP is the hosted default; `--stdio` (or CORE_MCP_TRANSPORT=stdio) runs the local
// editor path. The index is built BEFORE any transport accepts traffic, so /ready is meaningful.

import {createKnowledge} from "@corensystem/knowledge";

import {loadConfig} from "./config";
import {createLogger} from "./obs/logger";
import {createMetrics} from "./obs/metrics";
import {startHttp} from "./transports/http";
import {startStdio} from "./transports/stdio";

async function main(): Promise<void> {
	const config = loadConfig();
	const logger = createLogger(config.logLevel);
	const metrics = createMetrics();

	logger.info("building knowledge index", {store: config.store, rootDir: config.rootDir ?? "(auto)"});
	const kb = createKnowledge({rootDir: config.rootDir});
	const meta = kb.meta();
	logger.info("knowledge index ready", {indexVersion: meta.indexVersion, ...meta.counts});

	if (config.transport === "stdio") {
		await startStdio(kb, {logger, metrics});
	} else {
		await startHttp(kb, {logger, metrics, host: config.host, port: config.port});
	}
}

main().catch((e) => {
	process.stderr.write(
		`${JSON.stringify({ts: new Date().toISOString(), level: "error", msg: "fatal", error: e instanceof Error ? e.stack : String(e)})}\n`,
	);
	process.exit(1);
});
