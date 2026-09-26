/**
 * Nested tree rows.
 */
import {TreeRow, TreeRowLabel} from "@corensystem/coren-ui/tree-row";

export function Nested() {
	return (
		<div className="wwc:space-y-1">
			<TreeRow level={0}>
				<TreeRowLabel>Level 0</TreeRowLabel>
			</TreeRow>
			<TreeRow level={1}>
				<TreeRowLabel>Level 1</TreeRowLabel>
			</TreeRow>
			<TreeRow level={2}>
				<TreeRowLabel>Level 2</TreeRowLabel>
			</TreeRow>
		</div>
	);
}
