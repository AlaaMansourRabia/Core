import fs from "node:fs";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig, loadEnv, type Plugin} from "vite";

// Serve a large, local-only GLB straight from disk at /local/overlay.glb — no copy into the repo.
// Point it at your file with LOCAL_GLB_PATH in .env.local (gitignored). Dev-server only.
function serveLocalGlb(glbPath: string | undefined): Plugin {
	return {
		name: "serve-local-glb",
		configureServer(server) {
			if (!glbPath) return;
			server.middlewares.use("/local/overlay.glb", (_req, res) => {
				fs.stat(glbPath, (error, stat) => {
					if (error) {
						res.statusCode = 404;
						res.end("LOCAL_GLB_PATH not found");
						return;
					}
					res.setHeader("Content-Type", "model/gltf-binary");
					res.setHeader("Content-Length", String(stat.size));
					fs.createReadStream(glbPath).pipe(res);
				});
			});
		},
	};
}

export default defineConfig(({mode}) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		plugins: [react(), tailwindcss(), serveLocalGlb(env.LOCAL_GLB_PATH)],
		server: {port: 5180},
		// The workspace hoists React 19; without deduping, Radix deps can resolve a second
		// React copy and crash every `asChild` component. Force a single copy.
		resolve: {
			dedupe: ["react", "react-dom"],
		},
	};
});
