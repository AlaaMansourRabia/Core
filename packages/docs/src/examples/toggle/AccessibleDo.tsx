/**
 * Always include aria-label for icon-only toggles.
 */
import {Toggle} from "@corensystem/coren-ui/toggle";
import {Star} from "lucide-react";

export function AccessibleDo() {
	return (
		<Toggle aria-label="Add to favorites">
			<Star className="wwc:size-4" />
		</Toggle>
	);
}
