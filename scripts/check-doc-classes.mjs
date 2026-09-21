#!/usr/bin/env node
/**
 * Fails when a comment in a published package's source tells a consumer to write a `wwc:` class.
 *
 * The prefix is an internal build detail (CLAUDE.md, "CSS Class Prefix"): `cn()` is
 * `extendTailwindMerge({prefix: "wwc"})`, so a prefixed class from a consumer *is* recognised and
 * *does* replace the component's own — which is exactly why it looks like a good trick. Whether it
 * then paints depends on whether that utility happened to be compiled into `dist/styles.css`, which
 * depends on the library's own internals and can change in any release without a semver signal.
 * `wwc:bg-green-500` works today; `wwc:bg-lime-400` renders nothing, silently. One JSDoc example
 * shipped `wwc:top-14`, which was in neither stylesheet.
 *
 * The policy this enforces: consumer-facing examples name plain, unprefixed classes from the
 * consumer's own CSS, or an inline `style` where the library's own utility would conflict.
 */

import {readdirSync, readFileSync, statSync} from "node:fs";
import {dirname, join, relative, resolve} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Published sources only — an app or a playground is a consumer of the library, not its API. */
const SCANNED_DIRS = ["packages/components/src", "packages/utils/src", "packages/tokens/src"];
const SOURCE_FILE = /\.(?:ts|tsx|mts|cts)$/;
const TEST_FILE = /\.test\.(?:ts|tsx)$/;

/**
 * Returns every `wwc:`-prefixed class named inside a JSDoc block, as `{line, text}`.
 *
 * JSDoc is the scanned surface because it is the published one: it is what a consumer's editor and
 * an agent's context show. A `//` note is an implementation aside, and the library's own source is
 * of course full of real `wwc:` classes — a block is only entered from a line that *starts* with
 * `/**`, so a `/*` inside a string (`accept="image/*"`, a glob in JSX text) opens nothing.
 */
export function findPrefixedClassesInJsDoc(source) {
	const findings = [];
	let inJsDoc = false;

	source.split("\n").forEach((line, index) => {
		const trimmed = line.trim();
		const opens = !inJsDoc && trimmed.startsWith("/**");
		if (!inJsDoc && !opens) return;

		// The text under review is the whole line once inside a block; on the opening line it starts
		// at the `/**` itself.
		const comment = opens ? trimmed : line;
		const closes = comment.includes("*/") && !(opens && trimmed === "/**");

		if (comment.includes("wwc:")) findings.push({line: index + 1, text: trimmed});

		inJsDoc = opens ? !closes : !comment.includes("*/");
	});

	return findings;
}

function* walk(dir) {
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) yield* walk(path);
		else if (SOURCE_FILE.test(entry) && !TEST_FILE.test(entry)) yield path;
	}
}

function main() {
	const violations = [];

	for (const dir of SCANNED_DIRS) {
		const absolute = join(ROOT, dir);
		for (const path of walk(absolute)) {
			for (const finding of findPrefixedClassesInJsDoc(readFileSync(path, "utf8"))) {
				violations.push({path: relative(ROOT, path), ...finding});
			}
		}
	}

	if (violations.length === 0) {
		console.log("✓ No wwc: classes recommended in published JSDoc.");
		return;
	}

	console.error(`✗ ${violations.length} JSDoc line(s) name a wwc: class:\n`);
	for (const violation of violations) {
		console.error(`  ${violation.path}:${violation.line}\n    ${violation.text}`);
	}
	console.error(
		"\nThe wwc: prefix is an internal build detail — a consumer's prefixed class only paints if the\n" +
			"library itself happened to compile that utility. Name a plain class from the consumer's own CSS,\n" +
			"or an inline `style` where the library's own utility would conflict.",
	);
	process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
