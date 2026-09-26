/**
 * Context menu with grouped items and separators.
 */
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@corensystem/coren-ui/context-menu";

export function WithGroups() {
	return (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:flex wwc:h-32 wwc:w-64 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-dashed wwc:text-sm">
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent className="wwc:w-48">
				<ContextMenuLabel>Edit</ContextMenuLabel>
				<ContextMenuItem>Cut</ContextMenuItem>
				<ContextMenuItem>Copy</ContextMenuItem>
				<ContextMenuItem>Paste</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuLabel>Selection</ContextMenuLabel>
				<ContextMenuItem>Select All</ContextMenuItem>
				<ContextMenuItem>Deselect</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
