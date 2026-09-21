import {buildStoryHtml} from "../../../standalone/story-html.mjs";

const ENDPOINT = "/__wakecore/export-html";
const MAX_BODY_BYTES = 64 * 1024;

function readJsonBody(request) {
	return new Promise((resolve, reject) => {
		let body = "";
		request.setEncoding("utf8");
		request.on("data", (chunk) => {
			body += chunk;
			if (body.length > MAX_BODY_BYTES) reject(new Error("Export request is too large."));
		});
		request.on("end", () => {
			try {
				resolve(JSON.parse(body));
			} catch {
				reject(new Error("Export request must contain valid JSON."));
			}
		});
		request.on("error", reject);
	});
}
function filenameFor(entry) {
	return `${`${entry.title}-${entry.name}`
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")}.html`;
}

export function wakecoreHtmlExportPlugin() {
	return {
		name: "wakecore-clickable-html-export",
		configureServer(server) {
			server.middlewares.use(ENDPOINT, async (request, response) => {
				if (request.method !== "POST") {
					response.statusCode = 405;
					response.setHeader("Allow", "POST");
					response.end("Method not allowed");
					return;
				}

				try {
					const {storyId, entry, theme} = await readJsonBody(request);
					const html = await buildStoryHtml({storyId, entry, theme});
					response.statusCode = 200;
					response.setHeader("Content-Type", "text/html; charset=utf-8");
					response.setHeader("Content-Disposition", `attachment; filename="${filenameFor(entry)}"`);
					response.setHeader("Cache-Control", "no-store");
					response.end(html);
				} catch (error) {
					server.config.logger.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
					response.statusCode = 400;
					response.setHeader("Content-Type", "application/json; charset=utf-8");
					response.end(JSON.stringify({error: error instanceof Error ? error.message : String(error)}));
				}
			});
		},
	};
}
