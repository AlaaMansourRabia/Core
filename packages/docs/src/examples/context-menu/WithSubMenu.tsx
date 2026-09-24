/**
 * Context menu with nested submenus.
 */
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@corensystem/coren-ui/context-menu";

export function WithSubMenu() {
	return (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:flex wwc:h-32 wwc:w-64 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-dashed wwc:text-sm">
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem>Back</ContextMenuItem>
				<ContextMenuItem>Forward</ContextMenuItem>
				<ContextMenuSub>
					<ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<ContextMenuItem>Email</ContextMenuItem>
						<ContextMenuItem>Message</ContextMenuItem>
						<ContextMenuItem>Copy Link</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
			</ContextMenuContent>
		</ContextMenu>
	);
}
