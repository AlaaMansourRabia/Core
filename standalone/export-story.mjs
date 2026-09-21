#!/usr/bin/env node
import {mkdirSync} from "node:fs";
import {resolve} from "node:path";

import {exportStoryToFile, readStoryIndex, resolveStoryEntry, storyHtmlPaths} from "./story-html.mjs";

function argument(name, fallback) {
	const index = process.argv.indexOf(name);
	return index === -1 ? fallback : process.argv[index + 1];
}

const storyId = argument("--story");
const indexPath = resolve(argument("--index", storyHtmlPaths.DEFAULT_INDEX));
const outDir = resolve(argument("--out", storyHtmlPaths.DEFAULT_OUT));
const theme = argument("--theme", "light");

if (!storyId) {
	console.error(
		"Usage: node standalone/export-story.mjs --story <storybook-id> [--theme light|dark] [--out directory]",
	);
	process.exit(1);
}

try {
	const entries = readStoryIndex(indexPath);
	const entry = resolveStoryEntry(storyId, entries);
	mkdirSync(outDir, {recursive: true});
	const result = await exportStoryToFile({storyId, entry, outDir, theme});
	console.log(`${entry.title} / ${entry.name} → ${result.path} (${Math.round(result.bytes / 1024)} KB)`);
} catch (error) {
	console.error(`[core-html] ${error instanceof Error ? error.message : error}`);
	process.exit(1);
}
