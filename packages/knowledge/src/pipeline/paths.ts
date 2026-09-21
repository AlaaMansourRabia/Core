// Canonical-source location + JSON reading. The knowledge index is BUILT from these repo files;
// nothing downstream reads the filesystem directly (so a DbStore can replace this wholesale).

import {existsSync, readFileSync} from "node:fs";
import {dirname, join} from "node:path";

/** Walk up from `startDir` until a directory containing `library-index.json` is found (the repo root).
 *  Override with the CORE_ROOT env var. This keeps the index buildable whether the package is run
 *  from source, from dist, or symlinked into another package's node_modules. */
export function findRepoRoot(startDir: string = import.meta.dirname): string {
	if (process.env.CORE_ROOT) return process.env.CORE_ROOT;
	let dir = startDir;
	for (let i = 0; i < 12; i++) {
		if (existsSync(join(dir, "library-index.json")) && existsSync(join(dir, "manifests"))) return dir;
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	throw new Error(
		`[knowledge] could not locate the Core repo root (no library-index.json found above ${startDir}). Set CORE_ROOT.`,
	);
}

export function readJson<T = unknown>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

/** Read a JSON file, returning `fallback` if it is missing or unparseable (generated files may be absent). */
export function readJsonSafe<T>(path: string, fallback: T): T {
	try {
		return readJson<T>(path);
	} catch {
		return fallback;
	}
}
