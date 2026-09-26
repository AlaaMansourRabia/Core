/**
 * Include proper ARIA labels.
 */
import {TreeList, TreeItem} from "@corensystem/coren-ui/tree-list";

export function AccessibilityDo() {
	return (
		<TreeList aria-label="File explorer">
			<TreeItem label="Documents" aria-expanded="true">
				<TreeItem label="Report.pdf" />
			</TreeItem>
		</TreeList>
	);
}
