import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import {defineConfig} from "vite";

export default defineConfig({
	// The single localhost the user opens. Studio (5001) and the Designer Hub (5002)
	// run alongside and are embedded via iframe; Storybook (6006) is linked.
	server: {port: 4000, strictPort: true},
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {"@": path.resolve(__dirname, "./src")},
	},
});
