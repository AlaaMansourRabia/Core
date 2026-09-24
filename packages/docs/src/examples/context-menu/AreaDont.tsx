/**
 * Avoid tiny trigger areas that are hard to target.
 */
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@corensystem/coren-ui/context-menu";

export function AreaDont() {
	return (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:inline-flex wwc:h-4 wwc:w-4 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted wwc:text-[8px]">
				•
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem>Action 1</ContextMenuItem>
				<ContextMenuItem>Action 2</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
