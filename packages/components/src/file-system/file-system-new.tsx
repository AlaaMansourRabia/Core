import {cn} from "@core/core-utils";
import {ChevronDown, Folder, FolderOpen, Plus} from "lucide-react";
import {useMemo, useState} from "react";

import {Button} from "../button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import {Input} from "../input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {Textarea} from "../textarea";
import {useFileSystem} from "./context";
import {fsDescendants, fsNode, type FileSystemDraft, type FileSystemNode} from "./model";

// "New" — the one way to add to the file system.
//
// A menu, then a dialog, rather than a dialog with a kind picker inside it: the first decision is what
// you are making, so putting it in the menu means the dialog that opens is already about that thing.
// The menu offers only what can exist where the reader is standing — a project at the root, a folder or
// a file inside one — so there is no path to creating something that would land nowhere.

export interface FileSystemNewProps {
	/** Where the new node goes. */
	parentId: string;
	/** The root creates projects; anywhere inside one creates folders and files. */
	scope: "root" | "project";
	/** Commit a draft. The host owns the node array, so the host does the appending. */
	onCreate: (draft: FileSystemDraft) => FileSystemNode | undefined;
	/** Fires with the created node, so the surface can select it. */
	onCreated?: (node: FileSystemNode) => void;
	className?: string;
}

type Draft = {kind: "project"} | {kind: "folder"} | {kind: "file"; fileType: string};

export function FileSystemNew({parentId, scope, onCreate, onCreated, className}: FileSystemNewProps) {
	const {fileTypes} = useFileSystem();
	const [draft, setDraft] = useState<Draft | null>(null);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button size="sm" className={cn("wwc:gap-1.5", className)}>
						<Plus className="wwc:h-3.5 wwc:w-3.5" />
						New
						<ChevronDown className="wwc:h-3 wwc:w-3 wwc:opacity-70" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="wwc:w-56">
					{scope === "root" ? (
						<DropdownMenuItem className="wwc:gap-2" onSelect={() => setDraft({kind: "project"})}>
							<FolderOpen className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
							Project
						</DropdownMenuItem>
					) : (
						<>
							{/* Folder leads, and takes a rule under it: it is the one thing in this menu that HOLDS
							    the others, so grouping it with them would read as another kind of file. */}
							<DropdownMenuItem className="wwc:gap-2" onSelect={() => setDraft({kind: "folder"})}>
								<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
								Folder
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{fileTypes.map((type) => (
								<DropdownMenuItem
									key={type.id}
									className="wwc:gap-2"
									onSelect={() => setDraft({kind: "file", fileType: type.id})}
								>
									<span
										className={cn(
											"wwc:flex wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded",
											type.tone,
										)}
									>
										<type.icon className="wwc:h-3 wwc:w-3" />
									</span>
									{type.label}
								</DropdownMenuItem>
							))}
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{draft && (
				<NewDialog
					draft={draft}
					parentId={parentId}
					onCreate={onCreate}
					onClose={() => setDraft(null)}
					onCreated={(node) => {
						setDraft(null);
						onCreated?.(node);
					}}
				/>
			)}
		</>
	);
}

function NewDialog({
	draft,
	parentId,
	onCreate,
	onClose,
	onCreated,
}: {
	draft: Draft;
	parentId: string;
	onCreate: (draft: FileSystemDraft) => FileSystemNode | undefined;
	onClose: () => void;
	onCreated: (node: FileSystemNode) => void;
}) {
	const {index, byType} = useFileSystem();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	// Where a file lands. The container itself is a legitimate answer, so it heads the list rather than
	// forcing a folder on someone who does not want one.
	const [folderId, setFolderId] = useState(parentId);
	const [attempted, setAttempted] = useState(false);

	const isProject = draft.kind === "project";
	const isFolder = draft.kind === "folder";
	// A container holds things, so there is nowhere to file it but here.
	const isContainer = isProject || isFolder;
	const parent = fsNode(index, parentId);
	const type = draft.kind === "file" ? byType.get(draft.fileType) : undefined;

	const folders = useMemo(
		() => (isContainer ? [] : fsDescendants(index, parentId).filter((n) => n.kind === "folder" && !n.trashed)),
		[isContainer, index, parentId],
	);

	const valid = name.trim().length > 0;
	const nameError = attempted && !valid;

	const create = () => {
		// Never a disabled button — the error appears once the reader has actually tried.
		if (!valid) {
			setAttempted(true);
			return;
		}
		const created = onCreate({
			name: name.trim(),
			kind: isProject ? "project" : isFolder ? "folder" : "file",
			parentId: isContainer ? parentId : folderId,
			fileType: draft.kind === "file" ? draft.fileType : undefined,
			description: description.trim() || undefined,
		});
		if (created) onCreated(created);
		else onClose();
	};

	const typeLabel = isProject ? "project" : isFolder ? "folder" : (type?.label.toLowerCase() ?? "file");

	return (
		<Dialog open onOpenChange={(o) => !o && onClose()}>
			{/* `stacked`: the default `banded` variant is edge-to-edge, its body supplying its own padding.
			    This is the short dialog that variant's own docs describe — a sentence and two buttons. */}
			<DialogContent variant="stacked" className="wwc:w-[calc(100vw-2rem)] wwc:max-w-md">
				<DialogHeader>
					<DialogTitle>New {typeLabel}</DialogTitle>
					<DialogDescription>
						{isProject
							? `Adds a project to ${parent?.name ?? "this workspace"}.`
							: isFolder
								? `Adds a folder to ${parent?.name ?? "this project"}. Open it to file things inside.`
								: type?.app
									? `Creates a ${typeLabel} in ${type.app} and files it under ${parent?.name ?? "this project"}. Opening the file opens it there.`
									: `Adds a ${typeLabel} to ${parent?.name ?? "this project"}. No app owns this type, so it is a place in the file system and nothing more.`}
					</DialogDescription>
				</DialogHeader>

				<div className="wwc:flex wwc:flex-col wwc:gap-4">
					<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
						<label htmlFor="fs-new-name" className="wwc:text-[13px] wwc:font-medium">
							Name
						</label>
						<Input
							id="fs-new-name"
							autoFocus
							value={name}
							onChange={(e) => setName(e.target.value)}
							aria-invalid={nameError}
							className={cn(nameError && "wwc:border-destructive")}
							onKeyDown={(e) => {
								if (e.key === "Enter") create();
							}}
						/>
					</div>

					{!isContainer && folders.length > 0 && (
						<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
							<label htmlFor="fs-new-folder" className="wwc:text-[13px] wwc:font-medium">
								Folder
							</label>
							<Select value={folderId} onValueChange={setFolderId}>
								<SelectTrigger id="fs-new-folder">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={parentId}>
										<span className="wwc:flex wwc:items-center wwc:gap-2">
											<FolderOpen className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
											{parent?.name ?? "Project root"}
										</span>
									</SelectItem>
									{folders.map((f) => (
										<SelectItem key={f.id} value={f.id}>
											<span className="wwc:flex wwc:items-center wwc:gap-2">
												<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
												{f.name}
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{isContainer && (
						<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
							<label htmlFor="fs-new-desc" className="wwc:text-[13px] wwc:font-medium">
								Description <span className="wwc:font-normal wwc:text-muted-foreground">(optional)</span>
							</label>
							<Textarea
								id="fs-new-desc"
								rows={2}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={isProject ? "What is this project for?" : "What belongs in here?"}
							/>
						</div>
					)}
				</div>

				<DialogFooter className="wwc:items-center">
					<span className="wwc:mr-auto wwc:text-[13px]">
						{nameError && <span className="wwc:text-destructive">Name required.</span>}
					</span>
					<Button variant="outline" size="sm" onClick={onClose}>
						Cancel
					</Button>
					<Button size="sm" onClick={create}>
						Create {typeLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
