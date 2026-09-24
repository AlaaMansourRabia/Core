#!/usr/bin/env node
/**
 * Build script for generating documentation JSON files.
 *
 * Generates:
 * - dist/index.json - Component index with id, name, group, storybookTitle
 * - dist/docs/{id}.json - Per-component documentation with full schema
 */

import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const STORYBOOK_DIR = resolve(ROOT, "../../apps/storybook/stories");
const EXAMPLES_DIR = resolve(ROOT, "src/examples");
const DIST_DIR = resolve(ROOT, "dist");
const DOCS_DIR = resolve(DIST_DIR, "docs");

// Component groups and their Storybook prefixes
const COMPONENT_GROUPS = {
	primitives: "Components/Primitives",
	form: "Components/Forms",
	navigation: "Components/Navigation",
	overlay: "Components/Overlay",
	layout: "Components/Layout",
	display: "Components/Data Display",
	feedback: "Components/Feedback",
	charts: "Components/Charts",
	map: "Components/Map",
	"drawing-canvas": "Components/Drawing Canvas",
	toolbar: "Components/Toolbar",
};

// Map storybook directory to friendly group name
const GROUP_NAMES = {
	primitives: "Primitives",
	form: "Forms",
	navigation: "Navigation",
	overlay: "Overlay",
	layout: "Layout",
	display: "Data Display",
	feedback: "Feedback",
	charts: "Charts",
	map: "Map",
	"drawing-canvas": "Drawing Canvas",
	toolbar: "Toolbar",
};

/**
 * Discover all components from Storybook stories.
 */
function discoverComponents() {
	const components = [];

	for (const [group, prefix] of Object.entries(COMPONENT_GROUPS)) {
		const groupDir = join(STORYBOOK_DIR, group);
		if (!existsSync(groupDir)) continue;

		const files = readdirSync(groupDir).filter((f) => f.endsWith(".stories.tsx"));
		for (const file of files) {
			const id = file.replace(".stories.tsx", "").toLowerCase();
			const name = file.replace(".stories.tsx", "");
			components.push({
				id,
				name,
				group: GROUP_NAMES[group],
				storybookTitle: `${prefix}/${name}`,
				storyFile: join(groupDir, file),
				hasExamples: existsSync(join(EXAMPLES_DIR, id)),
			});
		}
	}

	return components;
}

/**
 * Read example source file and return formatted code.
 */
function readExampleSource(componentId, exampleName) {
	const examplePath = join(EXAMPLES_DIR, componentId, `${exampleName}.tsx`);
	if (!existsSync(examplePath)) {
		return "";
	}
	return readFileSync(examplePath, "utf-8");
}

/**
 * Get all example exports for a component.
 */
function getExampleExports(componentId) {
	const indexPath = join(EXAMPLES_DIR, componentId, "index.ts");
	if (!existsSync(indexPath)) {
		return [];
	}
	const content = readFileSync(indexPath, "utf-8");
	const exports = [];
	const regex = /export\s*\{(\w+)\}\s*from/g;
	let match;
	while ((match = regex.exec(content)) !== null) {
		exports.push(match[1]);
	}
	return exports;
}

/**
 * Get description from example file docstring.
 */
function getExampleDescription(componentId, exampleName) {
	const source = readExampleSource(componentId, exampleName);
	const match = source.match(/\/\*\*\s*([\s\S]*?)\s*\*\//);
	if (match) {
		return match[1].replace(/\s*\*\s*/g, " ").trim();
	}
	return "";
}

/**
 * Convert PascalCase to kebab-case for story IDs.
 */
function toKebabCase(name) {
	return name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Generate storyId from component info and example name.
 */
function toStoryId(component, exampleName) {
	const titlePath = component.storybookTitle.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-");
	const storyName = toKebabCase(exampleName);
	return `${titlePath}--${storyName}`;
}

/**
 * Parse story exports from a story file to get story names and descriptions.
 */
function parseStoryFile(storyFile) {
	if (!existsSync(storyFile)) return [];

	const content = readFileSync(storyFile, "utf-8");
	const stories = [];

	// Match export const StoryName: Story = { ... }
	const storyRegex = /export\s+const\s+(\w+):\s*Story\s*=\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gs;
	let match;

	while ((match = storyRegex.exec(content)) !== null) {
		const exportName = match[1];
		const body = match[2];

		// Extract name if present (e.g., name: "With Input")
		const nameMatch = body.match(/name:\s*["']([^"']+)["']/);
		const displayName = nameMatch ? nameMatch[1] : exportName.replace(/([a-z])([A-Z])/g, "$1 $2");

		// Extract description if present
		const descMatch = body.match(/description:\s*\{[^}]*story:\s*["'`]([^"'`]+)["'`]/s);
		const description = descMatch ? descMatch[1].replace(/\s+/g, " ").trim() : "";

		stories.push({
			exportName,
			displayName,
			description,
		});
	}

	return stories;
}

/**
 * Generate documentation for a component that has examples.
 */
function generateComponentDocs(component) {
	const exports = getExampleExports(component.id);
	const stories = parseStoryFile(component.storyFile);

	// Match stories to examples
	const storyExamples = stories
		.filter((s) => exports.includes(s.exportName))
		.map((s) => ({
			name: s.displayName,
			export: s.exportName,
			storyId: toStoryId(component, s.exportName),
			description: s.description || getExampleDescription(component.id, s.exportName),
			code: readExampleSource(component.id, s.exportName),
		}));

	// Find overview example (first multi-example or "Default")
	const overviewExample =
		exports.find((e) => e.includes("All") || e.includes("Variants")) || exports.find((e) => e === "Default") || exports[0];

	// Find anatomy parts (simplified to just name + description)
	const anatomyExport = exports.find((e) => e === "Anatomy");
	const anatomy = anatomyExport
		? {
				parts: getAnatomyParts(component.id),
			}
		: undefined;

	// Find best practices (Do/Don't pairs)
	const bestPractices = getBestPractices(component.id, exports);

	return {
		id: component.id,
		name: component.name,
		group: component.group,
		storybookTitle: component.storybookTitle,
		component: {
			import: `@corensystem/coren-ui/${component.id}`,
			export: component.name,
		},
		summary: getSummary(component.id, component.storyFile),
		overviewExample,
		usage: getUsage(component.id, component.storyFile),
		import: `import { ${component.name} } from "@corensystem/coren-ui/${component.id}";`,
		anatomy,
		bestPractices,
		examples: storyExamples,
		props: [], // Will be populated by props extractor
	};
}

/**
 * Get summary from story file component description.
 */
function getSummary(componentId, storyFile) {
	if (!existsSync(storyFile)) return "";

	const content = readFileSync(storyFile, "utf-8");
	const match = content.match(/component:\s*["'`]([^"'`]+)["'`]/s);
	if (match) {
		// Take first sentence
		const firstSentence = match[1].split(/\.\s/)[0];
		return firstSentence.replace(/\*\*/g, "").trim() + ".";
	}
	return "";
}

/**
 * Get usage guidelines from story file or defaults.
 */
function getUsage(componentId, storyFile) {
	// Could be extracted from story file or component manifest
	return [];
}

/**
 * Get anatomy parts from example file comments.
 */
function getAnatomyParts(componentId) {
	const source = readExampleSource(componentId, "Anatomy");
	if (!source) return [];

	// Parse anatomy parts from structured comments
	const parts = [];
	const partRegex = /\/\*\s*@part\s+(\w+)\s*:\s*([^*]+)\*\//g;
	let match;

	while ((match = partRegex.exec(source)) !== null) {
		parts.push({
			name: match[1],
			description: match[2].trim(),
		});
	}

	// If no structured comments, return default parts based on component
	if (parts.length === 0) {
		return [
			{name: "Root", description: "The main container element."},
			{name: "Content", description: "The primary content area."},
		];
	}

	return parts;
}

/**
 * Get best practices (Do/Don't pairs) from examples.
 */
function getBestPractices(componentId, exports) {
	const practices = [];
	const doExports = exports.filter((e) => e.endsWith("Do") && !e.endsWith("Dont"));

	for (const doExport of doExports) {
		const baseName = doExport.replace(/Do$/, "");
		const dontExport = exports.find((e) => e === `${baseName}Dont`);

		if (dontExport) {
			practices.push({
				do: {
					text: getExampleDescription(componentId, doExport) || `Use ${baseName} pattern.`,
					example: doExport,
				},
				dont: {
					text: getExampleDescription(componentId, dontExport) || `Avoid ${baseName} anti-pattern.`,
					example: dontExport,
				},
			});
		}
	}

	return practices;
}

/**
 * Generate placeholder docs for a component without examples yet.
 */
function generatePlaceholderDocs(component) {
	return {
		id: component.id,
		name: component.name,
		group: component.group,
		storybookTitle: component.storybookTitle,
		component: {
			import: `@corensystem/coren-ui/${component.id}`,
			export: component.name,
		},
		summary: getSummary(component.id, component.storyFile) || `${component.name} component.`,
		overviewExample: null,
		usage: [],
		import: `import { ${component.name} } from "@corensystem/coren-ui/${component.id}";`,
		anatomy: undefined,
		bestPractices: [],
		examples: [],
		props: [],
		_placeholder: true,
	};
}

/**
 * Generate the component index.
 */
function generateIndex(components) {
	return components.map((c) => ({
		id: c.id,
		name: c.name,
		group: c.group,
		storybookTitle: c.storybookTitle,
	}));
}

// Main build
console.log("Building docs...");

// Discover all components
const allComponents = discoverComponents();
console.log(`  Discovered ${allComponents.length} components`);

// Ensure output directories exist
mkdirSync(DOCS_DIR, {recursive: true});

// Generate index with all components
const index = generateIndex(allComponents);
writeFileSync(join(DIST_DIR, "index.json"), JSON.stringify(index, null, "\t"));
console.log(`  Created dist/index.json (${index.length} components)`);

// Generate per-component docs
let withExamples = 0;
let placeholders = 0;

for (const component of allComponents) {
	let docs;
	if (component.hasExamples) {
		docs = generateComponentDocs(component);
		withExamples++;
	} else {
		docs = generatePlaceholderDocs(component);
		placeholders++;
	}
	writeFileSync(join(DOCS_DIR, `${component.id}.json`), JSON.stringify(docs, null, "\t"));
}

console.log(`  Created ${withExamples} component docs with examples`);
console.log(`  Created ${placeholders} placeholder docs`);
console.log("Done!");
