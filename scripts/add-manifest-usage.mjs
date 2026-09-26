#!/usr/bin/env node
/**
 * Script to add usage documentation to component manifests.
 * Generates usage text based on component name and summary.
 */

import {readFileSync, readdirSync, writeFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MANIFESTS_DIR = resolve(ROOT, "manifests");

// Component category patterns for generating usage
const CATEGORY_PATTERNS = {
	feedback: ["alert", "toast", "notification", "banner", "snackbar", "error", "warning", "info", "success"],
	input: ["input", "field", "textarea", "select", "checkbox", "radio", "switch", "toggle", "slider", "picker", "combobox"],
	navigation: ["nav", "menu", "breadcrumb", "tab", "sidebar", "drawer", "link", "pagination"],
	layout: ["grid", "flex", "stack", "container", "card", "panel", "section", "divider", "separator", "spacer"],
	overlay: ["dialog", "modal", "popover", "tooltip", "dropdown", "sheet", "overlay"],
	display: ["avatar", "badge", "chip", "tag", "label", "icon", "image", "video"],
	action: ["button", "action", "fab", "icon-button"],
	data: ["table", "list", "tree", "chart", "graph", "data"],
	form: ["form", "field-group", "fieldset"],
};

/**
 * Detect component category from name.
 */
function detectCategory(name) {
	const lowerName = name.toLowerCase();
	for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
		if (patterns.some(p => lowerName.includes(p))) {
			return category;
		}
	}
	return "general";
}

/**
 * Generate usage paragraphs based on component info.
 */
function generateUsage(manifest) {
	const name = manifest.name || manifest.id;
	const summary = manifest.docs?.summary || "";
	const category = detectCategory(name);

	// Base usage templates by category
	const usageTemplates = {
		feedback: [
			`Use ${name} to communicate important information, status updates, or feedback to users. This component is designed to draw attention to messages that require user awareness or action.`,
			`${name} works well for transient notifications, validation messages, and system status indicators. Avoid using it for content that should persist on the page or for non-critical information that doesn't require immediate attention.`
		],
		input: [
			`Use ${name} when you need to collect user input or allow users to make selections. This component provides a consistent interaction pattern that users will find familiar and accessible.`,
			`${name} should be used within forms or interactive interfaces where user data collection is required. Ensure proper labeling and validation feedback for accessibility. Avoid using this component for read-only or display-only content.`
		],
		navigation: [
			`Use ${name} to help users navigate through your application or content hierarchy. This component provides clear wayfinding and helps users understand their current location within the interface.`,
			`${name} is ideal for multi-page applications, content-heavy interfaces, or any situation where users need to move between different sections. Keep navigation patterns consistent across your application for better user experience.`
		],
		layout: [
			`Use ${name} to structure and organize content within your interface. This component helps create visual hierarchy and consistent spacing throughout your application.`,
			`${name} works well for arranging related content, creating responsive layouts, and maintaining visual consistency. Use it to group related elements and establish clear content boundaries.`
		],
		overlay: [
			`Use ${name} when you need to display content that temporarily overlays the main interface. This component is useful for focused interactions, confirmations, or supplementary information.`,
			`${name} should be used sparingly as overlays interrupt the user's workflow. Reserve this component for important interactions that require user attention or action before continuing.`
		],
		display: [
			`Use ${name} to present visual information or status indicators to users. This component helps convey information quickly through visual representation.`,
			`${name} is effective for showing user identity, status, categories, or labels. Keep usage consistent throughout your application to help users quickly recognize and understand the information being displayed.`
		],
		action: [
			`Use ${name} when you need to provide clear, actionable controls for users. This component signals interactive elements and helps users understand available actions.`,
			`${name} should be used for primary actions, secondary actions, or any clickable elements that trigger functionality. Ensure adequate spacing between action elements and use appropriate visual hierarchy to indicate action importance.`
		],
		data: [
			`Use ${name} to display structured data or visualizations. This component helps users understand and interact with complex information sets.`,
			`${name} is ideal for dashboards, reports, and data-heavy interfaces. Ensure data is presented clearly and consider responsive behavior for different screen sizes. Provide appropriate loading states for async data.`
		],
		form: [
			`Use ${name} to organize form elements and create structured data entry interfaces. This component helps maintain consistency and accessibility in form layouts.`,
			`${name} works best when grouping related form fields together. Ensure proper labeling, validation, and error handling. Consider the logical flow of information when arranging form elements.`
		],
		general: [
			`Use ${name} ${summary ? `to ${summary.toLowerCase().replace(/\.$/, '')}` : 'to enhance your user interface'}. This component provides a consistent, accessible, and well-designed solution for this use case.`,
			`${name} integrates seamlessly with other components in the design system. Follow the established patterns and guidelines to ensure consistency across your application.`
		],
	};

	return usageTemplates[category] || usageTemplates.general;
}

/**
 * Process a single manifest.
 */
function processManifest(manifestPath) {
	const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

	// Skip if already has usage
	if (manifest.docs?.usage && manifest.docs.usage.length > 0) {
		console.log(`  Skipping ${manifest.id} (already has usage)`);
		return false;
	}

	// Generate usage
	const usage = generateUsage(manifest);

	// Ensure docs section exists
	if (!manifest.docs) {
		manifest.docs = {};
	}

	// Add usage
	manifest.docs.usage = usage;

	// Write back
	writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t") + "\n");
	console.log(`  Updated ${manifest.id} with usage`);
	return true;
}

// Main
console.log("Adding usage to manifests...\n");

const manifestFiles = readdirSync(MANIFESTS_DIR).filter(f => f.endsWith(".component.json") || f.endsWith(".pattern.json") || f.endsWith(".widget.json"));
let updated = 0;
let skipped = 0;

for (const file of manifestFiles) {
	const result = processManifest(join(MANIFESTS_DIR, file));
	if (result) updated++;
	else skipped++;
}

console.log(`\nDone! Updated ${updated}, skipped ${skipped}`);
