/**
 * Make the trigger area clear and appropriately sized.
 */
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@corensystem/coren-ui/context-menu";

export function AreaDo() {
	return (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:flex wwc:h-32 wwc:w-full wwc:items-center wwc:justify-center wwc:rounded-md wwc:border-2 wwc:border-dashed wwc:border-muted-foreground/25 wwc:bg-muted/10 wwc:text-sm wwc:text-muted-foreground">
				Canvas Area - Right click anywhere
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem>Add Element</ContextMenuItem>
				<ContextMenuItem>Paste</ContextMenuItem>
				<ContextMenuItem>Select All</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
