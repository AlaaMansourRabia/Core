#!/usr/bin/env node
// Copy the Storybook static build into the app's dist as a subpath, so the app can link to
// /storybook/ (opened in a new tab) from the same deployment — no separate Vercel project, no CORS.
//
//   apps/web/dist/            → the app (core.wakecap.com/)
//   apps/web/dist/storybook/  ← apps/storybook/dist  (built with SB_BASE=/storybook/)
//   apps/web/dist/.agents/    ← .agents                (Codex marketplace manifest)
//   apps/web/dist/plugins/    ← plugins                (Codex plugin archives)

import {cpSync, existsSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP_DIST = join(ROOT, "apps", "web", "dist");

if (!existsSync(APP_DIST)) throw new Error(`[assemble] ${APP_DIST} missing — build apps-web first.`);

const from = join(ROOT, "apps", "storybook", "dist");
const to = join(APP_DIST, "storybook");
if (existsSync(from)) {
	cpSync(from, to, {recursive: true});
	process.stderr.write(`[assemble] Storybook → ${to.replace(`${ROOT}/`, "")}\n`);
} else {
	process.stderr.write(`[assemble] SKIP Storybook — ${from} not built.\n`);
}

for (const path of [".agents", "plugins"]) {
	const source = join(ROOT, path);
	const destination = join(APP_DIST, path);
	if (!existsSync(source)) throw new Error(`[assemble] ${source} missing.`);
	cpSync(source, destination, {recursive: true});
	process.stderr.write(`[assemble] ${path} → ${destination.replace(`${ROOT}/`, "")}\n`);
}
