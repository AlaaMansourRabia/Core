// Structured JSON logging to STDERR. stdout is reserved for the stdio MCP channel (a stray log there
// corrupts the protocol), so all diagnostics go to stderr regardless of transport. One line = one
// event, easy to ship to any log pipeline later.

import type {LogLevel} from "../config";

const ORDER: Record<LogLevel, number> = {debug: 0, info: 1, warn: 2, error: 3};

export interface Logger {
	debug(msg: string, fields?: Record<string, unknown>): void;
	info(msg: string, fields?: Record<string, unknown>): void;
	warn(msg: string, fields?: Record<string, unknown>): void;
	error(msg: string, fields?: Record<string, unknown>): void;
}

export function createLogger(minLevel: LogLevel = "info"): Logger {
	const emit = (level: LogLevel, msg: string, fields: Record<string, unknown> = {}): void => {
		if (ORDER[level] < ORDER[minLevel]) return;
		process.stderr.write(`${JSON.stringify({ts: new Date().toISOString(), level, msg, ...fields})}\n`);
	};
	return {
		debug: (m, f) => emit("debug", m, f),
		info: (m, f) => emit("info", m, f),
		warn: (m, f) => emit("warn", m, f),
		error: (m, f) => emit("error", m, f),
	};
}
