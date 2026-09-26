#!/usr/bin/env node
/**
 * Script to add anatomy documentation to component manifests.
 * Extracts component parts from source files.
 */

import {existsSync, readFileSync, readdirSync, writeFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MANIFESTS_DIR = resolve(ROOT, "manifests");

/**
 * Extract component parts from source file.
 */
function extractParts(content, componentName) {
	const parts = [];

	// Look for exported components that match pattern: ComponentNamePart
	const exportRegex = new RegExp(`export\\s+(?:const|function)\\s+(${componentName}\\w+)`, 'g');
	let match;
	while ((match = exportRegex.exec(content)) !== null) {
		const partName = match[1];
		// Skip the main component itself
		if (partName === componentName) continue;

		// Convert to readable name: ButtonGroup -> Group
		let displayName = partName.replace(componentName, '');
		if (displayName) {
			// Convert camelCase to words
			displayName = displayName.replace(/([A-Z])/g, ' $1').trim();
			parts.push({
				name: partName,
				description: `The ${displayName.toLowerCase()} element of the ${componentName}.`
			});
		}
	}

	// Look for Radix-style compound components: Component.Part = ...
	const compoundRegex = new RegExp(`${componentName}\\.(\\w+)\\s*=`, 'g');
	while ((match = compoundRegex.exec(content)) !== null) {
		const partName = match[1];
		if (!parts.some(p => p.name.endsWith(partName))) {
			parts.push({
				name: `${componentName}.${partName}`,
				description: `The ${partName.toLowerCase()} element of the ${componentName}.`
			});
		}
	}

	return parts;
}

/**
 * Generate default anatomy parts based on component type.
 */
function generateDefaultParts(manifest) {
	const name = manifest.name || manifest.id;
	const lowerName = name.toLowerCase();

	// Common patterns
	if (lowerName.includes('dialog') || lowerName.includes('modal')) {
		return [
			{name: `${name}Trigger`, description: "Element that opens the dialog when activated."},
			{name: `${name}Content`, description: "Container for the dialog content and overlay."},
			{name: `${name}Header`, description: "Header section containing title and description."},
			{name: `${name}Footer`, description: "Footer section for action buttons."},
		];
	}

	if (lowerName.includes('dropdown') || lowerName.includes('menu')) {
		return [
			{name: `${name}Trigger`, description: "Element that opens the menu when activated."},
			{name: `${name}Content`, description: "Container for menu items."},
			{name: `${name}Item`, description: "Individual selectable menu item."},
		];
	}

	if (lowerName.includes('card')) {
		return [
			{name: `${name}`, description: "Root container for the card."},
			{name: `${name}Header`, description: "Header section of the card."},
			{name: `${name}Content`, description: "Main content area of the card."},
		];
	}

	if (lowerName.includes('form') || lowerName.includes('field')) {
		return [
			{name: `${name}`, description: "Root container element."},
			{name: `${name}Label`, description: "Label element for accessibility."},
			{name: `${name}Input`, description: "Input element for user entry."},
		];
	}

	if (lowerName.includes('list')) {
		return [
			{name: `${name}`, description: "Root container for the list."},
			{name: `${name}Item`, description: "Individual list item element."},
		];
	}

	if (lowerName.includes('table')) {
		return [
			{name: `${name}`, description: "Root table container."},
			{name: `${name}Header`, description: "Table header row container."},
			{name: `${name}Body`, description: "Table body content container."},
			{name: `${name}Row`, description: "Individual table row."},
		];
	}

	if (lowerName.includes('tab')) {
		return [
			{name: `${name}List`, description: "Container for tab triggers."},
			{name: `${name}Trigger`, description: "Individual tab button."},
			{name: `${name}Content`, description: "Content panel for active tab."},
		];
	}

	// Default for simple components
	return [
		{name: name, description: `Root ${name} element.`},
		{name: `${name}Content`, description: `Content area of the ${name}.`},
	];
}

/**
 * Process a single manifest.
 */
function processManifest(manifestPath) {
	const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
	const componentName = manifest.name || manifest.id;

	// Skip if already has anatomy with parts
	if (manifest.docs?.anatomy?.parts && manifest.docs.anatomy.parts.length >= 2) {
		console.log(`  Skipping ${manifest.id} (already has anatomy)`);
		return false;
	}

	let parts = [];

	// Try to extract from source
	const sourcePath = manifest.source?.path;
	if (sourcePath) {
		const fullPath = resolve(ROOT, sourcePath);
		if (existsSync(fullPath)) {
			const content = readFileSync(fullPath, "utf-8");
			parts = extractParts(content, componentName);
		}
	}

	// Fall back to generated parts if none found
	if (parts.length < 2) {
		parts = generateDefaultParts(manifest);
	}

	// Ensure docs section exists
	if (!manifest.docs) {
		manifest.docs = {};
	}

	// Add anatomy
	manifest.docs.anatomy = {
		description: `${componentName} is composed of the following parts:`,
		parts: parts
	};

	// Write back
	writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t") + "\n");
	console.log(`  Updated ${manifest.id} with ${parts.length} anatomy parts`);
	return true;
}

// Main
console.log("Adding anatomy to manifests...\n");

const manifestFiles = readdirSync(MANIFESTS_DIR).filter(f => f.endsWith(".component.json") || f.endsWith(".pattern.json") || f.endsWith(".widget.json"));
let updated = 0;
let skipped = 0;

for (const file of manifestFiles) {
	const result = processManifest(join(MANIFESTS_DIR, file));
	if (result) updated++;
	else skipped++;
}

console.log(`\nDone! Updated ${updated}, skipped ${skipped}`);
