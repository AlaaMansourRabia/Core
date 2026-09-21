import {defineConfig} from "tsdown";

export default defineConfig({
	entry: ["src/**/*.ts", "!src/**/*.test.ts"],
	format: "esm",
	unbundle: true,
	dts: true,
	outDir: "dist",
	// The knowledge core is Node-only and depends on no runtime framework.
	platform: "node",
});
