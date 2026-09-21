import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import {defineConfig} from "vite";

import {studioCatalog} from "./server/catalog";
import {studioPreview} from "./server/preview";
import {studioWorkspace} from "./server/workspace-api";

export default defineConfig({
	// Fixed port so the Hub launcher can embed Studio in an iframe.
	server: {port: 5001, strictPort: true},
	plugins: [react(), tailwindcss(), studioCatalog(), studioPreview(), studioWorkspace()],
	resolve: {
		alias: {"@": path.resolve(__dirname, "./src")},
	},
});
