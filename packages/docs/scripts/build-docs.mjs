#!/usr/bin/env node
/**
 * Build script for generating documentation JSON files.
 *
 * Generates:
 * - dist/index.json - Component index with id, name, group, storybookTitle
 * - dist/docs/{id}.json - Per-component documentation with full schema
 *
 * Uses:
 * - manifests/*.component.json for summary, usage, anatomy, bestPractices
 * - react-docgen-typescript for props extraction
 * - Storybook stories for example matching
 */

import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {parse as parseProps} from "react-docgen-typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MONOREPO_ROOT = resolve(ROOT, "../..");
const STORYBOOK_DIR = resolve(MONOREPO_ROOT, "apps/storybook/stories");
const MANIFESTS_DIR = resolve(MONOREPO_ROOT, "manifests");
const COMPONENTS_DIR = resolve(MONOREPO_ROOT, "packages/components/src");
const EXAMPLES_DIR = resolve(ROOT, "src/examples");
const DIST_DIR = resolve(ROOT, "dist");
const DOCS_DIR = resolve(DIST_DIR, "docs");

// Load coren-ui exports to validate import paths
const corenUiPkg = JSON.parse(readFileSync(resolve(MONOREPO_ROOT, "packages/components/package.json"), "utf-8"));
const COREN_UI_EXPORTS = new Set(Object.keys(corenUiPkg.exports || {}).map(e => e.replace(/^\.\//, "")));

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
 * Load all component manifests.
 */
function loadManifests() {
	const manifests = new Map();
	if (!existsSync(MANIFESTS_DIR)) return manifests;

	const files = readdirSync(MANIFESTS_DIR).filter(f => f.endsWith(".component.json"));
	for (const file of files) {
		try {
			const manifest = JSON.parse(readFileSync(join(MANIFESTS_DIR, file), "utf-8"));
			manifests.set(manifest.id, manifest);
		} catch (e) {
			console.warn(`  Warning: could not parse ${file}: ${e.message}`);
		}
	}
	return manifests;
}

/**
 * Extract props from component TypeScript source using react-docgen-typescript.
 */
function extractProps(componentId, componentName, manifestSource) {
	// Try to find the source file
	let sourcePath = null;

	if (manifestSource?.path) {
		sourcePath = resolve(MONOREPO_ROOT, manifestSource.path);
	} else {
		// Try common patterns
		const patterns = [
			join(COMPONENTS_DIR, `${componentId}.tsx`),
			join(COMPONENTS_DIR, `${componentId}/index.tsx`),
			join(COMPONENTS_DIR, `${componentId}/${componentId}.tsx`),
		];
		for (const p of patterns) {
			if (existsSync(p)) {
				sourcePath = p;
				break;
			}
		}
	}

	if (!sourcePath || !existsSync(sourcePath)) {
		return [];
	}

	// List of HTML/React inherited props to exclude
	const INHERITED_PROPS = new Set([
		// HTML attributes
		"id", "className", "style", "title", "lang", "dir", "hidden", "tabIndex", "accessKey",
		"contentEditable", "draggable", "spellCheck", "translate", "slot", "about", "datatype",
		"inlist", "prefix", "property", "resource", "typeof", "vocab", "autoCapitalize",
		"autoCorrect", "autoSave", "color", "itemProp", "itemScope", "itemType", "itemID",
		"itemRef", "results", "security", "unselectable", "inputMode", "is", "nonce", "popover",
		"popoverTarget", "popoverTargetAction", "enterKeyHint", "writingSuggestions", "role",
		// ARIA attributes (all aria-*)
		// Event handlers
		"onCopy", "onCopyCapture", "onCut", "onCutCapture", "onPaste", "onPasteCapture",
		"onCompositionEnd", "onCompositionEndCapture", "onCompositionStart", "onCompositionStartCapture",
		"onCompositionUpdate", "onCompositionUpdateCapture", "onFocus", "onFocusCapture",
		"onBlur", "onBlurCapture", "onChange", "onChangeCapture", "onBeforeInput", "onBeforeInputCapture",
		"onInput", "onInputCapture", "onReset", "onResetCapture", "onSubmit", "onSubmitCapture",
		"onInvalid", "onInvalidCapture", "onLoad", "onLoadCapture", "onError", "onErrorCapture",
		"onKeyDown", "onKeyDownCapture", "onKeyPress", "onKeyPressCapture", "onKeyUp", "onKeyUpCapture",
		"onClick", "onClickCapture", "onContextMenu", "onContextMenuCapture", "onDoubleClick",
		"onDoubleClickCapture", "onDrag", "onDragCapture", "onDragEnd", "onDragEndCapture",
		"onDragEnter", "onDragEnterCapture", "onDragExit", "onDragExitCapture", "onDragLeave",
		"onDragLeaveCapture", "onDragOver", "onDragOverCapture", "onDragStart", "onDragStartCapture",
		"onDrop", "onDropCapture", "onMouseDown", "onMouseDownCapture", "onMouseEnter",
		"onMouseLeave", "onMouseMove", "onMouseMoveCapture", "onMouseOut", "onMouseOutCapture",
		"onMouseOver", "onMouseOverCapture", "onMouseUp", "onMouseUpCapture", "onSelect",
		"onSelectCapture", "onTouchCancel", "onTouchCancelCapture", "onTouchEnd", "onTouchEndCapture",
		"onTouchMove", "onTouchMoveCapture", "onTouchStart", "onTouchStartCapture", "onPointerDown",
		"onPointerDownCapture", "onPointerMove", "onPointerMoveCapture", "onPointerUp",
		"onPointerUpCapture", "onPointerCancel", "onPointerCancelCapture", "onPointerEnter",
		"onPointerLeave", "onPointerOver", "onPointerOverCapture", "onPointerOut",
		"onPointerOutCapture", "onGotPointerCapture", "onGotPointerCaptureCapture",
		"onLostPointerCapture", "onLostPointerCaptureCapture", "onScroll", "onScrollCapture",
		"onScrollEnd", "onScrollEndCapture", "onWheel", "onWheelCapture", "onAnimationStart",
		"onAnimationStartCapture", "onAnimationEnd", "onAnimationEndCapture", "onAnimationIteration",
		"onAnimationIterationCapture", "onTransitionEnd", "onTransitionEndCapture", "onToggle",
		// React internal
		"ref", "key", "dangerouslySetInnerHTML", "defaultChecked", "defaultValue", "suppressContentEditableWarning",
		"suppressHydrationWarning",
	]);

	try {
		const result = parseProps(sourcePath, {
			savePropValueAsString: true,
			shouldExtractLiteralValuesFromEnum: true,
			shouldRemoveUndefinedFromOptional: true,
		});

		// Find the component by name
		const componentDoc = result.find(c => c.displayName === componentName);
		if (!componentDoc) return [];

		const props = [];
		let hasInheritedProps = false;

		for (const [name, prop] of Object.entries(componentDoc.props || {})) {
			// Skip internal props
			if (name.startsWith("_")) continue;

			// Skip aria-* attributes
			if (name.startsWith("aria")) {
				hasInheritedProps = true;
				continue;
			}

			// Skip inherited HTML/React props
			if (INHERITED_PROPS.has(name)) {
				hasInheritedProps = true;
				continue;
			}

			let type = prop.type?.name || "unknown";

			// Format union types properly
			if (prop.type?.name === "enum" && prop.type?.value) {
				const values = prop.type.value.map(v => v.value).filter(Boolean);
				if (values.length > 0) {
					type = values.join(" | ");
				}
			}

			props.push({
				name,
				type,
				default: prop.defaultValue?.value || undefined,
				required: prop.required || false,
				description: prop.description || "",
			});
		}

		// Keep only key component props: variant, children, className, asChild, etc.
		// Add className and children if they exist in the component
		const componentProps = props.filter(p =>
			["variant", "size", "children", "className", "asChild", "disabled", "required",
			 "open", "onOpenChange", "defaultOpen", "value", "onValueChange", "defaultValue",
			 "checked", "onCheckedChange", "defaultChecked", "selected", "onSelect",
			 "orientation", "side", "align", "sideOffset", "alignOffset", "collapsible",
			 "type", "name", "placeholder", "autoFocus", "readOnly", "max", "min", "step"].includes(p.name) ||
			// Keep props with descriptions (they're documented)
			p.description.length > 0 ||
			// Keep props that aren't standard HTML
			!INHERITED_PROPS.has(p.name)
		);

		// Add ...props row for inherited HTML props
		if (hasInheritedProps || componentProps.length > 0) {
			componentProps.push({
				name: "...props",
				type: `React.HTMLAttributes<HTMLElement>`,
				required: false,
				description: "All standard HTML attributes are supported.",
			});
		}

		return componentProps;
	} catch (e) {
		console.warn(`  Warning: could not extract props for ${componentId}: ${e.message}`);
		return [];
	}
}

/**
 * Discover all components from Storybook stories.
 */
function discoverComponents() {
	const components = [];

	for (const [group, prefix] of Object.entries(COMPONENT_GROUPS)) {
		const groupDir = join(STORYBOOK_DIR, group);
		if (!existsSync(groupDir)) continue;

		const files = readdirSync(groupDir).filter(f => f.endsWith(".stories.tsx"));
		for (const file of files) {
			const name = file.replace(".stories.tsx", "");
			// Convert PascalCase to kebab-case for id
			const id = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

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

	// Match export const StoryName: Story = { ... } or export const StoryName: Story = () => ...
	const storyRegex = /export\s+const\s+(\w+):\s*Story\s*=/g;
	let match;

	while ((match = storyRegex.exec(content)) !== null) {
		const exportName = match[1];

		// Extract the full story object/function to get metadata
		const startIdx = match.index;
		let depth = 0;
		let foundStart = false;
		let endIdx = startIdx;

		for (let i = startIdx; i < content.length; i++) {
			if (content[i] === "{" || content[i] === "(") {
				depth++;
				foundStart = true;
			} else if (content[i] === "}" || content[i] === ")") {
				depth--;
				if (foundStart && depth === 0) {
					endIdx = i + 1;
					break;
				}
			} else if (content[i] === ";" && !foundStart) {
				endIdx = i;
				break;
			}
		}

		const body = content.slice(startIdx, endIdx);

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
 * Get the correct import path for a component from coren-ui exports.
 */
function getComponentImport(componentId, manifest) {
	// First check manifest
	if (manifest?.source?.import) {
		const subpath = manifest.source.import.replace("@corensystem/coren-ui/", "");
		if (COREN_UI_EXPORTS.has(subpath) || COREN_UI_EXPORTS.has(`./${subpath}`)) {
			return manifest.source.import;
		}
	}

	// Try the component id directly
	if (COREN_UI_EXPORTS.has(componentId)) {
		return `@corensystem/coren-ui/${componentId}`;
	}

	// Try without hyphens (e.g., buttongroup -> button-group is not in exports)
	const noHyphens = componentId.replace(/-/g, "");
	if (COREN_UI_EXPORTS.has(noHyphens)) {
		return `@corensystem/coren-ui/${noHyphens}`;
	}

	// Fallback - this may not exist but we'll flag it in check
	return `@corensystem/coren-ui/${componentId}`;
}

/**
 * Generate documentation for a component that has examples.
 */
function generateComponentDocs(component, manifest) {
	const exports = getExampleExports(component.id);
	const stories = parseStoryFile(component.storyFile);

	// Match stories to examples
	const storyExamples = stories
		.filter(s => exports.includes(s.exportName))
		.map(s => ({
			name: s.displayName,
			export: s.exportName,
			storyId: toStoryId(component, s.exportName),
			description: s.description || getExampleDescription(component.id, s.exportName),
			code: readExampleSource(component.id, s.exportName),
		}));

	// Find overview example
	const overviewExample =
		exports.find(e => e.includes("All") || e.includes("Variants")) ||
		exports.find(e => e === "Default") ||
		exports[0];

	// Get anatomy from manifest or generate from parts
	let anatomy = undefined;
	if (manifest?.docs?.anatomy?.parts && manifest.docs.anatomy.parts.length > 0) {
		anatomy = {
			example: exports.includes("Anatomy") ? "Anatomy" : undefined,
			parts: manifest.docs.anatomy.parts,
		};
	} else if (exports.includes("Anatomy")) {
		// Parse anatomy from example file comments
		const parts = getAnatomyParts(component.id);
		if (parts.length >= 2) {
			anatomy = {example: "Anatomy", parts};
		}
	}

	// Get best practices from manifest
	let bestPractices = [];
	if (manifest?.docs?.bestPractices && manifest.docs.bestPractices.length > 0) {
		bestPractices = manifest.docs.bestPractices.map((bp, idx) => {
			// Find matching Do/Dont exports
			const doExports = exports.filter(e => e.endsWith("Do") && !e.endsWith("Dont"));
			const dontExports = exports.filter(e => e.endsWith("Dont"));

			return {
				do: {
					text: bp.do,
					example: doExports[idx] || doExports[0],
				},
				dont: {
					text: bp.dont,
					example: dontExports[idx] || dontExports[0],
				},
			};
		});
	} else {
		// Generate from Do/Dont example pairs
		bestPractices = getBestPractices(component.id, exports);
	}

	// Get summary and usage from manifest
	const summary = manifest?.docs?.summary || manifest?.intent || getSummaryFromStory(component.storyFile);
	const usage = manifest?.docs?.usage || generateUsageFromManifest(manifest) || [];

	// Get component import path
	const componentImport = getComponentImport(component.id, manifest);
	const componentExport = manifest?.source?.export || component.name;

	// Use props from manifest if available, otherwise extract from source
	const props = manifest?.docs?.props || extractProps(component.id, componentExport, manifest?.source);

	return {
		id: component.id,
		name: component.name,
		group: component.group,
		storybookTitle: component.storybookTitle,
		summary,
		overviewExample,
		usage,
		import: `import { ${componentExport} } from "${componentImport}";`,
		component: {
			import: componentImport,
			export: componentExport,
		},
		anatomy,
		bestPractices,
		examples: storyExamples,
		props,
	};
}

/**
 * Get summary from story file component description.
 */
function getSummaryFromStory(storyFile) {
	if (!existsSync(storyFile)) return "";

	const content = readFileSync(storyFile, "utf-8");
	const match = content.match(/component:\s*["'`]([^"'`]+)["'`]/s);
	if (match) {
		const firstSentence = match[1].split(/\.\s/)[0];
		return firstSentence.replace(/\*\*/g, "").trim() + ".";
	}
	return "";
}

/**
 * Generate usage paragraphs from manifest data.
 */
function generateUsageFromManifest(manifest) {
	if (!manifest) return [];

	const usage = [];

	// Generate "when to use" paragraph
	if (manifest.when && manifest.when.length > 0) {
		const whenText = `Use ${manifest.name} for ${manifest.when.join(", ").toLowerCase()}.`;
		usage.push(whenText);
	}

	// Generate "when not to use" paragraph from chooseOver
	if (manifest.chooseOver && manifest.chooseOver.length > 0) {
		const alternatives = manifest.chooseOver
			.map(c => `${c.component} (${c.because.toLowerCase()})`)
			.join("; ");
		usage.push(`Consider alternatives: ${alternatives}.`);
	}

	return usage;
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

	return parts;
}

/**
 * Get best practices (Do/Don't pairs) from examples.
 */
function getBestPractices(componentId, exports) {
	const practices = [];
	const doExports = exports.filter(e => e.endsWith("Do") && !e.endsWith("Dont"));

	for (const doExport of doExports) {
		const baseName = doExport.replace(/Do$/, "");
		const dontExport = exports.find(e => e === `${baseName}Dont`);

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
function generatePlaceholderDocs(component, manifest) {
	const summary = manifest?.docs?.summary || manifest?.intent || `${component.name} component.`;
	const componentImport = getComponentImport(component.id, manifest);
	const componentExport = manifest?.source?.export || component.name;

	return {
		id: component.id,
		name: component.name,
		group: component.group,
		storybookTitle: component.storybookTitle,
		summary,
		overviewExample: null,
		usage: manifest?.docs?.usage || generateUsageFromManifest(manifest) || [],
		import: `import { ${componentExport} } from "${componentImport}";`,
		component: {
			import: componentImport,
			export: componentExport,
		},
		anatomy: undefined,
		bestPractices: [],
		examples: [],
		props: manifest?.docs?.props || extractProps(component.id, componentExport, manifest?.source),
		_placeholder: true,
	};
}

/**
 * Generate the component index (only complete components).
 */
function generateIndex(components, manifests) {
	return components
		.filter(c => c.hasExamples) // Only include components with examples
		.map(c => ({
			id: c.id,
			name: c.name,
			group: c.group,
			storybookTitle: c.storybookTitle,
		}));
}

// Main build
console.log("Building docs...");

// Load manifests
const manifests = loadManifests();
console.log(`  Loaded ${manifests.size} manifests`);

// Discover all components
const allComponents = discoverComponents();
console.log(`  Discovered ${allComponents.length} components from Storybook`);

// Ensure output directories exist
mkdirSync(DOCS_DIR, {recursive: true});

// Generate per-component docs
let withExamples = 0;
let placeholders = 0;

for (const component of allComponents) {
	const manifest = manifests.get(component.id);
	let docs;

	if (component.hasExamples) {
		docs = generateComponentDocs(component, manifest);
		withExamples++;
	} else {
		docs = generatePlaceholderDocs(component, manifest);
		placeholders++;
	}

	writeFileSync(join(DOCS_DIR, `${component.id}.json`), JSON.stringify(docs, null, "\t"));
}

// Generate index with only complete components
const index = generateIndex(allComponents, manifests);
writeFileSync(join(DIST_DIR, "index.json"), JSON.stringify(index, null, "\t"));

console.log(`  Created dist/index.json (${index.length} complete components)`);
console.log(`  Created ${withExamples} component docs with examples`);
console.log(`  Created ${placeholders} placeholder docs`);
console.log("Done!");
