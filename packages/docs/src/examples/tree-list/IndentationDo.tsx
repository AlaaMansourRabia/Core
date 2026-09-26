/**
 * Use clear visual indentation for hierarchy.
 */
import {TreeList, TreeItem} from "@corensystem/coren-ui/tree-list";

export function IndentationDo() {
	return (
		<TreeList indentation={24} showLines>
			<TreeItem label="Level 1">
				<TreeItem label="Level 2">
					<TreeItem label="Level 3" />
				</TreeItem>
			</TreeItem>
		</TreeList>
	);
}
