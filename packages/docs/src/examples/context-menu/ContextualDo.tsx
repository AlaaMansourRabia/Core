/**
 * Provide context-appropriate actions for the target element.
 */
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@corensystem/coren-ui/context-menu";
import {Copy, Pencil, Trash2} from "lucide-react";

export function ContextualDo() {
	return (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:flex wwc:h-24 wwc:w-64 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:bg-muted/50 wwc:text-sm">
				Image Thumbnail
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem>
					<Copy className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Copy Image
				</ContextMenuItem>
				<ContextMenuItem>
					<Pencil className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Edit Image
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem className="wwc:text-destructive">
					<Trash2 className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
