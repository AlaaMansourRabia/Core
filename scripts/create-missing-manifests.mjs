#!/usr/bin/env node
/**
 * Script to create missing component manifests.
 * Creates manifests for components that exist in Storybook examples but don't have manifests.
 */

import {existsSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MANIFESTS_DIR = resolve(ROOT, "manifests");
const COMPONENTS_DIR = resolve(ROOT, "packages/components/src");

// Components that need manifests (from the incomplete list)
const MISSING_COMPONENTS = [
	"avatar-status-dot",
	"bottom-sheet",
	"citation",
	"clickable-card",
	"code",
	"date-range-input",
	"divider",
	"error-page",
	"file-input",
	"form-layout",
	"grid",
	"heading",
	"icon-button",
	"lightbox",
	"link",
	"list",
	"markdown",
	"mega-menu",
	"number-input",
	"outline",
	"overflow-list",
	"section",
	"segmented-control",
	"selectable-card",
	"stack",
	"status-dot",
	"tab-list",
	"text",
	"timestamp",
	"tree-list",
];

// Category detection
const CATEGORY_PATTERNS = {
	feedback: ["status", "error", "citation"],
	input: ["input", "field", "date", "number", "file"],
	navigation: ["nav", "menu", "tab", "link", "breadcrumb"],
	layout: ["grid", "stack", "section", "form-layout", "divider", "overflow-list"],
	overlay: ["sheet", "lightbox", "mega-menu"],
	display: ["avatar", "text", "heading", "markdown", "code", "timestamp", "list", "outline", "tree"],
	action: ["button", "icon-button", "clickable", "selectable"],
};

function detectCategory(name) {
	const lowerName = name.toLowerCase();
	for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
		if (patterns.some(p => lowerName.includes(p))) {
			return category;
		}
	}
	return "general";
}

function toDisplayName(kebab) {
	return kebab.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

function generateUsage(name, category) {
	const usageTemplates = {
		feedback: [
			`Use ${name} to communicate status or feedback to users. This component provides visual indicators that help users understand the current state or outcome.`,
			`${name} is effective for showing status, progress, or results. Use it consistently throughout your application to maintain clear communication patterns.`
		],
		input: [
			`Use ${name} when you need to collect user input. This component provides a consistent interaction pattern that users will find familiar and accessible.`,
			`${name} should be used within forms or interactive interfaces where data collection is required. Ensure proper labeling and validation feedback for accessibility.`
		],
		navigation: [
			`Use ${name} to help users navigate through your application or content. This component provides clear wayfinding and helps users understand their current location.`,
			`${name} is ideal for multi-page applications and content-heavy interfaces. Keep navigation patterns consistent across your application.`
		],
		layout: [
			`Use ${name} to structure and organize content within your interface. This component helps create visual hierarchy and consistent spacing.`,
			`${name} works well for arranging related content and creating responsive layouts. Use it to maintain visual consistency throughout your application.`
		],
		overlay: [
			`Use ${name} when you need to display content that temporarily overlays the main interface. This component is useful for focused interactions or supplementary information.`,
			`${name} should be used sparingly as overlays interrupt the user's workflow. Reserve for important interactions that require user attention.`
		],
		display: [
			`Use ${name} to present information or content to users. This component helps display data in a clear, readable format.`,
			`${name} is effective for rendering content, text, or data. Use it consistently to maintain a cohesive visual language.`
		],
		action: [
			`Use ${name} to provide interactive controls for users. This component signals clickable elements and helps users understand available actions.`,
			`${name} should be used for interactive elements that trigger functionality. Ensure adequate spacing and clear visual hierarchy.`
		],
		general: [
			`Use ${name} to enhance your user interface. This component provides a consistent, accessible, and well-designed solution.`,
			`${name} integrates seamlessly with other components in the design system. Follow established patterns to ensure consistency.`
		],
	};
	return usageTemplates[category] || usageTemplates.general;
}

function generateBestPractices(name, category) {
	const practiceTemplates = {
		feedback: [
			{type: "do", title: "Use appropriate severity", description: `Match the ${name} visual style to the message importance.`, example: `<${toDisplayName(name)} variant="success" />`},
			{type: "dont", title: "Don't overuse", description: `Avoid showing too many ${name} instances at once.`, example: `Multiple instances stacked`},
			{type: "do", title: "Provide context", description: `Include clear, actionable information in the ${name}.`, example: `<${toDisplayName(name)}>File saved successfully</${toDisplayName(name)}>`},
			{type: "dont", title: "Don't hide critical info", description: `Never auto-dismiss important messages.`, example: `Auto-hiding error messages`},
			{type: "do", title: "Maintain consistency", description: `Use the same patterns throughout your application.`, example: `Consistent styling and placement`},
			{type: "dont", title: "Don't mix styles", description: `Avoid inconsistent visual treatments.`, example: `Different colors for same severity`},
		],
		input: [
			{type: "do", title: "Always include labels", description: `Every ${name} should have an associated label for accessibility.`, example: `<Label htmlFor="id">Label</Label>\n<${toDisplayName(name)} id="id" />`},
			{type: "dont", title: "Don't rely on placeholders", description: `Placeholders disappear when typing and shouldn't replace labels.`, example: `<${toDisplayName(name)} placeholder="Enter value" />`},
			{type: "do", title: "Show validation feedback", description: `Display clear error messages near the ${name} when validation fails.`, example: `<${toDisplayName(name)} error>\n<span>Error message</span>`},
			{type: "dont", title: "Don't delay errors", description: `Show validation errors immediately, don't wait until form submission.`, example: `Validating only on submit`},
			{type: "do", title: "Use appropriate types", description: `Use specialized input types when available.`, example: `<${toDisplayName(name)} type="email" />`},
			{type: "dont", title: "Don't use generic types", description: `Avoid using text type for everything when specialized types exist.`, example: `<${toDisplayName(name)} type="text" /> for dates`},
		],
		layout: [
			{type: "do", title: "Maintain consistent spacing", description: `Use uniform gaps and padding with ${name}.`, example: `<${toDisplayName(name)} gap="md" />`},
			{type: "dont", title: "Don't vary spacing", description: `Avoid inconsistent gaps that create visual confusion.`, example: `Mixed spacing values`},
			{type: "do", title: "Consider responsive behavior", description: `Ensure ${name} adapts to different screen sizes.`, example: `<${toDisplayName(name)} responsive />`},
			{type: "dont", title: "Don't ignore breakpoints", description: `Fixed layouts can break on different devices.`, example: `Fixed pixel widths`},
			{type: "do", title: "Use semantic structure", description: `Structure content logically within ${name}.`, example: `Logical content hierarchy`},
			{type: "dont", title: "Don't nest deeply", description: `Avoid excessive nesting that complicates layout.`, example: `Deeply nested containers`},
		],
		default: [
			{type: "do", title: "Use semantic props", description: `Use the component's built-in props rather than className overrides.`, example: `<${toDisplayName(name)} variant="primary" />`},
			{type: "dont", title: "Don't override styles", description: `Avoid using className to override fundamental styling.`, example: `<${toDisplayName(name)} className="custom-bg" />`},
			{type: "do", title: "Provide accessible labels", description: `Include proper ARIA labels for screen reader users.`, example: `<${toDisplayName(name)} aria-label="Description" />`},
			{type: "dont", title: "Don't skip accessibility", description: `Never omit accessibility attributes for interactive components.`, example: `<${toDisplayName(name)} /> without labels`},
			{type: "do", title: "Handle all states", description: `Account for loading, error, empty, and success states.`, example: `<${toDisplayName(name)} loading={isLoading} />`},
			{type: "dont", title: "Don't ignore edge cases", description: `Avoid showing broken UI when data is missing.`, example: `Unhandled undefined data`},
		],
	};
	return practiceTemplates[category] || practiceTemplates.default;
}

function generateAnatomy(name) {
	const displayName = toDisplayName(name);
	return {
		description: `${displayName} is composed of the following parts:`,
		parts: [
			{name: displayName, description: `Root ${displayName} element.`},
			{name: `${displayName}Content`, description: `Content area of the ${displayName}.`},
		]
	};
}

function createManifest(componentId) {
	const displayName = toDisplayName(componentId);
	const category = detectCategory(componentId);

	// Check if source file exists
	const sourcePath = join(COMPONENTS_DIR, `${componentId}.tsx`);
	const hasSource = existsSync(sourcePath);

	const manifest = {
		id: componentId,
		name: displayName,
		type: "component",
		source: hasSource ? {
			path: `packages/components/src/${componentId}.tsx`,
			import: `@corensystem/coren-ui/${componentId}`,
			export: displayName,
		} : undefined,
		docs: {
			summary: `${displayName} component for building user interfaces.`,
			usage: generateUsage(displayName, category),
			anatomy: generateAnatomy(componentId),
			bestPractices: generateBestPractices(componentId, category),
			props: [], // Will be filled by add-manifest-props.mjs
		},
	};

	return manifest;
}

// Main
console.log("Creating missing manifests...\n");

let created = 0;
let skipped = 0;

for (const componentId of MISSING_COMPONENTS) {
	const manifestPath = join(MANIFESTS_DIR, `${componentId}.component.json`);

	if (existsSync(manifestPath)) {
		console.log(`  Skipping ${componentId} (manifest exists)`);
		skipped++;
		continue;
	}

	const manifest = createManifest(componentId);
	writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t") + "\n");
	console.log(`  Created ${componentId}.component.json`);
	created++;
}

console.log(`\nDone! Created ${created}, skipped ${skipped}`);
