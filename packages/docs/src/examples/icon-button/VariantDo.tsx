/**
 * Use semantic variants for destructive actions.
 */
import {IconButton} from "@corensystem/coren-ui/icon-button";
import {Trash2} from "lucide-react";

export function VariantDo() {
	return (
		<IconButton tooltip="Delete" variant="destructive">
			<Trash2 />
		</IconButton>
	);
}
