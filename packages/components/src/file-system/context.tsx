import {Folder, FolderOpen} from "lucide-react";
import {createContext, useContext} from "react";

import type {FileSystemFileType, FileSystemIndex, FileSystemNode} from "./model";

// What every surface inside the widget needs and none of them should be handed one prop at a time:
// the index, the host's file types, and the two questions only the host can answer — what opening a
// file is called, and what happens when one is opened.
//
// Internal. The widget's public API is its props; this is how those props reach six components
// without six identical prop chains, each of which would be a chance for two surfaces to disagree.

export type FileSystemContextValue = {
	index: FileSystemIndex;
	rootId: string;
	fileTypes: FileSystemFileType[];
	byType: Map<string, FileSystemFileType>;
	/** Names the open action for a file, e.g. "Open in Pipelines". `undefined` = nothing opens it. */
	openLabel?: (node: FileSystemNode) => string | undefined;
	onOpenFile?: (node: FileSystemNode) => void;
};

const FileSystemContext = createContext<FileSystemContextValue | null>(null);

export const FileSystemProvider = FileSystemContext.Provider;

export function useFileSystem(): FileSystemContextValue {
	const value = useContext(FileSystemContext);
	if (!value) throw new Error("FileSystem surfaces must be rendered inside <FileSystem>.");
	return value;
}

/** A container is not a type, so it takes a neutral tone rather than borrowing a hue from one. */
export const CONTAINER_TONE = "wwc:bg-muted wwc:text-foreground/70";

/**
 * A node's mark: the host's icon for its file type, an open folder for a project — a container you
 * are looking inside — and a closed one for a folder, which you are looking at.
 */
export function useNodeIcon(node: FileSystemNode) {
	const {byType} = useFileSystem();
	if (node.kind === "project") return FolderOpen;
	if (node.kind !== "file") return Folder;
	return (node.fileType ? byType.get(node.fileType)?.icon : undefined) ?? Folder;
}

/** The tint behind that mark. Containers are neutral; a file takes its type's tone. */
export function useNodeTone(node: FileSystemNode): string {
	const {byType} = useFileSystem();
	if (node.kind !== "file") return CONTAINER_TONE;
	return (node.fileType ? byType.get(node.fileType)?.tone : undefined) ?? CONTAINER_TONE;
}

/** A file type's label, falling back to its id so an unregistered type is visible rather than blank. */
export function useTypeLabel(): (node: FileSystemNode) => string {
	const {byType} = useFileSystem();
	return (node) => {
		if (node.kind === "project") return "Project";
		if (node.kind === "folder") return "Folder";
		if (!node.fileType) return "File";
		return byType.get(node.fileType)?.label ?? node.fileType;
	};
}
