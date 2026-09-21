#!/usr/bin/env node
/**
 * fetch-3d-assets — pull heavy 3D model/mockup assets into apps/storybook/public/ at DEPLOY time.
 *
 * The meshes/models are hundreds of MB, so they are NOT committed here and NOT shipped in the
 * @wakecap/core-ui npm package. They live in the internal repo wakecap/wakecore-3d-assets and are
 * copied into the Storybook's static dir just before it builds, so the deployed (GitHub-login-gated)
 * Storybook serves them same-origin. The browser never fetches them cross-origin from GitHub.
 *
 * Usage:
 *   ASSETS_REPO_TOKEN=<token-with-read-access> node scripts/fetch-3d-assets.mjs
 *
 * - Token: a PAT / fine-grained token / GitHub App token with READ access to wakecap/wakecore-3d-assets.
 *   In CI, add it as a secret (ASSETS_REPO_TOKEN); the default Actions GITHUB_TOKEN only sees the current repo.
 * - NON-FATAL by default: if the token is missing or the clone fails, it logs and exits 0 so the DS still
 *   builds for people without asset access (the 3D views just show their "unavailable" fallback).
 *   Set REQUIRE_3D_ASSETS=1 to make it a hard failure (use on the real deploy).
 * - Skips work if the target files already exist (local dev where you copied/symlinked them) unless FORCE=1.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, cpSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "apps/storybook/public");
const manifest = JSON.parse(readFileSync(join(root, "scripts/3d-assets.manifest.json"), "utf8"));

// Token resolution: explicit env first (CI sets ASSETS_REPO_TOKEN), then fall back to the local `gh` login so
// a plain `pnpm install` / `pnpm fetch:3d-assets` "just works" for anyone signed into gh with repo access — no
// env var needed. `gh` may be absent or logged out; that's fine, we just fall through to the no-token path.
const ghToken = () => {
  try {
    return execSync("gh auth token", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
};
const token = process.env.ASSETS_REPO_TOKEN || process.env.GITHUB_TOKEN || ghToken();
const require3d = process.env.REQUIRE_3D_ASSETS === "1";
const force = process.env.FORCE === "1";

const bail = (msg) => {
  console.error(`[fetch-3d-assets] ${msg}`);
  process.exit(require3d ? 1 : 0);
};

const alreadyThere = manifest.assets.every((a) => existsSync(join(publicDir, a.to)));
if (alreadyThere && !force) {
  console.log("[fetch-3d-assets] all assets already present in apps/storybook/public/ — skipping (FORCE=1 to override).");
  process.exit(0);
}

if (!token) {
  bail(
    "no token found (ASSETS_REPO_TOKEN / GITHUB_TOKEN env, or `gh auth login`); skipping 3D asset fetch (3D views will show the fallback).",
  );
}

const tmp = join(root, ".3d-assets-cache");
rmSync(tmp, { recursive: true, force: true });
const url = `https://x-access-token:${token}@github.com/${manifest.repo}.git`;
try {
  execSync(`git clone --depth 1 --branch ${manifest.ref || "main"} "${url}" "${tmp}"`, { stdio: "inherit" });
} catch {
  rmSync(tmp, { recursive: true, force: true });
  bail(`could not clone ${manifest.repo} (check token access).`);
}

let copied = 0;
for (const a of manifest.assets) {
  const src = join(tmp, a.from);
  const dest = join(publicDir, a.to);
  if (!existsSync(src)) {
    console.warn(`[fetch-3d-assets] missing in assets repo: ${a.from}`);
    continue;
  }
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`[fetch-3d-assets] ${a.from} -> apps/storybook/public/${a.to}`);
  copied++;
}
rmSync(tmp, { recursive: true, force: true });
console.log(`[fetch-3d-assets] done (${copied}/${manifest.assets.length} asset set(s)).`);
