#!/usr/bin/env node

import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const storiesRoot = join(root, "apps/storybook/stories");
const sidebar = readFileSync(join(root, "apps/web/src/components/layout/Sidebar.tsx"), "utf8");
const templates = readFileSync(join(root, "apps/web/src/lib/templates.ts"), "utf8");
const routes = readFileSync(join(root, "apps/web/src/DesignerApp.tsx"), "utf8");
const templateViewer = readFileSync(join(root, "apps/web/src/pages/TemplateViewerPage.tsx"), "utf8");

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const key = (tier, group, name) => [tier, normalize(group), normalize(name)].join("|");

function walk(directory) {
	return readdirSync(directory, {withFileTypes: true}).flatMap((entry) =>
		entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)],
	);
}

function storyTitles() {
	return walk(storiesRoot)
		.filter((candidate) => candidate.endsWith(".stories.tsx"))
		.flatMap((file) => {
			const source = readFileSync(file, "utf8");
			const title = source.match(/title:\s*"([^"]+\/[^"]+)"/)?.[1];
			return title ? [{file: file.slice(root.length), title}] : [];
		});
}

function arraySection(source, start, end) {
	const from = source.indexOf(start);
	const to = source.indexOf(end, from + start.length);
	if (from < 0 || to < 0) throw new Error(`Could not find Designer catalog section: ${start}`);
	return source.slice(from, to);
}

function categoryEntries(section, tier) {
	const entries = [];
	const categoryPattern = /\{\s*name:\s*"[^"]+",\s*label:\s*"([^"]+)",\s*items:\s*\[([\s\S]*?)\],\s*\}/g;
	for (const category of section.matchAll(categoryPattern)) {
		for (const item of category[2].matchAll(/\{name:\s*"([^"]+)",\s*path:\s*"([^"]+)"/g)) {
			entries.push({catalogKey: key(tier, category[1], item[1]), name: item[1], path: item[2]});
		}
	}
	return entries;
}

const componentSection = arraySection(sidebar, "export const componentCategories", "export const widgetCategories");
const widgetSection = arraySection(sidebar, "export const widgetCategories", "/** Storybook's Widgets/Profile");
const componentEntries = categoryEntries(componentSection, "Components");
const widgetEntries = categoryEntries(widgetSection, "Widgets");

for (const item of sidebar.matchAll(/export const widgetItems[^=]*=\s*\[\{name:\s*"([^"]+)",\s*path:\s*"([^"]+)"/g)) {
	widgetEntries.push({catalogKey: key("Widgets", "", item[1]), name: item[1], path: item[2]});
}

const themeEntries = [...sidebar.matchAll(/\{name:\s*"([^"]+)",\s*path:\s*"(\/theme\/[^"]+)"\}/g)].map(
	([, name, path]) => ({catalogKey: key("Getting Started", "Design Tokens", name), name, path}),
);

// Entries may carry an optional trailing `group:` (product release), so match up to the closing brace.
const templateEntries = [...templates.matchAll(/\{id:\s*"([^"]+)",\s*name:\s*"([^"]+)"[^}]*\}/g)].map(([, id, name]) => ({
	catalogKey: key("Templates", "", name),
	name,
	path: `/templates/${id}`,
	id,
}));

const expected = new Map();
for (const story of storyTitles()) {
	const segments = story.title.split("/");
	const tier = segments[0];
	if (tier === "Templates") {
		const name = segments.at(-1) === "Interactive Example" ? segments.at(-2) : segments.at(-1);
		expected.set(key(tier, "", name), story);
	} else if (tier === "Widgets" && segments.length === 2) {
		expected.set(key(tier, "", segments[1]), story);
	} else if (tier === "Components" || tier === "Widgets" || tier === "Getting Started") {
		expected.set(key(tier, segments[1], segments.at(-1)), story);
	}
}

const actualEntries = [...componentEntries, ...widgetEntries, ...themeEntries, ...templateEntries];
const actual = new Map(actualEntries.map((entry) => [entry.catalogKey, entry]));
const missing = [...expected].filter(([catalogKey]) => !actual.has(catalogKey)).map(([, story]) => story);
const extra = [...actual].filter(([catalogKey]) => !expected.has(catalogKey)).map(([, entry]) => entry);

const declaredRoutes = new Set([...routes.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => `/${match[1]}`));
const navigableEntries = [...componentEntries, ...widgetEntries, ...themeEntries];
const missingRoutes = navigableEntries.filter((entry) => !declaredRoutes.has(entry.path));

const hasTemplateRoute = declaredRoutes.has("/templates/:id");
const missingTemplateRenderers = hasTemplateRoute
	? templateEntries.filter(
			({id}) =>
				id !== "timesheet" &&
				!templateViewer.includes(`"${id}"`) &&
				!new RegExp(`\\b${id.replaceAll("-", "\\-")}\\s*:`).test(templateViewer),
		)
	: templateEntries;

if (missing.length || extra.length || missingRoutes.length || missingTemplateRenderers.length) {
	if (missing.length) {
		console.error("Storybook entries missing from Designer Hub or grouped under the wrong tier/category:");
		for (const item of missing) console.error(`  - ${item.title} (${item.file})`);
	}
	if (extra.length) {
		console.error("Designer Hub entries not present in Storybook:");
		for (const item of extra) console.error(`  - ${item.name} (${item.path})`);
	}
	if (missingRoutes.length) {
		console.error("Designer Hub navigation entries missing routes:");
		for (const item of missingRoutes) console.error(`  - ${item.name} (${item.path})`);
	}
	if (missingTemplateRenderers.length) {
		console.error("Designer Hub templates missing a viewer implementation:");
		for (const item of missingTemplateRenderers) console.error(`  - ${item.name} (${item.path})`);
	}
	process.exit(1);
}

const counts = {
	components: componentEntries.length,
	widgets: widgetEntries.length,
	templates: templateEntries.length,
	designTokens: themeEntries.length,
};
console.log(
	`Designer Hub exact parity verified: ${counts.components} components, ${counts.widgets} widgets, ${counts.templates} templates, and ${counts.designTokens} design tokens match Storybook by tier, category, name, and route.`,
);
