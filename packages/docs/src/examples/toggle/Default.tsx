/**
 * Default toggle button.
 */
import {Toggle} from "@corensystem/coren-ui/toggle";
import {Bold} from "lucide-react";

export function Default() {
	return (
		<Toggle aria-label="Toggle bold">
			<Bold className="wwc:size-4" />
		</Toggle>
	);
}
