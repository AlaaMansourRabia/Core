import {defineConfig} from "tsdown";

export default defineConfig({
	entry: ["src/examples/badge/index.ts", "src/examples/label/index.ts"],
	format: "esm",
	dts: true,
	outDir: "dist/examples",
	// Peer dependencies must be external - never bundled
	deps: {
		neverBundle: [/^react/, /^react-dom/, /^@corensystem\//, /^lucide-react/],
	},
});
