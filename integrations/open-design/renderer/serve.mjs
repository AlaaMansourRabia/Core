#!/usr/bin/env node
// Serves the Core renderer bundle with permissive CORS so an Open Design preview iframe can load
// it by absolute URL and call window.Core.render(pageInstance). The bundle carries its own React;
// running it inside OD's sandboxed srcdoc iframe keeps it isolated. Port overridable via CORE_RENDERER_PORT.

import {createServer} from "node:http";
import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.CORE_RENDERER_PORT ?? 8787);

const files = {
	"/core-render.js": {type: "text/javascript", body: readFileSync(join(HERE, "core-render.js"))},
	"/core-render.css": {type: "text/css", body: readFileSync(join(HERE, "core-render.css"))},
};

createServer((req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	const url = (req.url ?? "/").split("?")[0];
	if (url === "/" || url === "/health") {
		res.writeHead(200, {"content-type": "application/json"});
		res.end(JSON.stringify({ok: true, serves: Object.keys(files)}));
		return;
	}
	const f = files[url];
	if (!f) {
		res.writeHead(404);
		res.end("not found");
		return;
	}
	res.writeHead(200, {"content-type": f.type});
	res.end(f.body);
}).listen(PORT, () => console.error(`[core-renderer] serving on http://localhost:${PORT} (CORS *)`));
