/**
 * Avoid hiding all actions behind context menu only.
 */
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@corensystem/coren-ui/context-menu";

export function DiscoverableDont() {
	return (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:flex wwc:h-16 wwc:w-48 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:text-sm">
				File Item
				{/* No visible actions - users must discover right-click */}
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem>Open</ContextMenuItem>
				<ContextMenuItem>Rename</ContextMenuItem>
				<ContextMenuItem>Delete</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
