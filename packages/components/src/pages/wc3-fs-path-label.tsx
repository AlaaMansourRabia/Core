import {cn} from "@wakecap/core-utils";
import {Folder} from "lucide-react";

import {FileSystemPathText} from "../file-system";
import {HoverTooltip} from "../tooltip";
import {wc3FsLocationOf} from "./wc3-fs-store";

// The inbound half of the file system: where a record LIVES, shown beside the record itself.
//
// The file system makes every record addressable; this is what makes the address visible from the
// other end. A pipeline listed in the Pipelines perspective carries the folder it was filed in, and
// clicking it reopens Files narrowed to that folder — so the two directions are one loop rather than a
// one-way trip out of the tree.
//
// Renders nothing when the record has no address. An empty cell is honest; a "/" would claim the
// record sits at the root of a tree it is not in at all.

export interface Wc3FsPathLabelProps {
	/** The perspective that owns the record — part of the address, since ids are unique only per array. */
	perspectiveId: string;
	recordId: string;
	/** Navigate back into the file system at the record's folder. Omit to render as plain text. */
	onOpenFolder?: (folderId: string) => void;
	className?: string;
}

export function Wc3FsPathLabel({perspectiveId, recordId, onOpenFolder, className}: Wc3FsPathLabelProps) {
	const location = wc3FsLocationOf(perspectiveId, recordId);
	if (!location) return null;

	const {folderId, path} = location;
	const content = (
		<>
			<Folder className="wwc:h-3 wwc:w-3 wwc:shrink-0 wwc:text-muted-foreground" />
			<FileSystemPathText path={path} className="wwc:text-[11px]" />
		</>
	);

	// `w-full`: DataTable's body cells are `max-w-0` with overflow hidden, so a flex container sized to
	// its CONTENT overflows the cell and the tail — the folder name — is the part clipped away.
	const shared = "wwc:flex wwc:w-full wwc:min-w-0 wwc:items-center wwc:gap-1.5 wwc:text-muted-foreground";

	return (
		<HoverTooltip content={onOpenFolder ? `Show in Files — ${path}` : path}>
			{onOpenFolder ? (
				<button
					type="button"
					onClick={(e) => {
						// Rows in these listings open the record; the path opens its folder instead.
						e.stopPropagation();
						onOpenFolder(folderId);
					}}
					className={cn(
						shared,
						"wwc:rounded wwc:transition-colors wwc:hover:text-foreground wwc:hover:underline",
						"wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring",
						className,
					)}
				>
					{content}
				</button>
			) : (
				<span className={cn(shared, className)}>{content}</span>
			)}
		</HoverTooltip>
	);
}
