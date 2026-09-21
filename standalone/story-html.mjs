import {readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync, mkdtempSync} from "node:fs";
import {createRequire} from "node:module";
import {tmpdir} from "node:os";
import {dirname, extname, isAbsolute, relative, resolve, sep} from "node:path";
import {fileURLToPath} from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const STORYBOOK = resolve(REPO, "apps/storybook");
const STORY_ROOT = resolve(STORYBOOK, "stories");
const STORYBOOK_PACKAGE = resolve(STORYBOOK, "package.json");
const PREVIEW_CSS = resolve(HERE, "story-preview.css");
const PUBLIC_DIR = resolve(STORYBOOK, "public");
const DEFAULT_INDEX = resolve(STORYBOOK, "dist/index.json");
const DEFAULT_OUT = resolve(HERE, "dist");

const requireFromStorybook = createRequire(STORYBOOK_PACKAGE);

function isWithin(parent, child) {
	const path = relative(parent, child);
	return path === "" || (!path.startsWith(`..${sep}`) && path !== ".." && !isAbsolute(path));
}

function assertStoryExportName(value) {
	if (!/^[A-Za-z_$][\w$]*$/.test(value)) {
		throw new Error(`Invalid story export name: ${value}`);
	}
}

function safeFilename(value) {
	return (
		value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "") || "wakecore-story"
	);
}

function resolveStoryFile(importPath) {
	const repositoryRelativePrefix = "./apps/storybook/";
	return importPath.startsWith(repositoryRelativePrefix)
		? resolve(REPO, importPath.slice(2))
		: resolve(STORYBOOK, importPath);
}

function walkFiles(directory) {
	const files = [];
	for (const name of readdirSync(directory)) {
		const path = resolve(directory, name);
		if (statSync(path).isDirectory()) files.push(...walkFiles(path));
		else files.push(path);
	}
	return files;
}

function mimeType(path) {
	switch (extname(path).toLowerCase()) {
		case ".avif":
			return "image/avif";
		case ".frag":
			return "application/octet-stream";
		case ".gif":
			return "image/gif";
		case ".jpeg":
		case ".jpg":
			return "image/jpeg";
		case ".json":
			return "application/json";
		case ".png":
			return "image/png";
		case ".svg":
			return "image/svg+xml";
		case ".webp":
			return "image/webp";
		case ".woff":
			return "font/woff";
		case ".woff2":
			return "font/woff2";
		default:
			return "application/octet-stream";
	}
}

function inlineReferencedPublicAssets(source) {
	let result = source;
	for (const path of walkFiles(PUBLIC_DIR)) {
		const publicPath = `/${relative(PUBLIC_DIR, path).split(sep).join("/")}`;
		if (!result.includes(publicPath)) continue;

		const dataUrl = `data:${mimeType(path)};base64,${readFileSync(path).toString("base64")}`;
		result = result.split(publicPath).join(dataUrl);
	}
	return result;
}

function generatedEntry({storyFile, exportName, storyId, title, theme}) {
	return `
import React from "react";
import {createRoot} from "react-dom/client";
import {composeStory} from "@storybook/react";
import * as storyModule from "wakecore:story-module";
import "wakecore:preview-css";

const storyExport = storyModule[${JSON.stringify(exportName)}];
if (!storyExport) throw new Error(${JSON.stringify(`Story export ${exportName} was not found in ${storyFile}`)});

const theme = ${JSON.stringify(theme)};
document.documentElement.classList.toggle("dark", theme === "dark");
document.documentElement.style.colorScheme = theme;
document.title = ${JSON.stringify(title)};

const projectAnnotations = {
  initialGlobals: {theme},
  decorators: [
    (Story, context) => {
      const isDark = context.globals.theme === "dark";
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
      return Story();
    },
  ],
};

const Story = composeStory(storyExport, storyModule.default, projectAnnotations, ${JSON.stringify(exportName)});
const root = document.getElementById("root");
const layout = Story.parameters?.layout ?? "padded";
root.dataset.layout = layout;
root.dataset.wakecoreRegion = "exported-story";
root.dataset.wakecoreArtifact = ${JSON.stringify(storyId)};
createRoot(root).render(React.createElement(Story));
`;
}

function generatedHtml(title, storyId) {
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>${title.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</title>
	</head>
	<body>
		<div id="root" data-wakecore-region="exported-story" data-wakecore-artifact="${storyId}"></div>
		<script type="module" src="/entry.tsx"></script>
	</body>
</html>`;
}

export function readStoryIndex(indexPath = DEFAULT_INDEX) {
	const index = JSON.parse(readFileSync(indexPath, "utf8"));
	return index.entries ?? {};
}

export function resolveStoryEntry(storyId, entries) {
	const entry = entries[storyId];
	if (!entry) throw new Error(`Unknown Storybook story id: ${storyId}`);
	if (entry.type !== "story") throw new Error(`Only Storybook stories can be exported; ${storyId} is ${entry.type}.`);
	if (!entry.importPath || !entry.exportName) throw new Error(`Story ${storyId} has no import path or export name.`);
	return entry;
}

export async function buildStoryHtml({storyId, entry, theme = "light"}) {
	if (!storyId || !entry) throw new Error("storyId and entry are required.");
	if (entry.type && entry.type !== "story")
		throw new Error(`Only stories can be exported; ${storyId} is ${entry.type}.`);
	if (theme !== "light" && theme !== "dark") throw new Error(`Unsupported theme: ${theme}`);
	assertStoryExportName(entry.exportName);

	const storyFile = resolveStoryFile(entry.importPath);
	if (!isWithin(STORY_ROOT, storyFile) || !/\.stories\.[cm]?[jt]sx?$/.test(storyFile)) {
		throw new Error(`Story import must resolve to a .stories file inside ${STORY_ROOT}.`);
	}

	const title = `${entry.title} — ${entry.name}`;
	const stage = realpathSync(mkdtempSync(resolve(tmpdir(), "wakecore-story-html-")));
	const output = resolve(stage, "output");
	writeFileSync(resolve(stage, "index.html"), generatedHtml(title, storyId));
	writeFileSync(
		resolve(stage, "entry.tsx"),
		generatedEntry({storyFile, exportName: entry.exportName, storyId, title, theme}),
	);

	try {
		const {build} = await import(requireFromStorybook.resolve("vite"));
		const react = (await import(requireFromStorybook.resolve("@vitejs/plugin-react"))).default;
		const tailwindcss = (await import(requireFromStorybook.resolve("@tailwindcss/vite"))).default;
		const storybookReactEntry = requireFromStorybook.resolve("@storybook/react");
		const reactDirectory = dirname(requireFromStorybook.resolve("react/package.json"));
		const reactDomDirectory = dirname(requireFromStorybook.resolve("react-dom/package.json"));

		await build({
			root: stage,
			configFile: false,
			logLevel: "warn",
			publicDir: false,
			plugins: [react(), tailwindcss()],
			resolve: {
				alias: [
					{find: "wakecore:story-module", replacement: storyFile},
					{find: "wakecore:preview-css", replacement: PREVIEW_CSS},
					{find: "@storybook/react", replacement: storybookReactEntry},
					{find: /^react(?=\/|$)/, replacement: reactDirectory},
					{find: /^react-dom(?=\/|$)/, replacement: reactDomDirectory},
				],
				dedupe: ["react", "react-dom"],
			},
			build: {
				chunkSizeWarningLimit: 10_000,
				outDir: output,
				emptyOutDir: true,
				assetsInlineLimit: Number.MAX_SAFE_INTEGER,
				cssCodeSplit: false,
				modulePreload: {polyfill: false},
				rollupOptions: {
					input: resolve(stage, "index.html"),
					output: {inlineDynamicImports: true, entryFileNames: "app.js", assetFileNames: "app[extname]"},
				},
			},
		});

		let html = readFileSync(resolve(output, "index.html"), "utf8");
		let js = inlineReferencedPublicAssets(readFileSync(resolve(output, "app.js"), "utf8"));
		let css = "";
		try {
			css = inlineReferencedPublicAssets(readFileSync(resolve(output, "app.css"), "utf8"));
		} catch {
			// A story with no emitted CSS remains valid.
		}

		html = html
			.replace(/<link rel="stylesheet"[^>]*>/g, "")
			.replace(/<script type="module"[^>]*src="[^"]*"[^>]*><\/script>/g, "");
		js = js.replace(/<\/script>/g, "<\\/script>");

		const layoutCss = `
html, body, #root { min-height: 100%; }
body { margin: 0; background: var(--background); color: var(--foreground); }
#root[data-layout="padded"] { padding: 1rem; }
#root[data-layout="centered"] { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
#root[data-layout="fullscreen"] { min-height: 100vh; }
`;

		return html
			.replace("</head>", () => `<style>${css}${layoutCss}</style></head>`)
			.replace("</body>", () => `<script type="module">${js}</script></body>`);
	} finally {
		rmSync(stage, {recursive: true, force: true});
	}
}

export async function exportStoryToFile({storyId, entry, outDir = DEFAULT_OUT, theme = "light"}) {
	const html = await buildStoryHtml({storyId, entry, theme});
	const filename = `${safeFilename(`${entry.title}-${entry.name}`)}.html`;
	const path = resolve(outDir, filename);
	writeFileSync(path, html);
	return {filename, path, bytes: Buffer.byteLength(html)};
}

export const storyHtmlPaths = {DEFAULT_INDEX, DEFAULT_OUT, REPO, STORYBOOK, STORY_ROOT};
