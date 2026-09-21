// Env-driven config. Everything an operator would tune lives here; auth/DB/deploy are intentionally
// absent in Phase 1 but their seams (store selection, host binding) are already threaded through.

export type TransportMode = "http" | "stdio";
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Config {
	transport: TransportMode;
	host: string;
	port: number;
	logLevel: LogLevel;
	/** Repo root override for the knowledge index (defaults to auto-detect). */
	rootDir?: string;
	/** Which store backs the knowledge platform. Only "filesystem" exists in Phase 1 (DB seam). */
	store: "filesystem";
}

export function loadConfig(argv: string[] = process.argv.slice(2)): Config {
	const stdio = argv.includes("--stdio") || process.env.WAKECORE_MCP_TRANSPORT === "stdio";
	return {
		transport: stdio ? "stdio" : "http",
		host: process.env.HOST ?? "127.0.0.1",
		port: Number(process.env.PORT ?? 4100),
		logLevel: (process.env.LOG_LEVEL as LogLevel) ?? "info",
		rootDir: process.env.WAKECORE_ROOT,
		store: "filesystem",
	};
}
