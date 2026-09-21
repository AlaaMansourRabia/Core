#!/usr/bin/env node
// Guards the two ways a hosted image silently turns into a broken <img> on core.wakecap.com.
// Both bit the Wakecore logo before: the Storybook sidebar mark and the /login screen's mark.
//
//   1. SUBPATH — Storybook is built with SB_BASE=/storybook/ and embedded under that prefix. A
//      root-absolute src ("/wakecore-large.svg") leaves Storybook entirely and lands on the app
//      root, which does not serve Storybook's public/ files. Assets the Storybook chrome points at
//      must be relative so they resolve against the manager's <base href="/storybook/">.
//
//   2. THE GATE — middleware.js redirects anonymous requests to /login. The login screen renders
//      before a session exists, so anything it references must be ungated: otherwise the browser
//      asks for an SVG and is handed login HTML, which paints as a broken image.
//
// Run: pnpm validate:hosted-assets

import {readFileSync, existsSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const errors = [];
const fail = (msg) => errors.push(msg);

// Root-absolute asset references ("/foo.svg") in a source file, minus data/http URIs.
const ASSET_REF = /["'`](\/[A-Za-z0-9_./-]+\.(?:svg|png|jpe?g|webp|avif|gif|ico))["'`]/g;
const refsIn = (file) => [...new Set([...read(file).matchAll(ASSET_REF)].map((m) => m[1]))];

// ── 1. Storybook chrome assets must be subpath-safe ──────────────────────────────────────────────
const THEME = "apps/storybook/.storybook/wakecap-theme.ts";
const theme = read(THEME);
const brandImages = [...theme.matchAll(/brandImage:\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);

if (brandImages.length === 0) fail(`${THEME}: no brandImage found — expected the Wakecore mark.`);

for (const src of brandImages) {
	if (/^(https?:|data:)/.test(src)) continue; // absolute URL / inlined — immune to the base path
	if (src.startsWith("/")) {
		fail(
			`${THEME}: brandImage "${src}" is root-absolute. Hosted, it resolves to ` +
				`core.wakecap.com${src} — outside /storybook/ — and renders broken. Drop the leading slash.`,
		);
		continue;
	}
	if (!existsSync(resolve(ROOT, "apps/storybook/public", src))) {
		fail(`${THEME}: brandImage "${src}" is not in apps/storybook/public — nothing will serve it.`);
	}
}

// ── 2. Everything the anonymous login surface references must be ungated ─────────────────────────
const middleware = read("middleware.js");

const publicList = middleware.match(/const PUBLIC = \[([^\]]*)\]/)?.[1];
const brandList = middleware.match(/const BRAND = \[([^\]]*)\]/)?.[1];
if (!publicList) fail("middleware.js: could not read the PUBLIC list — this check needs it.");
const prefixes = [publicList, brandList]
	.filter(Boolean)
	.flatMap((l) => [...l.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]));

const matcherSrc = middleware.match(/matcher:\s*\[\s*["']([^"']+)["']/)?.[1];
if (!matcherSrc) fail("middleware.js: could not read config.matcher — this check needs it.");
const matcher = matcherSrc ? new RegExp(`^${matcherSrc}$`) : null;

// The pages a signed-out visitor loads. Their assets have no session to fall back on.
const ANONYMOUS_SURFACE = ["apps/web/index.html", "apps/web/src/pages/LoginPage.tsx"];

for (const file of ANONYMOUS_SURFACE) {
	for (const ref of refsIn(file)) {
		// Two independent gates, and the asset has to clear both: config.matcher decides whether the
		// middleware runs at all on Vercel, PUBLIC decides what it lets through once it does.
		if (matcher?.test(ref)) {
			fail(
				`${file}: "${ref}" loads for signed-out visitors, but config.matcher in middleware.js still ` +
					`gates it — the browser is handed login HTML instead of the image. Add it to the matcher's exclusions.`,
			);
		}
		if (!prefixes.some((p) => ref === p || ref.startsWith(p))) {
			fail(
				`${file}: "${ref}" loads for signed-out visitors, but nothing in middleware.js's BRAND/PUBLIC ` +
					`list covers it. Add it to BRAND so the two lists stay in sync.`,
			);
		}
		if (!existsSync(resolve(ROOT, "apps/web/public", ref.slice(1)))) {
			fail(`apps/web/public${ref} is missing, but ${file} references it.`);
		}
	}
}

if (errors.length) {
	console.error(`\n✗ hosted assets: ${errors.length} problem${errors.length > 1 ? "s" : ""}\n`);
	for (const e of errors) console.error(`  • ${e}`);
	console.error("");
	process.exit(1);
}

console.log("✓ hosted assets: Storybook chrome is subpath-safe and the login screen's images are ungated");
