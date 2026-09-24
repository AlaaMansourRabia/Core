/**
 * Context menu with keyboard shortcuts displayed.
 */
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuShortcut,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@corensystem/coren-ui/context-menu";

export function WithShortcuts() {
	return (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:flex wwc:h-32 wwc:w-64 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-dashed wwc:text-sm">
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent className="wwc:w-48">
				<ContextMenuItem>
					Undo
					<ContextMenuShortcut>⌘Z</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
					Redo
					<ContextMenuShortcut>⌘⇧Z</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem>
					Cut
					<ContextMenuShortcut>⌘X</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
					Copy
					<ContextMenuShortcut>⌘C</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
					Paste
					<ContextMenuShortcut>⌘V</ContextMenuShortcut>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
