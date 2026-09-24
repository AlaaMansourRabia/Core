#!/usr/bin/env node
/**
 * Build script for generating documentation JSON files.
 *
 * Generates:
 * - dist/index.json - Component index
 * - dist/docs/{id}.json - Per-component documentation
 */

import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MANIFESTS_DIR = resolve(ROOT, "../../manifests");
const EXAMPLES_DIR = resolve(ROOT, "src/examples");
const DIST_DIR = resolve(ROOT, "dist");
const DOCS_DIR = resolve(DIST_DIR, "docs");

// Components to generate docs for (pilot: badge and label)
const PILOT_COMPONENTS = ["badge", "label"];

// Storybook title prefix for components
const STORYBOOK_PREFIX = "Components/Primitives";

/**
 * Read a manifest file and return parsed JSON.
 */
function readManifest(id) {
	const manifestPath = join(MANIFESTS_DIR, `${id}.component.json`);
	if (!existsSync(manifestPath)) {
		console.warn(`Warning: Manifest not found for ${id}`);
		return null;
	}
	return JSON.parse(readFileSync(manifestPath, "utf-8"));
}

/**
 * Read example source file and return formatted code.
 */
function readExampleSource(componentId, exampleName) {
	const examplePath = join(EXAMPLES_DIR, componentId, `${exampleName}.tsx`);
	if (!existsSync(examplePath)) {
		console.warn(`Warning: Example not found: ${examplePath}`);
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
 * Convert PascalCase to kebab-case for story IDs.
 */
function toStoryId(name, componentId) {
	const kebab = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
	return `components-primitives-${componentId}--${kebab}`;
}

/**
 * Generate documentation for Badge component.
 */
function generateBadgeDocs(manifest) {
	const examples = getExampleExports("badge");
	const storyExamples = [
		"Default",
		"Secondary",
		"Destructive",
		"Outline",
		"AllVariants",
		"SemanticColors",
		"Soft",
		"SeverityScale",
		"StatusSemantics",
		"WithIcon",
		"CountBadge",
		"WhenNotToUse",
	];

	return {
		id: "badge",
		name: "Badge",
		group: "Primitives",
		storybookTitle: `${STORYBOOK_PREFIX}/Badge`,
		summary: "A small, static status or label descriptor. Use for labeling status, category, or count next to content.",
		overviewExample: "AllVariants",
		usage: [
			"Use Badge to display static status indicators, counts, or category labels on cards, table rows, or navigation items.",
			"Choose a variant by meaning (success for positive states, destructive for errors) rather than by color preference. Badge is non-interactive; for clickable or removable pills, use Chip instead.",
		],
		import: 'import { Badge } from "@corensystem/coren-ui/badge";',
		anatomy: {
			example: "Anatomy",
			parts: [
				{
					name: "Container",
					description: "The badge wrapper with rounded corners, border, and background color based on variant.",
					selector: "[class*='wwc:inline-flex']",
					placement: "left",
				},
				{
					name: "Leading icon",
					description: "Optional icon placed before the label text. Should be small (size-3) and reinforce the status meaning.",
					selector: "svg",
					placement: "left",
				},
				{
					name: "Label text",
					description: "The text content of the badge. Keep it short — one or two words maximum.",
					selector: "span, text content",
					placement: "left",
				},
			],
		},
		bestPractices: [
			{
				do: {
					text: "Use a small icon that reinforces the badge meaning. Keep labels short.",
					example: "IconDo",
				},
				dont: {
					text: "Avoid multiple icons or long text that makes the badge hard to scan.",
					example: "IconDont",
				},
			},
			{
				do: {
					text: "Use Badge for static display labels that describe status or category.",
					example: "InteractiveDo",
				},
				dont: {
					text: "Avoid adding click handlers or remove buttons to Badge. Use Chip for interactive elements.",
					example: "InteractiveDont",
				},
			},
		],
		examples: storyExamples.map((name) => ({
			name: name.replace(/([a-z])([A-Z])/g, "$1 $2"),
			export: name,
			storyId: toStoryId(name, "badge"),
			description: getExampleDescription("badge", name),
			code: readExampleSource("badge", name),
		})),
		props: [
			{
				name: "variant",
				type: '"default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "successSoft" | "warningSoft" | "dangerSoft" | "infoSoft" | "neutralSoft"',
				default: '"default"',
				required: false,
				description: "Visual style variant. Choose by meaning: success for positive, destructive for errors, soft variants for subtle indicators.",
			},
			{
				name: "children",
				type: "React.ReactNode",
				default: undefined,
				required: true,
				description: "Badge content — typically short text, optionally with a leading icon.",
			},
			{
				name: "className",
				type: "string",
				default: undefined,
				required: false,
				description: "Additional CSS classes to apply to the badge container.",
			},
			{
				name: "...props",
				type: "React.HTMLAttributes<HTMLDivElement>",
				default: undefined,
				required: false,
				description: "All standard HTML div attributes are supported.",
			},
		],
	};
}

/**
 * Generate documentation for Label component.
 */
function generateLabelDocs(manifest) {
	const storyExamples = ["Default", "WithInput", "Required", "PeerDisabled"];

	return {
		id: "label",
		name: "Label",
		group: "Primitives",
		storybookTitle: `${STORYBOOK_PREFIX}/Label`,
		summary: "An accessible label bound to a form control. Essential for usability and screen reader support.",
		overviewExample: "WithInput",
		usage: [
			"Always pair form controls with a Label using htmlFor/id binding. This ensures clicking the label focuses the input and screen readers announce the relationship.",
			"Use the required prop to show an asterisk for required fields. Also mark the input itself required so assistive tech is informed. Keep labels short and put additional guidance in help text below the input.",
		],
		import: 'import { Label } from "@corensystem/coren-ui/label";',
		anatomy: {
			example: "Anatomy",
			parts: [
				{
					name: "Label",
					description: "The text element that names the form control.",
					selector: "label",
					placement: "left",
				},
				{
					name: "Required mark",
					description: "Decorative asterisk shown when required prop is true. The control carries the actual semantics.",
					selector: "label > span[aria-hidden]",
					placement: "top",
				},
				{
					name: "Associated control",
					description: "The form input or control bound via htmlFor/id.",
					selector: "input",
					placement: "left",
				},
			],
		},
		bestPractices: [
			{
				do: {
					text: "Bind the label to its control using htmlFor and id. This ensures clicking the label focuses the input.",
					example: "BindDo",
				},
				dont: {
					text: "Avoid placeholder-only inputs without a visible label. Screen readers and users need persistent labels.",
					example: "BindDont",
				},
			},
			{
				do: {
					text: "Use the required prop on Label and required attribute on Input for accessible required fields.",
					example: "RequiredDo",
				},
				dont: {
					text: "Avoid typing asterisks manually. Use the required prop for consistent styling.",
					example: "RequiredDont",
				},
			},
		],
		examples: storyExamples.map((name) => ({
			name: name.replace(/([a-z])([A-Z])/g, "$1 $2"),
			export: name,
			storyId: toStoryId(name, "label"),
			description: getExampleDescription("label", name),
			code: readExampleSource("label", name),
		})),
		props: [
			{
				name: "required",
				type: "boolean",
				default: "false",
				required: false,
				description: "Append a required-field asterisk after the label text. The asterisk is decorative (aria-hidden) — also mark the control itself required.",
			},
			{
				name: "htmlFor",
				type: "string",
				default: undefined,
				required: false,
				description: "The id of the form control this label is associated with.",
			},
			{
				name: "children",
				type: "React.ReactNode",
				default: undefined,
				required: true,
				description: "Label text content.",
			},
			{
				name: "className",
				type: "string",
				default: undefined,
				required: false,
				description: "Additional CSS classes to apply to the label.",
			},
			{
				name: "...props",
				type: "React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>",
				default: undefined,
				required: false,
				description: "All Radix Label primitive props are supported.",
			},
		],
	};
}

/**
 * Get description for an example based on its docstring.
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
 * Generate the component index.
 */
function generateIndex() {
	return PILOT_COMPONENTS.map((id) => {
		const manifest = readManifest(id);
		return {
			id,
			name: manifest?.name || id.charAt(0).toUpperCase() + id.slice(1),
			group: "Primitives",
			storybookTitle: `${STORYBOOK_PREFIX}/${manifest?.name || id.charAt(0).toUpperCase() + id.slice(1)}`,
		};
	});
}

// Main build
console.log("Building docs...");

// Ensure output directories exist
mkdirSync(DOCS_DIR, {recursive: true});

// Generate index
const index = generateIndex();
writeFileSync(join(DIST_DIR, "index.json"), JSON.stringify(index, null, "\t"));
console.log(`  Created dist/index.json (${index.length} components)`);

// Generate per-component docs
for (const id of PILOT_COMPONENTS) {
	const manifest = readManifest(id);
	let docs;
	if (id === "badge") {
		docs = generateBadgeDocs(manifest);
	} else if (id === "label") {
		docs = generateLabelDocs(manifest);
	} else {
		console.warn(`No docs generator for ${id}`);
		continue;
	}
	writeFileSync(join(DOCS_DIR, `${id}.json`), JSON.stringify(docs, null, "\t"));
	console.log(`  Created dist/docs/${id}.json`);
}

console.log("Done!");
