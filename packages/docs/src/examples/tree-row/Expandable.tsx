/**
 * Expandable tree row.
 */
import {TreeRow, TreeRowLabel, TreeRowExpander} from "@corensystem/coren-ui/tree-row";

export function Expandable() {
	return (
		<TreeRow expandable>
			<TreeRowExpander />
			<TreeRowLabel>Parent Item</TreeRowLabel>
		</TreeRow>
	);
}
