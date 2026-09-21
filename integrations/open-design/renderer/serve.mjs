#!/usr/bin/env node
// Serves the WakeCore renderer bundle with permissive CORS so an Open Design preview iframe can load
// it by absolute URL and call window.WakeCore.render(pageInstance). The bundle carries its own React;
// running it inside OD's sandboxed srcdoc iframe keeps it isolated. Port overridable via WAKECORE_RENDERER_PORT.

import {createServer} from "node:http";
import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.WAKECORE_RENDERER_PORT ?? 8787);

const files = {
	"/wakecore-render.js": {type: "text/javascript", body: readFileSync(join(HERE, "wakecore-render.js"))},
	"/wakecore-render.css": {type: "text/css", body: readFileSync(join(HERE, "wakecore-render.css"))},
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
}).listen(PORT, () => console.error(`[wakecore-renderer] serving on http://localhost:${PORT} (CORS *)`));
