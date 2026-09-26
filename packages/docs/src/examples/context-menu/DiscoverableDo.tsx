import {Button} from "@corensystem/coren-ui/button";
/**
 * Make primary actions also accessible via other UI elements.
 */
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from "@corensystem/coren-ui/context-menu";
import {MoreHorizontal} from "lucide-react";

export function DiscoverableDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<ContextMenu>
				<ContextMenuTrigger className="wwc:flex wwc:h-16 wwc:w-48 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:text-sm">
					File Item
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem>Open</ContextMenuItem>
					<ContextMenuItem>Rename</ContextMenuItem>
					<ContextMenuItem>Delete</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
			<Button variant="ghost" size="icon">
				<MoreHorizontal className="wwc:h-4 wwc:w-4" />
			</Button>
		</div>
	);
}
