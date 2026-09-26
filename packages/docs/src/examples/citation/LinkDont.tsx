/**
 * Avoid broken or placeholder links.
 */
import {Citation} from "@corensystem/coren-ui/citation";

export function LinkDont() {
	return (
		<Citation
			href="#"
			author="Research Team"
			source="Quarterly Report"
		/>
	);
}
