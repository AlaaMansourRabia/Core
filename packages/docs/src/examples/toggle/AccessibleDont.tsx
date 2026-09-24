/**
 * Avoid icon-only toggles without accessible labels.
 */
import {Toggle} from "@corensystem/coren-ui/toggle";
import {Star} from "lucide-react";

export function AccessibleDont() {
	return (
		<Toggle>
			<Star className="wwc:size-4" />
		</Toggle>
	);
}
