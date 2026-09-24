#!/usr/bin/env node
// The Vercel build for core.core.com. Kept in a script because vercel.json's `buildCommand` is
// capped at 256 chars. The unified app IS apps/web: its App.tsx is the Core Hub shell
// (CoreAppSidebar + CoreAppTopBar) with four tabs — Designers Hub (mounted natively, no iframe),
// Storybook (new-tab link), Studio (runs-locally card), Developer Access (hosted MCP). We build:
//
//   apps/web/dist/            → the app (served at /)
//   apps/web/dist/storybook/  ← storybook static (SB_BASE=/storybook/), opened in a new tab
//   apps/web/dist/.agents/ + plugins/ → the hosted Codex marketplace and plugin archive
//   api/mcp.mjs + api/_bundle → the MCP function
//
// apps/hub is NOT built here anymore (it stays a local-only dev launcher).

import {execSync} from "node:child_process";

function run(cmd, env = {}) {
	process.stdout.write(`\n▸ ${cmd}${Object.keys(env).length ? ` (${JSON.stringify(env)})` : ""}\n`);
	execSync(cmd, {stdio: "inherit", env: {...process.env, ...env}});
}

// Fail before we spend a build on a deploy that would ship a broken logo: the Storybook chrome must
// be subpath-safe and the login screen's images must stay outside the auth gate.
run("node scripts/validate-hosted-assets.mjs");

// Shared libraries + the knowledge core (their consumers below resolve the built dist).
run("pnpm exec nx run-many -t build -p @corensystem/coren-ui @corensystem/coren-tokens @corensystem/coren-utils @corensystem/knowledge");

// The app (served at "/") and Storybook (served at "/storybook/", opened in a new tab).
run("pnpm --filter apps-web build");
run("pnpm --filter apps-storybook build", {SB_BASE: "/storybook/"});

// The MCP knowledge bundle the serverless function loads, then copy Storybook into the app's dist.
run("node scripts/build-mcp-bundle.mjs");
run("node scripts/assemble-hub-dist.mjs");
