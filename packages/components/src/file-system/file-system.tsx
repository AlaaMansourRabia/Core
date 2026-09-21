import {FolderOpen, Search, X} from "lucide-react";
import {useCallback, useMemo, useState} from "react";

import {Button} from "../button";
import {Empty} from "../empty";
import {Input} from "../input";
import {ScrollArea} from "../scroll-area";
import {FileSystemProvider, type FileSystemContextValue} from "./context";
import {FileSystemDetails} from "./file-system-details";
import {
	FILE_SYSTEM_NO_FILTERS,
	FileSystemFilters,
	fileSystemFilterCount,
	type FileSystemFilterValue,
} from "./file-system-filters";
import {FileSystemNew} from "./file-system-new";
import {FileSystemProject} from "./file-system-project";
import {FileSystemTable} from "./file-system-table";
import {
	buildFileSystemIndex,
	fsNode,
	fsNodeFromDraft,
	fsPath,
	fsQuery,
	type FileSystemDraft,
	type FileSystemFileType,
	type FileSystemNode,
} from "./model";

// A file system over whatever a product already has.
//
// Two layouts and one details panel, driven by where the reader is:
//
//   All files — facets down the left, every project and file under the root on the right.
//   A project — that project's own sections down the left, its folders and files on the right.
//
// Neither is a tree. On the flat listing a file's folder is printed under its name; in a project it is
// the page you are on. Opening a project SWAPS the layout rather than filtering the list, because a
// project is a place with more than a file list in it and a facet cannot take you somewhere that has
// its own sections.
//
// Rows never navigate. A row selects, and the details panel answers "what is this?"; the underlined
// NAME is the only thing that leaves. Selecting and leaving are different intentions, so they get
// different targets — a row that navigated on click would make the first question impossible to ask
// without losing your place to answer it.
//
// The widget owns no data. Nodes arrive as a prop and creation goes back out through `onCreate`, so a
// host can keep them wherever the rest of its state lives.

export interface FileSystemProps {
	/** Every node, flat, each naming its parent. The widget derives its indexes from these. */
	nodes: FileSystemNode[];
	/** The node everything is listed under — an organization, a workspace, a tenant. */
	rootId: string;
	/** The file types this product offers: their labels, marks, tints, and the app that owns each. */
	fileTypes: FileSystemFileType[];
	/**
	 * Commit a new node. Return the node that was added — the surface selects it, because creating
	 * something and leaving the reader to find it is a job half done. Return `undefined` to cancel.
	 *
	 * Omit to make the file system read-only: no New menu is rendered.
	 */
	onCreate?: (draft: FileSystemDraft) => FileSystemNode | undefined;
	/**
	 * Names the action that opens a file's record, e.g. "Open in Pipelines". Return `undefined` for a
	 * node nothing opens, and no action is offered rather than one that apologises.
	 */
	openLabel?: (node: FileSystemNode) => string | undefined;
	onOpenFile?: (node: FileSystemNode) => void;
	/** The open project, or `null` for the root listing. Controlled when both are passed. */
	projectId?: string | null;
	onProjectChange?: (projectId: string | null) => void;
	/** Narrow the flat listing to one folder's subtree. Controlled when both are passed. */
	folderId?: string | null;
	onFolderChange?: (folderId: string | null) => void;
	/** Placeholder for the search that spans the facets and the listing. */
	searchPlaceholder?: string;
}

export function FileSystem({
	nodes,
	rootId,
	fileTypes,
	onCreate,
	openLabel,
	onOpenFile,
	projectId,
	onProjectChange,
	folderId,
	onFolderChange,
	searchPlaceholder = "Search files and folders...",
}: FileSystemProps) {
	const [query, setQuery] = useState("");
	const [filters, setFilters] = useState<FileSystemFilterValue>(FILE_SYSTEM_NO_FILTERS);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	// Uncontrolled fallbacks, so the simplest use is `<FileSystem nodes rootId fileTypes />`.
	const [ownProjectId, setOwnProjectId] = useState<string | null>(null);
	const [ownFolderId, setOwnFolderId] = useState<string | null>(null);

	const openProjectId = projectId !== undefined ? projectId : ownProjectId;
	const setOpenProjectId = onProjectChange ?? setOwnProjectId;
	const narrowedFolderId = folderId !== undefined ? folderId : ownFolderId;
	const setNarrowedFolderId = onFolderChange ?? setOwnFolderId;

	const index = useMemo(() => buildFileSystemIndex(nodes), [nodes]);
	const context: FileSystemContextValue = useMemo(
		() => ({
			index,
			rootId,
			fileTypes,
			byType: new Map(fileTypes.map((t) => [t.id, t])),
			openLabel,
			onOpenFile,
		}),
		[index, rootId, fileTypes, openLabel, onOpenFile],
	);

	const folder = narrowedFolderId ? fsNode(index, narrowedFolderId) : undefined;
	const selected = selectedId ? fsNode(index, selectedId) : undefined;
	const facetCount = fileSystemFilterCount(filters);

	const rows = useMemo(
		() =>
			fsQuery(index, {
				rootId,
				folderId: narrowedFolderId,
				query,
				types: filters.types.length ? filters.types : undefined,
				projectIds: filters.projectIds.length ? filters.projectIds : undefined,
				tags: filters.tags.length ? filters.tags : undefined,
			}),
		[index, rootId, narrowedFolderId, query, filters],
	);

	const narrowed = Boolean(folder) || facetCount > 0 || query.trim() !== "";

	/** Ids are the widget's to mint when the host does not supply one, so a name twice cannot collide. */
	const create = useCallback(
		(draft: FileSystemDraft) => {
			if (!onCreate) return undefined;
			return onCreate(draft) ?? undefined;
		},
		[onCreate],
	);

	/** The underlined name: a project opens its page, a file opens whatever the host says it opens. */
	const openName = useCallback(
		(node: FileSystemNode) => {
			if (node.kind === "project") {
				setOpenProjectId(node.id);
				setSelectedId(null);
			} else onOpenFile?.(node);
		},
		[setOpenProjectId, onOpenFile],
	);

	const details = selected ? (
		<div className="wwc:hidden wwc:w-[300px] wwc:shrink-0 wwc:lg:block">
			<FileSystemDetails
				node={selected}
				onClose={() => setSelectedId(null)}
				onOpenProject={selected.kind === "project" ? openName : undefined}
			/>
		</div>
	) : null;

	if (openProjectId) {
		return (
			<FileSystemProvider value={context}>
				<div className="wwc:flex wwc:min-h-0 wwc:flex-1">
					<FileSystemProject
						projectId={openProjectId}
						onBack={() => {
							setOpenProjectId(null);
							setSelectedId(null);
						}}
						selectedId={selectedId}
						onSelect={(node) => setSelectedId(node.id)}
						onOpenName={openName}
						onCreate={create}
					/>
					{details}
				</div>
			</FileSystemProvider>
		);
	}

	return (
		<FileSystemProvider value={context}>
			<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
				{/* The search band spans the facets AND the listing, because it governs both: a query
				    narrows the rows and the facet counts follow it. */}
				<div className="wwc:flex wwc:min-w-0 wwc:flex-shrink-0 wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:border-b wwc:border-border wwc:px-4 wwc:py-2.5">
					<div className="wwc:relative wwc:min-w-[240px] wwc:flex-1">
						<Search className="wwc:pointer-events-none wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-3.5 wwc:w-3.5 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={searchPlaceholder}
							className="wwc:h-8 wwc:pl-8 wwc:text-[13px]"
						/>
					</div>
					{/* A folder narrowing arrives from outside — a "show in files" link — so it needs a visible
					    way out; without it the listing just looks like a root with fewer files in it. */}
					{folder && (
						<Button
							variant="secondary"
							size="sm"
							className="wwc:h-8 wwc:gap-1.5 wwc:text-[12px]"
							onClick={() => setNarrowedFolderId(null)}
							aria-label={`Stop filtering by ${folder.name}`}
						>
							<span className="wwc:font-mono">{fsPath(index, folder.id)}</span>
							<X className="wwc:h-3 wwc:w-3" />
						</Button>
					)}
					{onCreate && (
						<FileSystemNew
							parentId={rootId}
							scope="root"
							onCreate={create}
							onCreated={(node) => {
								// Land on the thing just made.
								setQuery("");
								setFilters(FILE_SYSTEM_NO_FILTERS);
								setSelectedId(node.id);
							}}
						/>
					)}
				</div>

				<div className="wwc:flex wwc:min-h-0 wwc:flex-1">
					{/* Facets. Fixed width, and hidden below md, where the search band carries the burden. */}
					<div className="wwc:hidden wwc:w-[240px] wwc:shrink-0 wwc:border-r wwc:border-border wwc:md:block">
						<FileSystemFilters value={filters} onChange={setFilters} />
					</div>

					<ScrollArea className="wwc:min-w-0 wwc:flex-1">
						<div className="wwc:flex wwc:flex-col wwc:gap-3 wwc:p-4">
							{rows.length === 0 ? (
								<Empty
									icon={<FolderOpen className="wwc:h-8 wwc:w-8" />}
									title="No files match"
									description={
										narrowed
											? "Nothing here matches the current search and filters."
											: "Nothing has been filed here yet."
									}
									action={
										narrowed ? (
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setQuery("");
													setFilters(FILE_SYSTEM_NO_FILTERS);
													setNarrowedFolderId(null);
												}}
											>
												Clear filters
											</Button>
										) : undefined
									}
								/>
							) : (
								<FileSystemTable
									rows={rows}
									selectedId={selectedId}
									onSelect={(node) => setSelectedId(node.id)}
									onOpenName={openName}
								/>
							)}
						</div>
					</ScrollArea>

					{details}
				</div>
			</div>
		</FileSystemProvider>
	);
}

export {fsNodeFromDraft};
