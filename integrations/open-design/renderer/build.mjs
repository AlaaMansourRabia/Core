#!/usr/bin/env node
// Build the WakeCore renderer bundle (browser IIFE) from src/entry.tsx. Bundles @wakecap/core-ui page
// components + React into a single global (window.WakeCore.render). React/react-dom are aliased to the
// repo-root copies so core-ui's nested react doesn't produce "two copies of React" at runtime.

import * as esbuild from "esbuild";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", ".."); // repo root
const nm = (p) => join(ROOT, "node_modules", p);

await esbuild.build({
	entryPoints: [join(HERE, "src", "entry.tsx")],
	bundle: true,
	format: "iife",
	outfile: join(HERE, "wakecore-render.js"),
	jsx: "automatic",
	minify: true,
	define: {"process.env.NODE_ENV": '"production"'},
	loader: {".css": "empty"}, // component CSS is served separately (wakecore-render.css)
	alias: {
		react: nm("react"),
		"react-dom": nm("react-dom"),
		"react/jsx-runtime": nm("react/jsx-runtime"),
	},
	logLevel: "info",
});
console.error("[build] wrote wakecore-render.js");
