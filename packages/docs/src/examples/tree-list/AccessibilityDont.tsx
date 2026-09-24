/**
 * Avoid missing accessibility attributes.
 */
import {TreeList, TreeItem} from "@corensystem/coren-ui/tree-list";

export function AccessibilityDont() {
	return (
		<TreeList>
			{/* No aria-label, unclear purpose */}
			<TreeItem label="Item 1">
				<TreeItem label="Sub" />
			</TreeItem>
		</TreeList>
	);
}
