import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

export default defineConfig({
	plugins: [tailwindcss(), react()],
	// Same dedupe the tw4 playground needs: the workspace hoists React 19 while the consumer
	// declares React 18, so without this a duplicate React lands in the bundle and every Radix
	// `asChild` (Slot) component throws "Objects are not valid as a React child".
	resolve: {
		dedupe: ["react", "react-dom"],
	},
	server: {
		// Snippets are copied into .generated/ (inside this app), so no out-of-root fs access is
		// needed; keep the default sandbox.
		fs: {strict: true},
	},
});
