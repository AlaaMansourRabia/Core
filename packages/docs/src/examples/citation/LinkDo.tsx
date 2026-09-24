/**
 * Link citations to their sources when available.
 */
import {Citation} from "@corensystem/coren-ui/citation";

export function LinkDo() {
	return (
		<Citation
			href="https://example.com/research"
			author="Research Team"
			source="Quarterly Report"
		/>
	);
}
