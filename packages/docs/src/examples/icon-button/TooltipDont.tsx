/**
 * Avoid vague or unhelpful tooltips.
 */
import {IconButton} from "@corensystem/coren-ui/icon-button";
import {Trash2} from "lucide-react";

export function TooltipDont() {
	return (
		<IconButton tooltip="Click" variant="destructive">
			<Trash2 />
		</IconButton>
	);
}
