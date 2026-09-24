/**
 * Avoid flat or unclear hierarchy.
 */
import {TreeList, TreeItem} from "@corensystem/coren-ui/tree-list";

export function IndentationDont() {
	return (
		<TreeList indentation={4}>
			<TreeItem label="Level 1">
				<TreeItem label="Level 2">
					<TreeItem label="Level 3" />
				</TreeItem>
			</TreeItem>
		</TreeList>
	);
}
