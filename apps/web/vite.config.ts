import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import {defineConfig} from "vite";

export default defineConfig({
	// Served at "/" locally; the hosted hub builds it under a subpath (WEB_BASE=/designers/) and embeds
	// it same-origin. import.meta.env.BASE_URL follows this, which the router reads as its basename.
	base: process.env.WEB_BASE || "/",
	// Fixed port so the Hub launcher can embed the Designer Hub in an iframe.
	server: {port: 5002, strictPort: true},
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@/core": path.resolve(__dirname, "./src/components"),
		},
	},
});
