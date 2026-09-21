import {FileText, FolderOpen, Info, Search, Trash2} from "lucide-react";
import {Fragment, useMemo, useState} from "react";

import {Badge} from "../badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "../breadcrumb";
import {Button} from "../button";
import {Empty} from "../empty";
import {Input} from "../input";
import {ScrollArea} from "../scroll-area";
import {SideMenu, type SideMenuGroup} from "../side-menu";
import {useFileSystem, useNodeIcon, useTypeLabel} from "./context";
import {FileSystemNew} from "./file-system-new";
import {FileSystemTable} from "./file-system-table";
import {
	fsDescendants,
	fsFolderListing,
	fsNode,
	fsQuery,
	fsTrail,
	type FileSystemDraft,
	type FileSystemNode,
} from "./model";

// A project's own page. Opening a project swaps the whole layout: the facet rail gives way to this
// project's sections, and the listing walks its folders.
//
// The sections are the ones a file system can actually fill from its own data. A host wanting more —
// a cover page, a usage report — should compose them around this widget rather than have it ship
// empty shells.

export type FileSystemProjectSection = "overview" | "files" | "trash";

export interface FileSystemProjectProps {
	projectId: string;
	/** Back to the root's all-files listing. */
	onBack: () => void;
	selectedId: string | null;
	onSelect: (node: FileSystemNode) => void;
	/** A row's NAME was clicked and it is not a folder — the host opens it. */
	onOpenName: (node: FileSystemNode) => void;
	onCreate: (draft: FileSystemDraft) => FileSystemNode | undefined;
}

export function FileSystemProject({
	projectId,
	onBack,
	selectedId,
	onSelect,
	onOpenName,
	onCreate,
}: FileSystemProjectProps) {
	const {index, byType} = useFileSystem();
	const typeLabel = useTypeLabel();
	const [section, setSection] = useState<FileSystemProjectSection>("files");
	const [query, setQuery] = useState("");
	// Where in the project you are standing. Inside a project the hierarchy IS the point — a folder you
	// cannot open is a folder you cannot file anything into — so this walks it.
	const [folderId, setFolderId] = useState(projectId);

	const project = fsNode(index, projectId);

	// Searching flattens, and spans the whole project rather than the folder you happen to be in: a
	// match one level down would otherwise look like no match at all.
	const searching = query.trim() !== "";
	const files = useMemo(
		() =>
			searching ? fsQuery(index, {rootId: projectId, folderId: projectId, query}) : fsFolderListing(index, folderId),
		[index, projectId, folderId, query, searching],
	);
	// The rail reports what the project HOLDS, not what the query left standing — a number falling as
	// you type reads as files disappearing rather than a list being narrowed.
	const fileCount = useMemo(() => fsQuery(index, {rootId: projectId, folderId: projectId}).length, [index, projectId]);
	const retired = useMemo(() => fsDescendants(index, projectId).filter((n) => n.trashed), [index, projectId]);
	const trail = useMemo(
		() => (folderId === projectId ? [] : fsTrail(index, folderId).filter((n) => n.kind === "folder")),
		[index, folderId, projectId],
	);
	const typeCounts = useMemo(() => {
		const counts = new Map<string, number>();
		for (const n of fsDescendants(index, projectId)) {
			if (n.kind !== "file" || !n.fileType || n.trashed) continue;
			counts.set(n.fileType, (counts.get(n.fileType) ?? 0) + 1);
		}
		return [...counts.entries()]
			.map(([type, count]) => ({label: byType.get(type)?.label ?? type, count}))
			.sort((a, b) => b.count - a.count);
	}, [index, projectId, byType]);

	if (!project) return null;

	const groups: SideMenuGroup[] = [
		{
			items: [
				{id: "overview", label: "Overview", icon: Info},
				{id: "files", label: "Files", icon: FileText, count: fileCount},
			],
		},
		{divider: true, items: [{id: "trash", label: "Trash", icon: Trash2, count: retired.length}]},
	];

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:md:flex-row">
			<SideMenu
				title={project.name}
				onBack={onBack}
				backLabel="Back to all files"
				showSearch={false}
				groups={groups}
				activeItemId={section}
				onItemSelect={(id) => setSection(id as FileSystemProjectSection)}
				className="wwc:md:w-[240px]"
			/>

			<ScrollArea className="wwc:min-w-0 wwc:flex-1">
				<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:p-4">
					{section === "overview" && (
						<div className="wwc:flex wwc:max-w-[70ch] wwc:flex-col wwc:gap-5">
							{project.description && (
								<p className="wwc:text-[14px] wwc:leading-relaxed wwc:text-foreground">{project.description}</p>
							)}
							{project.tags?.length ? (
								<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
									{project.tags.map((tag) => (
										<Badge key={tag} variant="secondary" className="wwc:font-normal">
											{tag}
										</Badge>
									))}
								</div>
							) : null}
							<div className="wwc:flex wwc:flex-col wwc:gap-2">
								<h3 className="wwc:text-[12px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
									What is in here
								</h3>
								{/* Counts, not a chart: a handful of numbers do not need axes, and the point is which
								    kinds of record this project holds at all. */}
								<dl className="wwc:grid wwc:grid-cols-2 wwc:gap-x-6 wwc:gap-y-2 wwc:sm:grid-cols-3">
									{typeCounts.map(({label, count}) => (
										<div key={label} className="wwc:flex wwc:items-baseline wwc:justify-between wwc:gap-2">
											<dt className="wwc:truncate wwc:text-[13px] wwc:text-muted-foreground">{label}</dt>
											<dd className="wwc:text-[15px] wwc:font-medium wwc:tabular-nums">{count}</dd>
										</div>
									))}
								</dl>
								{typeCounts.length === 0 && (
									<p className="wwc:text-[13px] wwc:text-muted-foreground">This project has no files yet.</p>
								)}
							</div>
							<div className="wwc:flex wwc:flex-col wwc:gap-1 wwc:text-[13px]">
								<span className="wwc:text-[12px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
									Last modified
								</span>
								<span className="wwc:tabular-nums">{project.updatedAt}</span>
							</div>
						</div>
					)}

					{section === "files" && !searching && trail.length > 0 && (
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink asChild>
										<button
											type="button"
											className="wwc:flex wwc:items-center wwc:gap-1.5"
											onClick={() => setFolderId(projectId)}
										>
											<CrumbIcon node={project} />
											{project.name}
										</button>
									</BreadcrumbLink>
								</BreadcrumbItem>
								{trail.map((node, i) => (
									<Fragment key={node.id}>
										<BreadcrumbSeparator />
										<BreadcrumbItem>
											{i === trail.length - 1 ? (
												<BreadcrumbPage className="wwc:flex wwc:items-center wwc:gap-1.5">
													<CrumbIcon node={node} />
													{node.name}
												</BreadcrumbPage>
											) : (
												<BreadcrumbLink asChild>
													<button
														type="button"
														className="wwc:flex wwc:items-center wwc:gap-1.5"
														onClick={() => setFolderId(node.id)}
													>
														<CrumbIcon node={node} />
														{node.name}
													</button>
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
									</Fragment>
								))}
							</BreadcrumbList>
						</Breadcrumb>
					)}

					{section === "files" && (
						<div className="wwc:flex wwc:min-w-0 wwc:flex-wrap wwc:items-center wwc:gap-2">
							<div className="wwc:relative wwc:min-w-[200px] wwc:flex-1">
								<Search className="wwc:pointer-events-none wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-3.5 wwc:w-3.5 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
								<Input
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder={`Search ${project.name}...`}
									className="wwc:h-8 wwc:pl-8 wwc:text-[13px]"
								/>
							</div>
							<FileSystemNew
								parentId={folderId}
								scope="project"
								onCreate={onCreate}
								onCreated={(node) => {
									setSection("files");
									// A new file must not land behind a live query, so the search clears with it.
									setQuery("");
									onSelect(node);
								}}
							/>
						</div>
					)}

					{section === "files" &&
						(files.length > 0 ? (
							<FileSystemTable
								rows={files}
								selectedId={selectedId}
								onSelect={onSelect}
								onOpenName={(node) => (node.kind === "folder" ? setFolderId(node.id) : onOpenName(node))}
								// A search spans the project, so its rows come from everywhere and need their paths; a
								// folder listing is one place, and every row would repeat it.
								showPath={searching}
							/>
						) : searching ? (
							<Empty
								icon={<FolderOpen className="wwc:h-8 wwc:w-8" />}
								title="No files match"
								description={`Nothing in ${project.name} matches "${query.trim()}".`}
								action={
									<Button variant="outline" size="sm" onClick={() => setQuery("")}>
										Clear search
									</Button>
								}
							/>
						) : (
							<Empty
								icon={<FolderOpen className="wwc:h-8 wwc:w-8" />}
								title="No files"
								description={
									folderId === projectId
										? "Nothing has been filed in this project yet. Use New to add the first one."
										: "This folder is empty. Use New to file something in it."
								}
							/>
						))}

					{section === "trash" &&
						(retired.length > 0 ? (
							<div className="wwc:flex wwc:flex-col wwc:gap-2">
								<p className="wwc:text-[13px] wwc:text-muted-foreground">
									Retired files. They keep their address, so a link to one still resolves, but they are listed nowhere
									else.
								</p>
								<ul className="wwc:flex wwc:flex-col wwc:divide-y wwc:divide-border wwc:rounded-lg wwc:border wwc:border-border">
									{retired.map((n) => (
										<li key={n.id} className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2.5">
											<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-[13px]">{n.name}</span>
											<span className="wwc:shrink-0 wwc:text-[12px] wwc:text-muted-foreground">{typeLabel(n)}</span>
											<span className="wwc:shrink-0 wwc:text-[12px] wwc:tabular-nums wwc:text-muted-foreground">
												{n.updatedAt}
											</span>
										</li>
									))}
								</ul>
							</div>
						) : (
							<Empty
								icon={<Trash2 className="wwc:h-8 wwc:w-8" />}
								title="Trash is empty"
								description="Nothing in this project has been retired."
							/>
						))}
				</div>
			</ScrollArea>
		</div>
	);
}

/** One crumb's mark — the same icon the node carries as a row, so the trail and the list agree. */
function CrumbIcon({node}: {node: FileSystemNode}) {
	const Icon = useNodeIcon(node);
	return <Icon className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />;
}
