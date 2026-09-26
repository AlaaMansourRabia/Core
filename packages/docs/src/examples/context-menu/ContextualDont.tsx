/**
 * Avoid showing irrelevant actions in context menus.
 */
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@corensystem/coren-ui/context-menu";

export function ContextualDont() {
	return (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:flex wwc:h-24 wwc:w-64 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:bg-muted/50 wwc:text-sm">
				Image Thumbnail
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem>New File</ContextMenuItem>
				<ContextMenuItem>Open</ContextMenuItem>
				<ContextMenuItem>Print</ContextMenuItem>
				<ContextMenuItem>Save As</ContextMenuItem>
				{/* Generic actions not relevant to images */}
			</ContextMenuContent>
		</ContextMenu>
	);
}
