/**
 * Avoid using toggle for navigation or destructive actions.
 */
import {Toggle} from "@corensystem/coren-ui/toggle";
import {Trash2} from "lucide-react";

export function UsageDont() {
	return (
		<Toggle aria-label="Delete">
			<Trash2 className="wwc:size-4" />
			Delete
		</Toggle>
	);
}
