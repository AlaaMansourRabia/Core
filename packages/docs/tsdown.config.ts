import {readdirSync} from "node:fs";
import {join} from "node:path";
import {defineConfig} from "tsdown";

// Dynamically discover all example entry points
const examplesDir = "src/examples";
const entries = readdirSync(examplesDir, {withFileTypes: true})
	.filter((d) => d.isDirectory())
	.map((d) => join(examplesDir, d.name, "index.ts"))
	.filter((entry) => {
		try {
			readdirSync(entry.replace("/index.ts", "")).includes("index.ts");
			return true;
		} catch {
			return false;
		}
	});

export default defineConfig({
	entry: entries.length > 0 ? entries : ["src/examples/badge/index.ts"],
	format: "esm",
	dts: true,
	outDir: "dist/examples",
	// Peer dependencies must be external - never bundled
	deps: {
		neverBundle: [/^react/, /^react-dom/, /^@corensystem\//, /^lucide-react/],
	},
});
