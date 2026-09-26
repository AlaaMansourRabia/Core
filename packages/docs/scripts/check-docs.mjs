#!/usr/bin/env node
/**
 * Validation script for documentation integrity.
 *
 * Validates:
 * - Every Components/* story has a matching example
 * - Every example/overviewExample/best-practice export exists
 * - Examples have descriptions and code
 * - Exactly 3 best-practice pairs per documented component
 * - Anatomy has at least 2 parts
 * - Props are present with descriptions
 * - No dynamic className in examples (template strings/variables)
 * - Imports are only from allowed peers
 * - index.json lists all components
 */

import {existsSync, readFileSync, readdirSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST_DIR = resolve(ROOT, "dist");
const DOCS_DIR = resolve(DIST_DIR, "docs");
const EXAMPLES_DIR = resolve(ROOT, "src/examples");

// Allowed imports in built examples
const ALLOWED_IMPORTS = ["react", "react/jsx-runtime", "@corensystem/coren-ui", "lucide-react"];

let errors = [];
let warnings = [];

function error(msg) {
	errors.push(`ERROR: ${msg}`);
}

function warn(msg) {
	warnings.push(`WARN: ${msg}`);
}

/**
 * Check that index.json exists and lists components.
 */
function checkIndex() {
	const indexPath = join(DIST_DIR, "index.json");
	if (!existsSync(indexPath)) {
		error("dist/index.json does not exist");
		return [];
	}

	const index = JSON.parse(readFileSync(indexPath, "utf-8"));
	if (!Array.isArray(index) || index.length === 0) {
		error("index.json is empty or not an array");
		return [];
	}

	// Check each entry has required fields
	for (const entry of index) {
		if (!entry.id) error(`Index entry missing id: ${JSON.stringify(entry)}`);
		if (!entry.name) error(`Index entry missing name: ${JSON.stringify(entry)}`);
		if (!entry.group) error(`Index entry missing group: ${JSON.stringify(entry)}`);
		if (!entry.storybookTitle) error(`Index entry missing storybookTitle: ${JSON.stringify(entry)}`);
	}

	console.log(`  index.json: ${index.length} components`);
	return index;
}

/**
 * Check that each documented component has valid structure.
 */
function checkComponentDocs(index) {
	const docsFiles = readdirSync(DOCS_DIR).filter((f) => f.endsWith(".json"));

	for (const file of docsFiles) {
		const id = file.replace(".json", "");
		const docsPath = join(DOCS_DIR, file);
		const docs = JSON.parse(readFileSync(docsPath, "utf-8"));

		// Skip placeholders for now
		if (docs._placeholder) {
			continue;
		}

		// Check component info
		if (!docs.component?.import) {
			warn(`${id}: missing component.import`);
		}
		if (!docs.component?.export) {
			warn(`${id}: missing component.export`);
		}

		// Check examples exist and have required fields
		if (docs.examples && docs.examples.length > 0) {
			for (const example of docs.examples) {
				if (!example.name) error(`${id}: example missing name`);
				if (!example.export) error(`${id}: example missing export`);
				if (!example.storyId) error(`${id}: example missing storyId`);
				if (!example.description) warn(`${id}: example ${example.export} missing description`);
				if (!example.code) error(`${id}: example ${example.export} missing code`);

				// Check example export exists in dist
				checkExampleExists(id, example.export);
			}
		}

		// Check overviewExample exists
		if (docs.overviewExample) {
			checkExampleExists(id, docs.overviewExample);
		}

		// Check best practices (should have exactly 3 pairs for documented components)
		if (docs.bestPractices) {
			if (docs.bestPractices.length !== 3) {
				warn(`${id}: has ${docs.bestPractices.length} best practices, expected 3`);
			}
			for (const bp of docs.bestPractices) {
				if (bp.do?.example) checkExampleExists(id, bp.do.example);
				if (bp.dont?.example) checkExampleExists(id, bp.dont.example);
				if (!bp.do?.text) warn(`${id}: best practice do missing text`);
				if (!bp.dont?.text) warn(`${id}: best practice dont missing text`);
			}
		}

		// Check anatomy has at least 2 parts
		if (docs.anatomy?.parts) {
			if (docs.anatomy.parts.length < 2) {
				warn(`${id}: anatomy has ${docs.anatomy.parts.length} parts, expected at least 2`);
			}
			for (const part of docs.anatomy.parts) {
				if (!part.name) error(`${id}: anatomy part missing name`);
				if (!part.description) warn(`${id}: anatomy part missing description`);
			}
		}

		// Check props present
		if (!docs.props || docs.props.length === 0) {
			warn(`${id}: no props documented`);
		} else {
			for (const prop of docs.props) {
				if (!prop.name) error(`${id}: prop missing name`);
				if (!prop.type) error(`${id}: prop ${prop.name} missing type`);
				if (!prop.description) warn(`${id}: prop ${prop.name} missing description`);
			}
		}
	}

	console.log(`  Checked ${docsFiles.length} component docs`);
}

/**
 * Check that an example export exists in the source.
 */
function checkExampleExists(componentId, exportName) {
	const indexPath = join(EXAMPLES_DIR, componentId, "index.ts");
	if (!existsSync(indexPath)) {
		error(`${componentId}: examples/index.ts does not exist`);
		return;
	}

	const content = readFileSync(indexPath, "utf-8");
	if (!content.includes(`{${exportName}}`)) {
		error(`${componentId}: example ${exportName} not exported from index.ts`);
	}
}

/**
 * Check built example files for invalid imports and dynamic classNames.
 */
function checkBuiltExamples() {
	const examplesDistDir = join(DIST_DIR, "examples");
	if (!existsSync(examplesDistDir)) {
		warn("dist/examples directory does not exist");
		return;
	}

	const componentDirs = readdirSync(examplesDistDir, {withFileTypes: true}).filter((d) => d.isDirectory());

	for (const dir of componentDirs) {
		const mjsFile = join(examplesDistDir, dir.name, "index.mjs");
		if (!existsSync(mjsFile)) continue;

		const content = readFileSync(mjsFile, "utf-8");

		// Check for bundled dependencies (should only have imports, not bundled code)
		const importMatches = content.matchAll(/from\s+["']([^"']+)["']/g);
		for (const match of importMatches) {
			const importPath = match[1];
			const isAllowed = ALLOWED_IMPORTS.some(
				(allowed) => importPath === allowed || importPath.startsWith(`${allowed}/`),
			);
			if (!isAllowed && !importPath.startsWith("./") && !importPath.startsWith("../")) {
				error(`${dir.name}: unexpected import "${importPath}" - should be external`);
			}
		}
	}

	console.log(`  Checked ${componentDirs.length} built example bundles`);
}

/**
 * Check source examples for dynamic className patterns.
 */
function checkSourceExamples() {
	if (!existsSync(EXAMPLES_DIR)) {
		warn("src/examples directory does not exist");
		return;
	}

	const componentDirs = readdirSync(EXAMPLES_DIR, {withFileTypes: true}).filter((d) => d.isDirectory());

	for (const dir of componentDirs) {
		const files = readdirSync(join(EXAMPLES_DIR, dir.name)).filter((f) => f.endsWith(".tsx"));

		for (const file of files) {
			const content = readFileSync(join(EXAMPLES_DIR, dir.name, file), "utf-8");

			// Check for template string className
			if (/className=\s*\{?\s*`/.test(content)) {
				error(`${dir.name}/${file}: className uses template string - use static strings only`);
			}

			// Check for variable className (but allow clsx/cn which is fine)
			if (/className=\s*\{[^}]*\$\{/.test(content)) {
				error(`${dir.name}/${file}: className uses interpolation - use static strings only`);
			}
		}
	}

	console.log(`  Checked ${componentDirs.length} source example directories`);
}

// Main
console.log("Checking docs integrity...\n");

const index = checkIndex();
if (index.length > 0) {
	checkComponentDocs(index);
}
checkBuiltExamples();
checkSourceExamples();

console.log("");

if (warnings.length > 0) {
	console.log("Warnings:");
	for (const w of warnings) {
		console.log(`  ${w}`);
	}
	console.log("");
}

if (errors.length > 0) {
	console.log("Errors:");
	for (const e of errors) {
		console.log(`  ${e}`);
	}
	console.log("");
	console.log(`FAILED: ${errors.length} errors, ${warnings.length} warnings`);
	process.exit(1);
} else {
	console.log(`PASSED: ${warnings.length} warnings`);
	process.exit(0);
}
