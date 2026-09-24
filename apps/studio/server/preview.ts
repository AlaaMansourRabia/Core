import type {Connect, Plugin} from "vite";

import * as esbuild from "esbuild";

// The canonical preview seam. Every Core template is REAL page source (seeded from @corensystem/coren-ui);
// esbuild bundles it (React externalized) and the Core renderer evaluates the bundle live. Studio is
// read-only: it renders an approved, canonical template and writes nothing to disk. There is no agent,
// no workspace, no session — editing happens externally and reaches Studio only after review + merge.
// The SDK comes from the canonical layer so a merged manifest change is reflected on the next request.
//
//   /api/preview   templateId → the canonical template's source + compiled bundle { template, code, compiled }
import {getSdk} from "./canonical";
import {seedFor} from "./seeds";

const REACT_EXTERNALS = ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"];

// --- Compile: canonical source → an evaluable CJS bundle (only React stays external) ------------------
async function compile(source: string, resolveDir: string): Promise<string> {
	const r = await esbuild.build({
		stdin: {contents: source, resolveDir, loader: "tsx", sourcefile: "page.tsx"},
		bundle: true,
		format: "cjs",
		jsx: "automatic",
		platform: "browser",
		external: REACT_EXTERNALS,
		write: false,
		logLevel: "silent",
		define: {"process.env.NODE_ENV": '"production"'},
		loader: {
			".css": "empty",
			".png": "dataurl",
			".jpg": "dataurl",
			".jpeg": "dataurl",
			".svg": "dataurl",
			".gif": "dataurl",
		},
	});
	return r.outputFiles[0].text;
}

function readBody(req: Connect.IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		let d = "";
		req.on("data", (c) => (d += c));
		req.on("end", () => resolve(d));
		req.on("error", reject);
	});
}
function sendJson(res: import("node:http").ServerResponse, status: number, body: unknown) {
	res.statusCode = status;
	res.setHeader("content-type", "application/json");
	res.end(JSON.stringify(body));
}

export function studioPreview(): Plugin {
	return {
		name: "core-studio-preview",
		configureServer(server) {
			// Resolve a canonical template and return its source + compiled bundle. Read-only: no disk
			// is written, no workspace is created, no agent runs. The SDK is re-read per request via the
			// canonical layer, so a merged manifest change is reflected without restarting the server.
			server.middlewares.use("/api/preview", async (req, res) => {
				try {
					const body = JSON.parse((await readBody(req)) || "{}") as {templateId?: string};
					const id = body.templateId;
					if (!id) throw {message: "No template."};
					const seed = seedFor(id);
					if (!seed) throw {message: `"${id}" isn't wired to a canonical preview yet.`};
					const t = getSdk().loadManifest({id, tier: "template"});
					const compiled = await compile(seed.source, seed.resolveDir);
					sendJson(res, 200, {
						template: {id, name: t.name},
						code: seed.source,
						compiled,
					});
				} catch (e) {
					sendJson(res, 400, {error: (e as {message?: string})?.message ?? String(e)});
				}
			});
		},
	};
}
