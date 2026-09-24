/**
 * Toggle with text label.
 */
import {Toggle} from "@corensystem/coren-ui/toggle";
import {Pin} from "lucide-react";

export function WithText() {
	return (
		<Toggle aria-label="Pin item">
			<Pin className="wwc:size-4" />
			Pin
		</Toggle>
	);
}
