/**
 * Post-processes TW4-compiled styles.css into two consumer-specific CSS files:
 *
 * 1. styles.css     — For no-Tailwind and TW3 consumers
 *                     Removes @import, unwraps @layer, keeps base reset, minifies
 *
 * 2. styles.tw4.css — For TW4 consumers
 *                     Removes @import, removes @layer base (consumer has own reset),
 *                     keeps @layer structure (TW4 understands it natively), minifies
 */

import cssnano from "cssnano";
import {readFileSync, readdirSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import postcss from "postcss";

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = resolve(__dirname, "../dist/styles.css");
const input = readFileSync(inputPath, "utf8");

// ── Pre-flight: validate the TW4 input has expected structure ──

const inputAst = postcss.parse(input);
const inputLayers = new Set();
inputAst.walkAtRules("layer", (atRule) => {
	if (atRule.nodes && atRule.nodes.length > 0) {
		inputLayers.add(atRule.params);
	}
});

const expectedLayers = ["properties", "theme", "base", "utilities"];
for (const layer of expectedLayers) {
	if (!inputLayers.has(layer)) {
		console.error(`✘ Input validation failed — expected @layer ${layer} not found in TW4 output`);
		console.error(`  Found layers: ${[...inputLayers].join(", ") || "(none)"}`);
		console.error(`  TW4 may have changed its output structure. Update this script.`);
		process.exit(1);
	}
}

// ── styles.css (no-TW / TW3) ──

function flattenAllPlugin() {
	return {
		postcssPlugin: "flatten-all",
		AtRule(atRule) {
			if (atRule.name === "import") {
				atRule.remove();
				return;
			}
			if (atRule.name === "layer") {
				if (!atRule.nodes || atRule.nodes.length === 0) {
					atRule.remove();
					return;
				}
				for (const child of atRule.nodes) {
					atRule.parent.insertBefore(atRule, child.clone());
				}
				atRule.remove();
			}
		},
	};
}
flattenAllPlugin.postcss = true;

// ── styles.tw4.css (TW4) ──

function tw4Plugin() {
	return {
		postcssPlugin: "tw4-compat",
		AtRule(atRule) {
			if (atRule.name === "import") {
				atRule.remove();
				return;
			}
			if (atRule.name === "layer") {
				if (!atRule.nodes || atRule.nodes.length === 0) {
					atRule.remove();
					return;
				}
				if (atRule.params === "base") {
					atRule.remove();
					return;
				}
			}
		},
	};
}
tw4Plugin.postcss = true;

// ── Guard: every animation utility the source names has to actually compile ──
//
// The bug this exists to catch (#239): src/styles.css loaded no animation plugin, so `animate-in`,
// `slide-in-from-right` and the rest landed in the DOM and resolved to nothing. Sheets, dialogs and
// popovers appeared instantly, and nothing in the build said so. Scoped to the animation families
// rather than every `wwc:` utility — these are always written as literal class strings, so the scan
// has no dynamic cases to misread.

const ANIMATION_UTILITY =
	/wwc:[A-Za-z0-9:[\]=%./_-]*(?:animate-in|animate-out|slide-in-from|slide-out-to|fade-in|fade-out|zoom-in|zoom-out)[A-Za-z0-9:[\]=%./_-]*/g;

function collectAnimationUtilities(dir) {
	const names = new Set();
	for (const entry of readdirSync(dir, {withFileTypes: true})) {
		const full = resolve(dir, entry.name);
		if (entry.isDirectory()) {
			for (const name of collectAnimationUtilities(full)) names.add(name);
			continue;
		}
		if (!/\.(?:tsx?|css)$/.test(entry.name) || entry.name.includes(".test.")) continue;
		for (const [name] of readFileSync(full, "utf8").matchAll(ANIMATION_UTILITY)) names.add(name);
	}
	return names;
}

const animationUtilities = collectAnimationUtilities(resolve(__dirname, "../src"));

function assertAnimationUtilitiesEmitted(css, label) {
	// Compare with the escapes stripped rather than re-deriving Tailwind's selector escaping.
	const selectors = css.replaceAll("\\", "");
	const missing = [...animationUtilities].filter((name) => !selectors.includes(`.${name}`)).sort();
	if (missing.length === 0) return;
	console.error(`✘ ${label}: ${missing.length} animation utility/utilities named in src emit no rule:`);
	for (const name of missing.slice(0, 10)) console.error(`    ${name}`);
	if (missing.length > 10) console.error(`    …and ${missing.length - 10} more`);
	console.error(`  These classes reach the DOM and resolve to nothing. Check the animation plugin`);
	console.error(`  import in src/styles.css.`);
	process.exit(1);
}

// ── Build ──

const nano = cssnano({preset: ["default", {cssDeclarationSorter: false}]});

async function build(plugins, outputFile, label, forbiddenRules) {
	const result = await postcss([...plugins, nano]).process(input, {from: inputPath});

	// Validate: no forbidden at-rules
	const check = postcss.parse(result.css);
	const found = [];
	check.walkAtRules((atRule) => {
		if (forbiddenRules.includes(atRule.name)) {
			found.push(`@${atRule.name}`);
		}
	});
	if (found.length > 0) {
		console.error(`✘ ${label}: forbidden at-rules found: ${found.join(", ")}`);
		process.exit(1);
	}

	// Validate: output contains wwc: classes
	if (!result.css.includes("wwc")) {
		console.error(`✘ ${label}: output contains no wwc: classes — build may have failed`);
		process.exit(1);
	}

	assertAnimationUtilitiesEmitted(result.css, label);

	const outPath = resolve(__dirname, "../dist", outputFile);
	writeFileSync(outPath, result.css, "utf8");
	const sizeKB = (Buffer.byteLength(result.css, "utf8") / 1024).toFixed(1);
	console.log(`  ✔ ${outputFile} (${sizeKB} KB)`);
}

console.log("Building pre-built CSS:");
await build([flattenAllPlugin], "styles.css", "no-TW / TW3", ["layer", "import"]);
await build([tw4Plugin], "styles.tw4.css", "TW4", ["import"]);
