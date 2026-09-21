import {defineConfig} from "tsdown";

export default defineConfig({
	entry: ["src/**/*.ts", "!src/**/*.test.ts"],
	format: "esm",
	unbundle: true,
	dts: false,
	outDir: "dist",
	platform: "node",
	// The MCP SDK + workspace knowledge core stay external (resolved from node_modules at runtime).
	external: [/^@modelcontextprotocol/, /^@wakecap/],
});
