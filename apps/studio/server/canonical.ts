// @ts-expect-error — zero-dep .mjs SDK, typed loosely on purpose
import {createSdk, loadCatalog} from "@core/sdk";
// Canonical reflect (Phase 5). One place to read the repository's CANONICAL outputs — library-index.json,
// manifests/, and the template sources — with stat-based cache invalidation. Both /api/catalog and
// /api/preview read through here, so approved changes that have been merged and regenerated appear on the
// next request without restarting the dev server. This watches the CANONICAL REPOSITORY, not a workspace:
// there is no persistent watcher, no HMR back into Studio, and unapproved workspace edits never appear.
import {readdirSync, statSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const LIBRARY_INDEX = join(REPO_ROOT, "library-index.json");
const MANIFESTS = join(REPO_ROOT, "manifests");
const PAGES = join(REPO_ROOT, "packages", "components", "src", "pages");

// Re-fingerprinting stats ~150 files; skip it when we just checked (repeated requests in the same tick).
const TTL_MS = 1000;

const mtime = (p: string): number => {
	try {
		return statSync(p).mtimeMs;
	} catch {
		return 0;
	}
};

// The newest mtime among a directory's direct entries (catches content edits); the directory's own mtime
// catches adds/removes.
function newestIn(dir: string): number {
	let newest = mtime(dir);
	try {
		for (const f of readdirSync(dir)) newest = Math.max(newest, mtime(join(dir, f)));
	} catch {
		// dir missing — treated as 0/unchanged
	}
	return newest;
}

// A short, comparable fingerprint of the canonical inputs. When it changes, the canonical data changed.
function fingerprint(): string {
	return [Math.round(mtime(LIBRARY_INDEX)), Math.round(newestIn(MANIFESTS)), Math.round(newestIn(PAGES))].join("-");
}

type Row = Record<string, unknown>;
type Catalog = {templates: Row[]; widgets: Row[]; components: Row[]; [k: string]: unknown};
type Sdk = ReturnType<typeof createSdk>;

let version = "";
let checkedAt = 0;
let catalog: Catalog | null = null;
let sdk: Sdk | null = null;

// Rebuild the catalog + SDK only when the canonical fingerprint has changed (throttled by TTL).
function ensureFresh(): void {
	const now = Date.now();
	if (sdk && now - checkedAt < TTL_MS) return;
	checkedAt = now;
	const fp = fingerprint();
	if (fp === version && sdk) return;
	catalog = loadCatalog() as Catalog;
	sdk = createSdk(catalog);
	version = fp;
}

export function canonicalVersion(): string {
	ensureFresh();
	return version;
}

export function getCatalog(): Catalog {
	ensureFresh();
	return catalog as Catalog;
}

export function getSdk(): Sdk {
	ensureFresh();
	return sdk as Sdk;
}
