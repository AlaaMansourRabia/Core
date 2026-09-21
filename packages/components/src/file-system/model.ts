import type {ComponentType} from "react";

// The file system's data model and every query over it — pure, and knowing nothing about any
// particular product's records.
//
// A widget cannot own a fixture. So nodes arrive as a prop, an INDEX is derived from them once, and
// every function here takes that index. What a "file" IS comes from the same direction: the host
// declares its own file types, with their own labels, icons and tints, and a node names one by id.
// Nothing in this file mentions a pipeline.

/** What a node IS. Only `file` carries a `ref`; the other three are containers. */
export type FileSystemKind = "root" | "project" | "folder" | "file";

/**
 * One file type the host offers — the label, mark and tint a node of that type is shown with, and
 * optionally the app that owns its records.
 */
export type FileSystemFileType = {
	id: string;
	label: string;
	icon: ComponentType<{className?: string}>;
	/**
	 * Background + foreground classes for the tinted square the icon sits in, so a kind is legible
	 * before its name is read. Omit for a neutral mark.
	 */
	tone?: string;
	/**
	 * The app that owns records of this type, named. When set, creating one is understood to create a
	 * record there and the create dialog says so; when not, the file is a place and nothing more.
	 */
	app?: string;
};

export type FileSystemNode = {
	id: string;
	name: string;
	kind: FileSystemKind;
	/** `null` only for a root. */
	parentId: string | null;
	/** Display string, not a timestamp — the host formats dates the way the rest of its product does. */
	updatedAt: string;
	/** Sort key for the listing's Last modified column. Higher is newer; units are the host's own. */
	updatedTs: number;
	/** A file type id, from the host's `fileTypes`. */
	fileType?: string;
	description?: string;
	tags?: string[];
	/**
	 * Whatever the host needs to reopen the record this file addresses. Opaque here: the widget only
	 * ever hands it back, and asks the host — through `openLabel` — whether it leads anywhere.
	 */
	ref?: unknown;
	/** Retired: still resolvable by id, never listed. */
	trashed?: boolean;
};

/**
 * The derived lookups every surface reads. Built once per node array: two indexes down the hierarchy
 * and one back up it, so "which folder is this record in?" is a map hit rather than a walk of the
 * whole hierarchy on every listing row.
 */
export type FileSystemIndex = {
	nodes: FileSystemNode[];
	byId: Map<string, FileSystemNode>;
	byParent: Map<string | null, FileSystemNode[]>;
};

/** Folders first, then files; each run alphabetical, case- and accent-insensitive. */
function compareNodes(a: FileSystemNode, b: FileSystemNode) {
	const aLeaf = a.kind === "file" ? 1 : 0;
	const bLeaf = b.kind === "file" ? 1 : 0;
	if (aLeaf !== bLeaf) return aLeaf - bLeaf;
	return a.name.localeCompare(b.name, undefined, {sensitivity: "base"});
}

export function buildFileSystemIndex(nodes: FileSystemNode[]): FileSystemIndex {
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const byParent = new Map<string | null, FileSystemNode[]>();
	for (const n of nodes) {
		const bucket = byParent.get(n.parentId);
		if (bucket) bucket.push(n);
		else byParent.set(n.parentId, [n]);
	}
	// The order every file browser uses, applied once here so no caller has to remember it.
	for (const bucket of byParent.values()) bucket.sort(compareNodes);
	return {nodes, byId, byParent};
}

export function fsNode(ix: FileSystemIndex, id: string): FileSystemNode | undefined {
	return ix.byId.get(id);
}

/** Direct children, already sorted. Returns a shared array — treat it as read-only. */
export function fsChildren(ix: FileSystemIndex, id: string | null): FileSystemNode[] {
	return ix.byParent.get(id) ?? [];
}

/**
 * Every ancestor of `id`, root first, NOT including the node itself. The breadcrumb above a listing
 * and the location under a row are both this list, formatted differently.
 */
export function fsAncestors(ix: FileSystemIndex, id: string): FileSystemNode[] {
	const out: FileSystemNode[] = [];
	let cur = ix.byId.get(id)?.parentId ?? null;
	// Guard against a malformed node array cycling forever rather than trusting the data blindly.
	const seen = new Set<string>();
	while (cur && !seen.has(cur)) {
		seen.add(cur);
		const node = ix.byId.get(cur);
		if (!node) break;
		out.unshift(node);
		cur = node.parentId;
	}
	return out;
}

/** The node and its ancestors, root first — the trail a breadcrumb renders. */
export function fsTrail(ix: FileSystemIndex, id: string): FileSystemNode[] {
	const node = ix.byId.get(id);
	return node ? [...fsAncestors(ix, id), node] : [];
}

/** Every descendant of `id`, depth-first in listing order. */
export function fsDescendants(ix: FileSystemIndex, id: string): FileSystemNode[] {
	const out: FileSystemNode[] = [];
	const walk = (parentId: string) => {
		for (const child of fsChildren(ix, parentId)) {
			out.push(child);
			if (child.kind !== "file") walk(child.id);
		}
	};
	walk(id);
	return out;
}

/**
 * A node's address as a path string.
 *
 * The root is dropped by default: a shell that names the root elsewhere — in a switcher, say — would
 * be repeating it on every row for no gain. Pass `{withRoot: true}` where it is not otherwise shown.
 */
export function fsPath(ix: FileSystemIndex, id: string, opts?: {withRoot?: boolean}): string {
	const trail = fsTrail(ix, id);
	const segments = opts?.withRoot ? trail : trail.filter((n) => n.kind !== "root");
	return `/${segments.map((n) => n.name).join("/")}`;
}

/** The path of a node's PARENT — what "where does this live?" means on a listing row. */
export function fsFolderPath(ix: FileSystemIndex, id: string, opts?: {withRoot?: boolean}): string {
	const ancestors = opts?.withRoot ? fsAncestors(ix, id) : fsAncestors(ix, id).filter((n) => n.kind !== "root");
	return ancestors.length === 0 ? "/" : `/${ancestors.map((n) => n.name).join("/")}`;
}

/**
 * A file's own tags PLUS every tag on the folders and project above it.
 *
 * Tags inherit because that is what the facet is asked to mean: a project tagged "riyadh" makes every
 * file under it a file in Riyadh, and a facet answering "no files" for a tag visible on screen would
 * be broken. Counts and matches come from this one function, so the rail can never offer a value that
 * finds nothing.
 */
export function fsEffectiveTags(ix: FileSystemIndex, id: string): string[] {
	const node = ix.byId.get(id);
	if (!node) return [];
	const out = new Set(node.tags ?? []);
	for (const ancestor of fsAncestors(ix, id)) for (const tag of ancestor.tags ?? []) out.add(tag);
	return [...out];
}

/** The file node addressing a record, found by a predicate the host supplies. */
export function fsFindByRef(ix: FileSystemIndex, matches: (ref: unknown) => boolean): FileSystemNode | undefined {
	return ix.nodes.find((n) => n.ref !== undefined && matches(n.ref));
}

// ─── Queries the surfaces run ────────────────────────────────────────────────

/**
 * What a listing shows: the projects and files live under `folderId` (or under the root), narrowed by
 * the facets. Projects first, then files, each run newest first.
 *
 * PROJECTS and FILES, not plain folders. A project is a place you go — opening one changes the page —
 * so it earns a row. A plain folder does not: the folder a file sits in is already printed under its
 * name, and a folder row re-listing what is already visible would be a detour.
 */
export function fsQuery(
	ix: FileSystemIndex,
	opts: {
		rootId: string;
		/** Narrow to one folder's subtree. Omit for everything under the root. */
		folderId?: string | null;
		query?: string;
		types?: string[];
		projectIds?: string[];
		tags?: string[];
	},
): FileSystemNode[] {
	const {rootId, folderId, query, types, projectIds, tags} = opts;
	const pool = fsDescendants(ix, folderId ?? rootId);
	const q = query?.trim().toLowerCase() ?? "";

	const rows = pool.filter((n) => {
		if (n.trashed) return false;
		if (n.kind !== "file" && n.kind !== "project") return false;
		// A type is a property of a file; a project has none, so it cannot survive that filter.
		if (types?.length && (n.kind !== "file" || !n.fileType || !types.includes(n.fileType))) return false;
		if (tags?.length) {
			const effective = fsEffectiveTags(ix, n.id);
			if (!tags.some((t) => effective.includes(t))) return false;
		}
		if (projectIds?.length) {
			// A project row answers for itself; a file answers through the project above it.
			const project = n.kind === "project" ? n : fsAncestors(ix, n.id).find((a) => a.kind === "project");
			if (!project || !projectIds.includes(project.id)) return false;
		}
		// A query matches the name OR the folder it sits in, so a folder's name finds everything filed
		// under it without the folder being a row.
		if (q && !n.name.toLowerCase().includes(q) && !fsFolderPath(ix, n.id).toLowerCase().includes(q)) return false;
		return true;
	});

	// Projects lead: they are the way into the rest of the list, so burying them among the files they
	// contain would hide the entry points. Within each run, newest first.
	return [...rows].sort((a, b) => {
		const rank = (n: FileSystemNode) => (n.kind === "project" ? 0 : 1);
		return rank(a) - rank(b) || b.updatedTs - a.updatedTs;
	});
}

/**
 * One folder's DIRECT children — folders first, then files — for a surface that walks the hierarchy
 * rather than flattening it.
 *
 * The all-files listing flattens on purpose: it answers "where is this?" with a path under every row.
 * Inside a project the question is the opposite — "what is in here?" — and a folder you cannot open is
 * a folder you cannot file anything into, so there the hierarchy is the point.
 */
export function fsFolderListing(ix: FileSystemIndex, parentId: string): FileSystemNode[] {
	return fsChildren(ix, parentId).filter((n) => !n.trashed && n.kind !== "root" && n.kind !== "project");
}

/** The projects under a root. */
export function fsProjects(ix: FileSystemIndex, rootId: string): FileSystemNode[] {
	return fsChildren(ix, rootId).filter((n) => n.kind === "project");
}

/** Every project under `rootId`, with how many live files sit beneath it — the Projects facet. */
export function fsProjectCounts(ix: FileSystemIndex, rootId: string): {id: string; label: string; count: number}[] {
	return fsProjects(ix, rootId).map((project) => ({
		id: project.id,
		label: project.name,
		count: fsDescendants(ix, project.id).filter((n) => n.kind === "file" && !n.trashed).length,
	}));
}

/** Every file type present under `rootId`, with its count — the Types facet. */
export function fsTypeCounts(ix: FileSystemIndex, rootId: string): {type: string; count: number}[] {
	const counts = new Map<string, number>();
	for (const n of fsDescendants(ix, rootId)) {
		if (n.kind !== "file" || !n.fileType || n.trashed) continue;
		counts.set(n.fileType, (counts.get(n.fileType) ?? 0) + 1);
	}
	return [...counts.entries()].map(([type, count]) => ({type, count})).sort((a, b) => b.count - a.count);
}

/** Every tag matching at least one live file under `rootId`, most-used first — the Tags facet. */
export function fsTagCounts(ix: FileSystemIndex, rootId: string): {tag: string; count: number}[] {
	const counts = new Map<string, number>();
	for (const n of fsDescendants(ix, rootId)) {
		if (n.kind !== "file" || n.trashed) continue;
		for (const tag of fsEffectiveTags(ix, n.id)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({tag, count}))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

// ─── Creating ────────────────────────────────────────────────────────────────

export type FileSystemDraft = {
	name: string;
	kind: Extract<FileSystemKind, "project" | "folder" | "file">;
	parentId: string;
	fileType?: string;
	description?: string;
	tags?: string[];
	ref?: unknown;
};

/**
 * The node a draft becomes. Returned rather than appended, so the host decides where its node array
 * lives — the widget never owns the data it renders.
 *
 * Ids are generated rather than derived from the name, so the same name twice cannot collide.
 */
export function fsNodeFromDraft(draft: FileSystemDraft, id: string): FileSystemNode {
	return {
		id,
		name: draft.name,
		kind: draft.kind,
		parentId: draft.parentId,
		updatedAt: "Just now",
		// Above any seeded stamp, so a new node sorts to the top of a newest-first listing.
		updatedTs: Number.MAX_SAFE_INTEGER - Math.floor(Math.random() * 1000),
		...(draft.fileType ? {fileType: draft.fileType} : {}),
		...(draft.description ? {description: draft.description} : {}),
		...(draft.tags?.length ? {tags: draft.tags} : {}),
		...(draft.ref !== undefined ? {ref: draft.ref} : {}),
	};
}
