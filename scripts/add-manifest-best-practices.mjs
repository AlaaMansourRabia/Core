#!/usr/bin/env node
/**
 * Script to add best practices documentation to component manifests.
 * Generates 3 Do/Don't pairs based on component type.
 */

import {readFileSync, readdirSync, writeFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MANIFESTS_DIR = resolve(ROOT, "manifests");

/**
 * Generate best practices based on component type.
 */
function generateBestPractices(manifest) {
	const name = manifest.name || manifest.id;
	const lowerName = name.toLowerCase();

	// Common patterns for different component categories
	if (lowerName.includes('button') || lowerName.includes('action')) {
		return [
			{
				type: "do",
				title: "Use clear action labels",
				description: "Write button text that clearly describes the action, like 'Save changes' or 'Delete item'.",
				example: `<${name}>Save changes</${name}>`
			},
			{
				type: "dont",
				title: "Avoid vague labels",
				description: "Don't use generic text like 'Click here' or 'Submit' without context.",
				example: `<${name}>Click here</${name}>`
			},
			{
				type: "do",
				title: "Use appropriate variants",
				description: "Choose button variants that match the action importance - primary for main actions, secondary for alternatives.",
				example: `<${name} variant="primary">Confirm</${name}>`
			},
			{
				type: "dont",
				title: "Don't overuse primary buttons",
				description: "Avoid having multiple primary buttons in the same view, which creates visual confusion.",
				example: `<${name} variant="primary">Save</${name}>\n<${name} variant="primary">Cancel</${name}>`
			},
			{
				type: "do",
				title: "Handle loading states",
				description: "Show loading indicators when actions take time to complete.",
				example: `<${name} loading>Processing...</${name}>`
			},
			{
				type: "dont",
				title: "Don't block without feedback",
				description: "Never disable a button during processing without showing a loading state.",
				example: `<${name} disabled>Submit</${name}>`
			}
		];
	}

	if (lowerName.includes('input') || lowerName.includes('field') || lowerName.includes('textarea')) {
		return [
			{
				type: "do",
				title: "Always include labels",
				description: "Every input should have an associated label for accessibility.",
				example: `<Label htmlFor="email">Email</Label>\n<${name} id="email" />`
			},
			{
				type: "dont",
				title: "Don't rely on placeholders alone",
				description: "Placeholders disappear when typing and shouldn't replace labels.",
				example: `<${name} placeholder="Enter email" />`
			},
			{
				type: "do",
				title: "Show validation feedback",
				description: "Display clear error messages near the input when validation fails.",
				example: `<${name} aria-invalid="true" />\n<span className="error">Invalid email format</span>`
			},
			{
				type: "dont",
				title: "Don't delay error feedback",
				description: "Show validation errors immediately, don't wait until form submission.",
				example: `// Validating only on submit`
			},
			{
				type: "do",
				title: "Use appropriate input types",
				description: "Use specialized input types (email, tel, number) for better mobile keyboards.",
				example: `<${name} type="email" />`
			},
			{
				type: "dont",
				title: "Don't use text type for everything",
				description: "Avoid using generic text inputs when a specialized type exists.",
				example: `<${name} type="text" /> // for email`
			}
		];
	}

	if (lowerName.includes('dialog') || lowerName.includes('modal')) {
		return [
			{
				type: "do",
				title: "Focus management",
				description: "Trap focus within the dialog and return focus when closed.",
				example: `<${name}>\n  <${name}Content>\n    <button autoFocus>First action</button>\n  </${name}Content>\n</${name}>`
			},
			{
				type: "dont",
				title: "Don't nest dialogs",
				description: "Avoid opening dialogs from within dialogs, use sequential flow instead.",
				example: `<${name}>\n  <${name} nested />\n</${name}>`
			},
			{
				type: "do",
				title: "Provide clear exit",
				description: "Always include a visible close button and support Escape key.",
				example: `<${name}Close>×</${name}Close>`
			},
			{
				type: "dont",
				title: "Don't trap users",
				description: "Never make dialogs impossible to close or require specific actions to dismiss.",
				example: `// No close button or escape handling`
			},
			{
				type: "do",
				title: "Keep content focused",
				description: "Limit dialog content to a single task or decision.",
				example: `<${name}Title>Confirm deletion</${name}Title>`
			},
			{
				type: "dont",
				title: "Don't overload dialogs",
				description: "Avoid putting complex forms or multiple tasks in a single dialog.",
				example: `// Multi-step form in dialog`
			}
		];
	}

	if (lowerName.includes('card')) {
		return [
			{
				type: "do",
				title: "Maintain consistent structure",
				description: "Use the same card layout pattern throughout your application.",
				example: `<${name}>\n  <${name}Header>Title</${name}Header>\n  <${name}Content>Body</${name}Content>\n</${name}>`
			},
			{
				type: "dont",
				title: "Don't mix card styles",
				description: "Avoid using different card structures for similar content types.",
				example: `// Inconsistent header/body placement`
			},
			{
				type: "do",
				title: "Use appropriate elevation",
				description: "Apply shadow/elevation that reflects the card's importance and context.",
				example: `<${name} elevated>Important content</${name}>`
			},
			{
				type: "dont",
				title: "Don't over-elevate",
				description: "Avoid heavy shadows on every card, reserve for interactive or important items.",
				example: `// Heavy shadow on all cards`
			},
			{
				type: "do",
				title: "Keep content scannable",
				description: "Structure card content for quick scanning with clear hierarchy.",
				example: `<${name}>\n  <${name}Title>Key info first</${name}Title>\n</${name}>`
			},
			{
				type: "dont",
				title: "Don't cram too much",
				description: "Avoid overloading cards with excessive content or actions.",
				example: `// 10+ action buttons in card`
			}
		];
	}

	if (lowerName.includes('list') || lowerName.includes('item')) {
		return [
			{
				type: "do",
				title: "Use consistent item spacing",
				description: "Maintain uniform gaps between list items for visual rhythm.",
				example: `<${name} gap="md">\n  <${name}Item>One</${name}Item>\n  <${name}Item>Two</${name}Item>\n</${name}>`
			},
			{
				type: "dont",
				title: "Don't vary item spacing",
				description: "Avoid inconsistent gaps that create visual confusion.",
				example: `<${name}Item className="mb-1" />\n<${name}Item className="mb-4" />`
			},
			{
				type: "do",
				title: "Provide loading states",
				description: "Show skeleton loaders while list data is being fetched.",
				example: `<${name} loading>\n  <${name}Skeleton />\n</${name}>`
			},
			{
				type: "dont",
				title: "Don't show empty state unexpectedly",
				description: "Always indicate loading vs empty to avoid confusing users.",
				example: `// Blank list while loading`
			},
			{
				type: "do",
				title: "Support keyboard navigation",
				description: "Enable arrow key navigation through list items.",
				example: `<${name} onKeyDown={handleArrowKeys}>`
			},
			{
				type: "dont",
				title: "Don't break navigation flow",
				description: "Avoid interactive elements that trap focus within items.",
				example: `// Nested focusable causing tab trap`
			}
		];
	}

	if (lowerName.includes('tab')) {
		return [
			{
				type: "do",
				title: "Keep tabs concise",
				description: "Use short, descriptive labels for tab triggers.",
				example: `<${name}Trigger>Overview</${name}Trigger>`
			},
			{
				type: "dont",
				title: "Don't use long tab labels",
				description: "Avoid lengthy text that causes tabs to wrap or overflow.",
				example: `<${name}Trigger>Detailed Configuration Settings</${name}Trigger>`
			},
			{
				type: "do",
				title: "Maintain content relationship",
				description: "Ensure tab content is clearly related to the tab label.",
				example: `<${name}Trigger value="settings">Settings</${name}Trigger>\n<${name}Content value="settings">Settings panel</${name}Content>`
			},
			{
				type: "dont",
				title: "Don't use for navigation",
				description: "Use proper navigation components for page-level routing.",
				example: `// Tabs for page navigation`
			},
			{
				type: "do",
				title: "Show active state clearly",
				description: "Make the selected tab visually distinct from others.",
				example: `<${name}Trigger active>Active tab</${name}Trigger>`
			},
			{
				type: "dont",
				title: "Don't hide the active indicator",
				description: "Always show which tab is currently selected.",
				example: `// No visual active state`
			}
		];
	}

	if (lowerName.includes('alert') || lowerName.includes('toast') || lowerName.includes('notification')) {
		return [
			{
				type: "do",
				title: "Use appropriate severity",
				description: "Match the alert variant to the message importance (info, warning, error).",
				example: `<${name} variant="error">Action failed</${name}>`
			},
			{
				type: "dont",
				title: "Don't overuse error styling",
				description: "Reserve error variants for actual errors, not warnings or info.",
				example: `<${name} variant="error">Welcome back</${name}>`
			},
			{
				type: "do",
				title: "Provide actionable messages",
				description: "Include clear next steps or resolution options.",
				example: `<${name}>Session expired. <${name}Action>Sign in</${name}Action></${name}>`
			},
			{
				type: "dont",
				title: "Don't show vague messages",
				description: "Avoid generic messages without context or actions.",
				example: `<${name}>Something went wrong</${name}>`
			},
			{
				type: "do",
				title: "Allow dismissal when appropriate",
				description: "Let users dismiss non-critical alerts.",
				example: `<${name} dismissible>Info message</${name}>`
			},
			{
				type: "dont",
				title: "Don't auto-dismiss important alerts",
				description: "Never auto-dismiss error messages or critical information.",
				example: `<${name} autoHide variant="error">Critical error</${name}>`
			}
		];
	}

	if (lowerName.includes('tooltip') || lowerName.includes('popover')) {
		return [
			{
				type: "do",
				title: "Keep content brief",
				description: "Use short, helpful text that adds context.",
				example: `<${name} content="Save your changes">`
			},
			{
				type: "dont",
				title: "Don't overload with content",
				description: "Avoid putting long text or complex UI in tooltips.",
				example: `<${name} content="This is a very long explanation...">`
			},
			{
				type: "do",
				title: "Ensure accessibility",
				description: "Make tooltip content available to screen readers.",
				example: `<${name} aria-describedby="tooltip-1">`
			},
			{
				type: "dont",
				title: "Don't hide critical info",
				description: "Never put essential information only in tooltips.",
				example: `// Required field indicator only in tooltip`
			},
			{
				type: "do",
				title: "Use appropriate triggers",
				description: "Show on hover for mouse, focus for keyboard users.",
				example: `<${name} trigger={['hover', 'focus']}>`
			},
			{
				type: "dont",
				title: "Don't require click to view",
				description: "Avoid click-to-open tooltips that hide quick information.",
				example: `<${name} trigger="click">`
			}
		];
	}

	// Default best practices for any component
	return [
		{
			type: "do",
			title: "Use semantic props",
			description: "Use the component's built-in props rather than className overrides.",
			example: `<${name} variant="primary" size="lg" />`
		},
		{
			type: "dont",
			title: "Don't override core styles",
			description: "Avoid using className to override the component's fundamental styling.",
			example: `<${name} className="custom-bg-color" />`
		},
		{
			type: "do",
			title: "Provide accessible labels",
			description: "Include proper ARIA labels for screen reader users.",
			example: `<${name} aria-label="Description" />`
		},
		{
			type: "dont",
			title: "Don't skip accessibility",
			description: "Never omit accessibility attributes for interactive components.",
			example: `<${name} /> // No aria-label`
		},
		{
			type: "do",
			title: "Handle all states",
			description: "Account for loading, error, empty, and success states.",
			example: `<${name} loading={isLoading} error={error} />`
		},
		{
			type: "dont",
			title: "Don't ignore edge cases",
			description: "Avoid showing broken UI when data is missing or loading.",
			example: `<${name}>{data.value}</${name}> // Crashes if data is undefined`
		}
	];
}

/**
 * Process a single manifest.
 */
function processManifest(manifestPath) {
	const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

	// Skip if already has bestPractices
	if (manifest.docs?.bestPractices && manifest.docs.bestPractices.length >= 6) {
		console.log(`  Skipping ${manifest.id} (already has bestPractices)`);
		return false;
	}

	// Generate best practices
	const bestPractices = generateBestPractices(manifest);

	// Ensure docs section exists
	if (!manifest.docs) {
		manifest.docs = {};
	}

	// Add best practices
	manifest.docs.bestPractices = bestPractices;

	// Write back
	writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t") + "\n");
	console.log(`  Updated ${manifest.id} with bestPractices`);
	return true;
}

// Main
console.log("Adding bestPractices to manifests...\n");

const manifestFiles = readdirSync(MANIFESTS_DIR).filter(f => f.endsWith(".component.json") || f.endsWith(".pattern.json") || f.endsWith(".widget.json"));
let updated = 0;
let skipped = 0;

for (const file of manifestFiles) {
	const result = processManifest(join(MANIFESTS_DIR, file));
	if (result) updated++;
	else skipped++;
}

console.log(`\nDone! Updated ${updated}, skipped ${skipped}`);
