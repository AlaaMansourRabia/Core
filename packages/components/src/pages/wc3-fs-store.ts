import {useSyncExternalStore} from "react";

import {
	buildFileSystemIndex,
	fsAncestors,
	fsChildren,
	fsFindByRef,
	fsFolderPath,
	fsNodeFromDraft,
	fsPath,
	type FileSystemDraft,
	type FileSystemIndex,
	type FileSystemNode,
} from "../file-system";
import {WC3_FS_NODES} from "./wc3-fs-data";
import {isWc3Ref} from "./wc3-fs-types";

// WakeCap Connect's node array, live for the session.
//
// The FileSystem widget owns no data — nodes go in as a prop — so something has to hold them. This is
// that something, and it sits at module scope rather than in the workspace's state, which is where the
// pipeline and process arrays live. The difference is who reads it: those arrays are read by one
// perspective each, while this one is read by five — every listing that shows a Location column calls
// `wc3FsLocationOf` — and threading a live array through all of them would couple perspectives that
// have no other reason to know about each other.
//
// Same lifetime as those arrays either way: seeded from a module const, mutated in-session, gone on
// reload.

let NODES: FileSystemNode[] = [...WC3_FS_NODES];
let INDEX: FileSystemIndex = buildFileSystemIndex(NODES);

const listeners = new Set<() => void>();
let revision = 0;

function emit() {
	revision += 1;
	INDEX = buildFileSystemIndex(NODES);
	for (const l of listeners) l();
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

/**
 * The live nodes, and a re-render whenever they change.
 *
 * The store is module-level, so a surface reading it has nothing to depend on; this is that
 * dependency. Returns the array itself, which is what the widget takes.
 */
export function useWc3FsNodes(): FileSystemNode[] {
	useSyncExternalStore(
		subscribe,
		() => revision,
		() => revision,
	);
	return NODES;
}

/** The index, for the non-React lookups below and for a caller that needs one directly. */
export function wc3FsIndex(): FileSystemIndex {
	return INDEX;
}

let nextId = 1;

/**
 * Add a node. Returns it, so the caller can select it — creating something and leaving the reader to
 * find it is a job half done.
 */
export function wc3FsCreate(draft: FileSystemDraft): FileSystemNode {
	const node = fsNodeFromDraft(draft, `fs-new-${nextId++}`);
	NODES = [...NODES, node];
	emit();
	return node;
}

/** Restores the seeded fixture. Only the tests use it, so one case cannot leak into the next. */
export function wc3FsResetForTests() {
	NODES = [...WC3_FS_NODES];
	nextId = 1;
	emit();
}

/**
 * Where a record lives, ready to render — `undefined` when nothing addresses it, so a listing column
 * can omit the cell rather than print a misleading "/".
 *
 * This is the inbound half of the file system, and the reason the store is module-level: it is called
 * from five perspectives that otherwise know nothing about each other.
 */
export function wc3FsLocationOf(
	perspectiveId: string,
	recordId: string,
): {node: FileSystemNode; folderId: string; path: string} | undefined {
	const node = fsFindByRef(
		INDEX,
		(ref) => isWc3Ref(ref) && ref.perspectiveId === perspectiveId && ref.recordId === recordId,
	);
	if (!node?.parentId) return undefined;
	return {node, folderId: node.parentId, path: fsFolderPath(INDEX, node.id)};
}

/** The root node named `name`, or `undefined` when that organization has no tree. */
export function wc3FsRootByName(name: string): FileSystemNode | undefined {
	return fsChildren(INDEX, null).find((n) => n.name === name);
}

/** Re-exported against the live index, so callers do not each have to fetch it first. */
export const wc3Fs = {
	node: (id: string) => INDEX.byId.get(id),
	ancestors: (id: string) => fsAncestors(INDEX, id),
	path: (id: string) => fsPath(INDEX, id),
	folderPath: (id: string) => fsFolderPath(INDEX, id),
	children: (id: string | null) => fsChildren(INDEX, id),
};
