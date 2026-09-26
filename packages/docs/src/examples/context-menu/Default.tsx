/**
 * Basic context menu triggered by right-click.
 */
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from "@corensystem/coren-ui/context-menu";

export function Default() {
	return (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:flex wwc:h-32 wwc:w-64 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-dashed wwc:text-sm">
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem>Cut</ContextMenuItem>
				<ContextMenuItem>Copy</ContextMenuItem>
				<ContextMenuItem>Paste</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
