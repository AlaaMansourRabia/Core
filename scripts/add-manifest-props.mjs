#!/usr/bin/env node
/**
 * Script to add props definitions to component manifests.
 * Extracts props from component TypeScript sources using regex patterns.
 */

import {existsSync, readFileSync, readdirSync, writeFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MANIFESTS_DIR = resolve(ROOT, "manifests");
const COMPONENTS_DIR = resolve(ROOT, "packages/components/src");

// Common props that most components share
const COMMON_PROPS = {
	className: {
		name: "className",
		type: "string",
		required: false,
		description: "Additional CSS classes to apply."
	},
	children: {
		name: "children",
		type: "React.ReactNode",
		required: false,
		description: "Child elements to render."
	},
	asChild: {
		name: "asChild",
		type: "boolean",
		default: "false",
		required: false,
		description: "Render as child element, merging props and behavior."
	},
	disabled: {
		name: "disabled",
		type: "boolean",
		default: "false",
		required: false,
		description: "Whether the component is disabled."
	},
};

// Prop type mappings for common patterns
const TYPE_MAPPINGS = {
	"React.ReactNode": "React.ReactNode",
	"ReactNode": "React.ReactNode",
	"string": "string",
	"number": "number",
	"boolean": "boolean",
	"() => void": "() => void",
	"React.MouseEventHandler": "React.MouseEventHandler",
};

/**
 * Extract variant values from cva definition.
 */
function extractVariants(content, variantName = "variant") {
	// Match variants object in cva
	const cvaMatch = content.match(/cva\s*\([^,]+,\s*\{[\s\S]*?variants:\s*\{([\s\S]*?)\}\s*,?\s*defaultVariants/);
	if (!cvaMatch) return null;

	const variantsBlock = cvaMatch[1];

	// Find the specific variant
	const variantRegex = new RegExp(`${variantName}:\\s*\\{([^}]+)\\}`, 's');
	const variantMatch = variantsBlock.match(variantRegex);
	if (!variantMatch) return null;

	// Extract variant keys
	const keys = [];
	const keyRegex = /(\w+):\s*["'`]/g;
	let match;
	while ((match = keyRegex.exec(variantMatch[1])) !== null) {
		keys.push(`"${match[1]}"`);
	}

	return keys.length > 0 ? keys.join(" | ") : null;
}

/**
 * Extract default variant value.
 */
function extractDefaultVariant(content, variantName = "variant") {
	const defaultMatch = content.match(new RegExp(`defaultVariants:\\s*\\{[^}]*${variantName}:\\s*["']([^"']+)["']`));
	return defaultMatch ? `"${defaultMatch[1]}"` : undefined;
}

/**
 * Extract props from interface definition.
 */
function extractInterfaceProps(content, componentName) {
	const props = [];

	// Find interface definition
	const interfaceRegex = new RegExp(`interface\\s+${componentName}Props[^{]*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`, 's');
	const interfaceMatch = content.match(interfaceRegex);

	if (interfaceMatch) {
		const propsBlock = interfaceMatch[1];

		// Extract individual props with JSDoc
		const propRegex = /(?:\/\*\*\s*([\s\S]*?)\s*\*\/\s*)?(\w+)(\?)?:\s*([^;]+);/g;
		let match;

		while ((match = propRegex.exec(propsBlock)) !== null) {
			const description = match[1] ? match[1].replace(/\s*\*\s*/g, ' ').trim() : "";
			const name = match[2];
			const optional = match[3] === "?";
			let type = match[4].trim();

			// Skip inherited HTML props
			if (name.startsWith("on") && name.length > 2 && name[2] === name[2].toUpperCase()) continue;
			if (["ref", "key", "style", "id", "role", "tabIndex", "className"].includes(name)) continue;

			// Clean up type
			type = type.replace(/\s+/g, ' ');

			props.push({
				name,
				type,
				required: !optional,
				description,
			});
		}
	}

	return props;
}

/**
 * Generate props for a component based on its source.
 */
function generateProps(manifest) {
	const sourcePath = manifest.source?.path;
	if (!sourcePath) return null;

	const fullPath = resolve(ROOT, sourcePath);
	if (!existsSync(fullPath)) return null;

	const content = readFileSync(fullPath, "utf-8");
	const componentName = manifest.source?.export || manifest.name;

	const props = [];

	// Extract variant prop if cva is used
	const variantType = extractVariants(content, "variant");
	if (variantType) {
		props.push({
			name: "variant",
			type: variantType,
			default: extractDefaultVariant(content, "variant"),
			required: false,
			description: "Visual style variant."
		});
	}

	// Extract size prop if exists
	const sizeType = extractVariants(content, "size");
	if (sizeType) {
		props.push({
			name: "size",
			type: sizeType,
			default: extractDefaultVariant(content, "size"),
			required: false,
			description: "Size variant."
		});
	}

	// Extract props from interface
	const interfaceProps = extractInterfaceProps(content, componentName);
	for (const prop of interfaceProps) {
		// Don't duplicate variant/size
		if (props.some(p => p.name === prop.name)) continue;
		props.push(prop);
	}

	// Add common props if component uses them
	if (content.includes("className") && !props.some(p => p.name === "className")) {
		props.push(COMMON_PROPS.className);
	}
	if (content.includes("children") && !props.some(p => p.name === "children")) {
		props.push({...COMMON_PROPS.children, required: true});
	}
	if (content.includes("asChild") && !props.some(p => p.name === "asChild")) {
		props.push(COMMON_PROPS.asChild);
	}
	if (content.includes("disabled") && !props.some(p => p.name === "disabled")) {
		props.push(COMMON_PROPS.disabled);
	}

	// Add ...props if component spreads props
	if (content.includes("...props")) {
		// Determine the element type
		let elementType = "HTMLElement";
		if (content.includes("HTMLDivElement")) elementType = "HTMLDivElement";
		else if (content.includes("HTMLButtonElement")) elementType = "HTMLButtonElement";
		else if (content.includes("HTMLInputElement")) elementType = "HTMLInputElement";
		else if (content.includes("HTMLSpanElement")) elementType = "HTMLSpanElement";

		props.push({
			name: "...props",
			type: `React.HTMLAttributes<${elementType}>`,
			required: false,
			description: "All standard HTML attributes are supported."
		});
	}

	return props.length > 0 ? props : null;
}

/**
 * Process a single manifest.
 */
function processManifest(manifestPath) {
	const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

	// Skip if already has props
	if (manifest.docs?.props && manifest.docs.props.length > 0) {
		console.log(`  Skipping ${manifest.id} (already has props)`);
		return false;
	}

	// Generate props
	const props = generateProps(manifest);
	if (!props) {
		console.log(`  Skipping ${manifest.id} (no source or no props found)`);
		return false;
	}

	// Ensure docs section exists
	if (!manifest.docs) {
		manifest.docs = {};
	}

	// Add props
	manifest.docs.props = props;

	// Write back
	writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t") + "\n");
	console.log(`  Updated ${manifest.id} with ${props.length} props`);
	return true;
}

// Main
console.log("Adding props to manifests...\n");

const manifestFiles = readdirSync(MANIFESTS_DIR).filter(f => f.endsWith(".component.json") || f.endsWith(".pattern.json") || f.endsWith(".widget.json"));
let updated = 0;
let skipped = 0;

for (const file of manifestFiles) {
	const result = processManifest(join(MANIFESTS_DIR, file));
	if (result) updated++;
	else skipped++;
}

console.log(`\nDone! Updated ${updated}, skipped ${skipped}`);
