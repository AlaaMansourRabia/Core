/**
 * Avoid using default variant for destructive actions.
 */
import {IconButton} from "@corensystem/coren-ui/icon-button";
import {Trash2} from "lucide-react";

export function VariantDont() {
	return (
		<IconButton tooltip="Delete" variant="default">
			<Trash2 />
		</IconButton>
	);
}
