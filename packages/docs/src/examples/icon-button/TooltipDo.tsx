/**
 * Always provide a descriptive tooltip.
 */
import {IconButton} from "@corensystem/coren-ui/icon-button";
import {Trash2} from "lucide-react";

export function TooltipDo() {
	return (
		<IconButton tooltip="Delete item" variant="destructive">
			<Trash2 />
		</IconButton>
	);
}
