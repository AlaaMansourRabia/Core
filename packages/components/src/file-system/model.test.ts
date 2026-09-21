import {beforeEach, describe, expect, it} from "vitest";

import {WC3_FS_NODES} from "../pages/wc3-fs-data";
import {WC3_ALL_FILE_TYPES} from "../pages/wc3-fs-types";
import {
	buildFileSystemIndex,
	fsAncestors,
	fsChildren,
	fsEffectiveTags,
	fsFindByRef,
	fsFolderListing,
	fsFolderPath,
	fsNodeFromDraft,
	fsPath,
	fsProjectCounts,
	fsQuery,
	fsTagCounts,
	fsTypeCounts,
	type FileSystemDraft,
	type FileSystemNode,
} from "./model";

// The file system is a reference layer, so its correctness is mostly about the two directions holding
// each other up: an address resolves to a record, and the record resolves back to exactly that
// address. These are the invariants the surfaces assume; break one and a Location column starts
// naming the wrong folder, quietly.

const WAKECAP = "WakeCap Construction";

/** The fixture, indexed. Tests that create rebuild it, so nothing leaks between cases. */
let nodes: FileSystemNode[] = [];
let ix = buildFileSystemIndex([]);

function reset() {
	nodes = [...WC3_FS_NODES];
	ix = buildFileSystemIndex(nodes);
}

/** Append a node the way a host would, and re-index — the model itself never mutates. */
function create(draft: FileSystemDraft): FileSystemNode {
	const node = fsNodeFromDraft(draft, `test-${nodes.length}`);
	nodes = [...nodes, node];
	ix = buildFileSystemIndex(nodes);
	return node;
}

function rootByName(name: string) {
	return fsChildren(ix, null).find((n) => n.name === name)!;
}

beforeEach(reset);

describe("wc3 file system fixtures", () => {
	it("gives every file that has a ref a unique address", () => {
		const seen = new Map<string, string>();
		for (const node of WC3_FS_NODES) {
			if (!node.ref) continue;
			const key = `${node.ref.perspectiveId}:${node.ref.recordId}`;
			expect(seen.has(key), `${key} is addressed twice: ${seen.get(key)} and ${node.id}`).toBe(false);
			seen.set(key, node.id);
		}
	});

	it("parents every node except the org roots", () => {
		for (const node of WC3_FS_NODES) {
			if (node.kind === "root") expect(node.parentId).toBeNull();
			else expect(WC3_FS_NODES.some((n) => n.id === node.parentId)).toBe(true);
		}
	});

	it("only puts a ref on a file", () => {
		for (const node of WC3_FS_NODES) if (node.ref) expect(node.kind).toBe("file");
	});
});

describe("fsPath", () => {
	it("drops the root by default and keeps it on request", () => {
		const bim = fsFindByRef(ix, (ref) => (ref as {recordId?: string}).recordId === "pipe_bim");
		expect(bim).toBeDefined();
		expect(fsPath(ix, bim!.id)).toBe("/Falcon Heights Medical Tower/Data pipelines/BIM intake — IFC → WC3 elements");
		expect(fsPath(ix, bim!.id, {withRoot: true})).toBe(
			"/WakeCap Construction/Falcon Heights Medical Tower/Data pipelines/BIM intake — IFC → WC3 elements",
		);
	});

	it("names the containing folder, not the file, for a folder path", () => {
		const bim = fsFindByRef(ix, (ref) => (ref as {recordId?: string}).recordId === "pipe_bim")!;
		expect(fsFolderPath(ix, bim.id)).toBe("/Falcon Heights Medical Tower/Data pipelines");
	});

	it("returns the root for a node with no folders above it", () => {
		const org = rootByName(WAKECAP)!;
		const project = fsChildren(ix, org.id)[0];
		expect(fsFolderPath(ix, project.id)).toBe("/");
	});
});

describe("the round trip", () => {
	it("resolves a record to the address that points back at it", () => {
		const node = fsFindByRef(ix, (ref) => (ref as {recordId?: string}).recordId === "proc_permit");
		expect(node).toBeDefined();
		expect(fsFolderPath(ix, node!.id)).toBe("/Uptown Tower/Permitting");
		// The folder that path names really contains the file it named.
		expect(fsChildren(ix, node!.parentId!).some((n) => n.id === node!.id)).toBe(true);
	});

	it("has no location for a record nothing addresses", () => {
		expect(fsFindByRef(ix, (ref) => (ref as {recordId?: string}).recordId === "nope")).toBeUndefined();
	});

	it("walks ancestors root-first without including the node", () => {
		const bim = fsFindByRef(ix, (ref) => (ref as {recordId?: string}).recordId === "pipe_bim")!;
		expect(fsAncestors(ix, bim.id).map((n) => n.kind)).toEqual(["root", "project", "folder"]);
	});
});

describe("fsQuery", () => {
	const root = () => rootByName(WAKECAP)!.id;

	it("returns projects and files, never plain folders", () => {
		const rows = fsQuery(ix, {rootId: root()});
		expect(rows.length).toBeGreaterThan(0);
		expect(rows.some((n) => n.kind === "project")).toBe(true);
		expect(rows.some((n) => n.kind === "file")).toBe(true);
		expect(rows.every((n) => n.kind === "project" || n.kind === "file")).toBe(true);
	});

	it("leads with the projects, then orders each run newest first", () => {
		const rows = fsQuery(ix, {rootId: root()});
		const firstFile = rows.findIndex((n) => n.kind === "file");
		expect(firstFile).toBeGreaterThan(0);
		expect(rows.slice(0, firstFile).every((n) => n.kind === "project")).toBe(true);
		expect(rows.slice(firstFile).every((n) => n.kind === "file")).toBe(true);
		for (const run of [rows.slice(0, firstFile), rows.slice(firstFile)]) {
			const stamps = run.map((n) => n.updatedTs);
			expect(stamps).toEqual([...stamps].sort((a, b) => b - a));
		}
	});

	it("drops project rows once a type facet is applied", () => {
		// A type is a property of a file; a project has none, so it cannot survive that filter.
		const rows = fsQuery(ix, {rootId: root(), types: ["pipeline"]});
		expect(rows.every((n) => n.kind === "file")).toBe(true);
	});

	it("keeps a project row that matches a tag facet", () => {
		const rows = fsQuery(ix, {rootId: root(), tags: ["healthcare"]});
		expect(rows.some((n) => n.kind === "project" && n.name === "Falcon Heights Medical Tower")).toBe(true);
	});

	it("never lists a retired node", () => {
		expect(fsQuery(ix, {rootId: root()}).some((n) => n.trashed)).toBe(false);
	});

	it("narrows to a folder's whole subtree, not just its direct children", () => {
		const org = rootByName(WAKECAP)!;
		const falcon = fsChildren(ix, org.id).find((n) => n.name === "Falcon Heights Medical Tower")!;
		const rows = fsQuery(ix, {rootId: org.id, folderId: falcon.id});
		// Falcon has no files of its own — every one of these sits in a folder below it.
		expect(rows.length).toBeGreaterThan(0);
		expect(rows.some((n) => n.name === "BIM intake — IFC → WC3 elements")).toBe(true);
		expect(rows.every((n) => fsAncestors(ix, n.id).some((a) => a.id === falcon.id))).toBe(true);
		// Narrowed INTO a project, that project is not also a row inside itself.
		expect(rows.every((n) => n.id !== falcon.id)).toBe(true);
	});

	it("matches a query against the folder path as well as the name", () => {
		// "Permitting" is a folder name, not part of any file's own name in it.
		const rows = fsQuery(ix, {rootId: root(), query: "Permitting"});
		expect(rows.some((n) => n.name === "Digital Work Permit")).toBe(true);
	});

	it("filters to the requested file types", () => {
		const rows = fsQuery(ix, {rootId: root(), types: ["pipeline"]});
		expect(rows.length).toBe(3);
		expect(rows.every((n) => n.fileType === "pipeline")).toBe(true);
	});

	it("filters to a project — the project row itself plus its files", () => {
		const uptown = fsProjectCounts(ix, root()).find((p) => p.label === "Uptown Tower")!;
		const rows = fsQuery(ix, {rootId: root(), projectIds: [uptown.id]});
		expect(rows.filter((n) => n.kind === "file").length).toBe(uptown.count);
		expect(rows.filter((n) => n.kind === "project").map((n) => n.id)).toEqual([uptown.id]);
		expect(rows.every((n) => n.id === uptown.id || fsAncestors(ix, n.id).some((a) => a.id === uptown.id))).toBe(true);
	});

	it("filters to any of the requested tags", () => {
		const rows = fsQuery(ix, {rootId: root(), tags: ["hse"]});
		expect(rows.length).toBeGreaterThan(0);
		expect(rows.every((n) => fsEffectiveTags(ix, n.id).includes("hse"))).toBe(true);
	});

	it("inherits a project's tags down to its files", () => {
		// "riyadh" is on the Falcon Heights project, not on any file inside it.
		const rows = fsQuery(ix, {rootId: root(), tags: ["riyadh"]});
		expect(rows.length).toBeGreaterThan(0);
		expect(rows.every((n) => n.tags?.includes("riyadh"))).toBe(false);
		expect(rows.some((n) => n.name === "BIM intake — IFC → WC3 elements")).toBe(true);
	});

	it("intersects facets rather than unioning them", () => {
		const pipelines = fsQuery(ix, {rootId: root(), types: ["pipeline"]});
		const tagged = fsQuery(ix, {rootId: root(), types: ["pipeline"], tags: ["schedule"]});
		expect(tagged.length).toBeLessThan(pipelines.length);
		expect(tagged.every((n) => n.fileType === "pipeline" && fsEffectiveTags(ix, n.id).includes("schedule"))).toBe(true);
	});
});

describe("creating a node", () => {
	it("puts a new project in the listing and in the Projects facet", () => {
		const org = rootByName(WAKECAP)!;
		const before = fsQuery(ix, {rootId: org.id}).length;
		const node = create({name: "Jeddah Waterfront", kind: "project", parentId: org.id});

		expect(fsQuery(ix, {rootId: org.id}).length).toBe(before + 1);
		// Newest first, and a project leads the list, so a project just made is the very first row.
		expect(fsQuery(ix, {rootId: org.id})[0].id).toBe(node.id);
		expect(fsProjectCounts(ix, org.id).some((p) => p.id === node.id)).toBe(true);
	});

	it("puts a new file in its project, with a location that resolves", () => {
		const org = rootByName(WAKECAP)!;
		const uptown = fsChildren(ix, org.id).find((n) => n.name === "Uptown Tower")!;
		const node = create({
			name: "Permit backlog",
			kind: "file",
			parentId: uptown.id,
			fileType: "dataset",
		});

		expect(fsQuery(ix, {rootId: org.id, folderId: uptown.id}).some((n) => n.id === node.id)).toBe(true);
		expect(fsFolderPath(ix, node.id)).toBe("/Uptown Tower");
		expect(fsAncestors(ix, node.id).some((a) => a.id === uptown.id)).toBe(true);
	});

	it("counts a new file in its type facet", () => {
		const org = rootByName(WAKECAP)!;
		const before = fsTypeCounts(ix, org.id).find((c) => c.type === "dataset")?.count ?? 0;
		create({name: "Site readings", kind: "file", parentId: org.id, fileType: "dataset"});
		expect(fsTypeCounts(ix, org.id).find((c) => c.type === "dataset")?.count).toBe(before + 1);
	});

	it("gives a created node no record, so nothing claims to open it", () => {
		const org = rootByName(WAKECAP)!;
		const node = create({name: "Notes", kind: "file", parentId: org.id, fileType: "doc"});
		expect(node.ref).toBeUndefined();
	});

	it("keeps ids unique even when two nodes are named the same", () => {
		const org = rootByName(WAKECAP)!;
		const a = create({name: "Same", kind: "file", parentId: org.id, fileType: "doc"});
		const b = create({name: "Same", kind: "file", parentId: org.id, fileType: "doc"});
		expect(a.id).not.toBe(b.id);
	});
});

describe("folders", () => {
	it("lists a folder's direct children, folders before files", () => {
		const org = rootByName(WAKECAP)!;
		const uptown = fsChildren(ix, org.id).find((n) => n.name === "Uptown Tower")!;
		const rows = fsFolderListing(ix, uptown.id);
		expect(rows.length).toBeGreaterThan(0);
		expect(rows.every((n) => n.parentId === uptown.id)).toBe(true);
		const firstFile = rows.findIndex((n) => n.kind === "file");
		if (firstFile !== -1) expect(rows.slice(firstFile).every((n) => n.kind === "file")).toBe(true);
	});

	it("opens a created folder and files into it", () => {
		const org = rootByName(WAKECAP)!;
		const uptown = fsChildren(ix, org.id).find((n) => n.name === "Uptown Tower")!;
		const folder = create({name: "Commissioning", kind: "folder", parentId: uptown.id});
		expect(fsFolderListing(ix, uptown.id).some((n) => n.id === folder.id)).toBe(true);
		// Empty until something is filed in it — the surface says so rather than showing nothing.
		expect(fsFolderListing(ix, folder.id)).toEqual([]);

		const file = create({name: "Handover checks", kind: "file", parentId: folder.id, fileType: "dataset"});
		expect(fsFolderListing(ix, folder.id).map((n) => n.id)).toEqual([file.id]);
		expect(fsFolderPath(ix, file.id)).toBe("/Uptown Tower/Commissioning");
		// And the project's flat search still reaches it, one level down.
		expect(fsQuery(ix, {rootId: org.id, folderId: uptown.id}).some((n) => n.id === file.id)).toBe(true);
	});

	it("never lists a folder on the All files page", () => {
		const org = rootByName(WAKECAP)!;
		create({name: "Commissioning", kind: "folder", parentId: org.id});
		expect(fsQuery(ix, {rootId: org.id}).every((n) => n.kind !== "folder")).toBe(true);
	});
});

describe("wc3 file types", () => {
	it("gives every creatable type its own tone", () => {
		const hued = WC3_ALL_FILE_TYPES.filter((t) => t.tone).map((t) => t.tone);
		// A type added later cannot quietly inherit another's colour and read as something it is not.
		expect(new Set(hued).size).toBe(hued.length);
	});

	it("leaves the type with no app behind it neutral", () => {
		// A document is the one type nothing opens, so a hue would promise a destination it lacks.
		const doc = WC3_ALL_FILE_TYPES.find((t) => t.id === "doc");
		expect(doc?.tone).toBeUndefined();
		expect(doc?.app).toBeUndefined();
	});

	it("names an app for exactly the types a record can be created in", () => {
		const withApp = WC3_ALL_FILE_TYPES.filter((t) => t.app).map((t) => t.id);
		expect(withApp).toEqual(["pipeline", "process", "object-type", "action-type"]);
	});

	it("declares every type the fixture actually uses", () => {
		const declared = new Set(WC3_ALL_FILE_TYPES.map((t) => t.id));
		for (const node of WC3_FS_NODES) {
			if (node.fileType) expect(declared.has(node.fileType), `${node.fileType} is undeclared`).toBe(true);
		}
	});
});

describe("facet counts", () => {
	const root = () => rootByName(WAKECAP)!.id;

	it("counts types without counting retired files", () => {
		const docs = fsTypeCounts(ix, root()).find((c) => c.type === "doc");
		// One live document; the decommission plan is retired and must not be counted.
		expect(docs?.count).toBe(1);
	});

	it("offers no facet value that would match nothing", () => {
		for (const {type, count} of fsTypeCounts(ix, root())) {
			expect(count).toBeGreaterThan(0);
			expect(fsQuery(ix, {rootId: root(), types: [type]}).length).toBe(count);
		}
		// A tag facet counts FILES, and its rows may also carry the project that matched, so the count
		// is the file half of the result.
		for (const {tag, count} of fsTagCounts(ix, root())) {
			expect(count).toBeGreaterThan(0);
			expect(fsQuery(ix, {rootId: root(), tags: [tag]}).filter((n) => n.kind === "file").length).toBe(count);
		}
		for (const {id, count} of fsProjectCounts(ix, root())) {
			expect(count).toBeGreaterThan(0);
			expect(fsQuery(ix, {rootId: root(), projectIds: [id]}).filter((n) => n.kind === "file").length).toBe(count);
		}
	});
});
