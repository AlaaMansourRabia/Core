import {ContextMenuContent, ContextMenuItem, ContextMenuSeparator} from "@core/core-ui/context-menu";
import {BringToFront, Copy, Lock, LockOpen, Search, SendToBack, Trash2} from "lucide-react";

import type {CanvasObject} from "./canvas-object-types";
import {BLUEPRINT_MENU_ICON_SIZE} from "./constants";
import type {CanvasObjectOrderAction} from "./types";

type BlueprintCanvasContextMenuProps = {
	selectedShape: CanvasObject | null;
	onDuplicateSelected: () => void;
	onAssignSelected: () => void;
	onToggleLockSelected: () => void;
	onOrderSelected: (action: CanvasObjectOrderAction) => void;
	onDeleteSelected: () => void;
};

export function BlueprintCanvasContextMenu({
	selectedShape,
	onDuplicateSelected,
	onAssignSelected,
	onToggleLockSelected,
	onOrderSelected,
	onDeleteSelected,
}: BlueprintCanvasContextMenuProps) {
	return (
		<ContextMenuContent>
			<ContextMenuItem disabled={!selectedShape} onSelect={onDuplicateSelected}>
				<Copy size={BLUEPRINT_MENU_ICON_SIZE} className="mr-2" />
				Duplicate
			</ContextMenuItem>
			<ContextMenuItem disabled={!selectedShape || selectedShape.isLocked} onSelect={onAssignSelected}>
				<Search size={BLUEPRINT_MENU_ICON_SIZE} className="mr-2" />
				Assign LBS item
			</ContextMenuItem>
			<ContextMenuItem disabled={!selectedShape} onSelect={onToggleLockSelected}>
				{selectedShape?.isLocked ? (
					<LockOpen size={BLUEPRINT_MENU_ICON_SIZE} className="mr-2" />
				) : (
					<Lock size={BLUEPRINT_MENU_ICON_SIZE} className="mr-2" />
				)}
				{selectedShape?.isLocked ? "Unlock" : "Lock"}
			</ContextMenuItem>
			<ContextMenuSeparator />
			<ContextMenuItem disabled={!selectedShape} onSelect={() => onOrderSelected("forward")}>
				<BringToFront size={BLUEPRINT_MENU_ICON_SIZE} className="mr-2" />
				Bring forward
			</ContextMenuItem>
			<ContextMenuItem disabled={!selectedShape} onSelect={() => onOrderSelected("front")}>
				<BringToFront size={BLUEPRINT_MENU_ICON_SIZE} className="mr-2" />
				Bring to front
			</ContextMenuItem>
			<ContextMenuItem disabled={!selectedShape} onSelect={() => onOrderSelected("backward")}>
				<SendToBack size={BLUEPRINT_MENU_ICON_SIZE} className="mr-2" />
				Send backward
			</ContextMenuItem>
			<ContextMenuItem disabled={!selectedShape} onSelect={() => onOrderSelected("back")}>
				<SendToBack size={BLUEPRINT_MENU_ICON_SIZE} className="mr-2" />
				Send to back
			</ContextMenuItem>
			<ContextMenuSeparator />
			<ContextMenuItem
				disabled={!selectedShape || selectedShape.isLocked}
				onSelect={onDeleteSelected}
				className="text-destructive focus:text-destructive"
			>
				<Trash2 size={BLUEPRINT_MENU_ICON_SIZE} className="mr-2" />
				Delete
			</ContextMenuItem>
		</ContextMenuContent>
	);
}
