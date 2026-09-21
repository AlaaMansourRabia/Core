import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), react()],
	// The consumer declares React 18 but pnpm hoists the workspace's React 19, so a
	// duplicate React ends up in the bundle (the library's Radix deps resolve their own
	// copy). That crashes every `asChild` component in Radix's Slot with "Objects are not
	// valid as a React child". Dedupe forces a single React copy.
	resolve: {
		dedupe: ["react", "react-dom"],
	},
});
