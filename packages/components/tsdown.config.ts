import {defineConfig} from "tsdown";

export default defineConfig({
	entry: ["src/**/*.{ts,tsx}", "!src/**/*.test.*", "!src/test-setup.ts"],
	format: "esm",
	unbundle: true,
	dts: true,
	outDir: "dist",
	// three and @thatopen/fragments are optional peers (FragmentViewer only) — never inline them.
	external: [/^react/, /^react-dom/, /^three/, /^@thatopen\//],
});
