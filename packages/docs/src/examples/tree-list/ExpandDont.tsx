/**
 * Avoid expanding all nodes by default in large trees.
 */
import {TreeList, TreeItem} from "@corensystem/coren-ui/tree-list";

export function ExpandDont() {
	return (
		<TreeList expandAll>
			<TreeItem label="Root">
				<TreeItem label="Folder 1">
					<TreeItem label="Subfolder 1">
						<TreeItem label="Deep item" />
					</TreeItem>
				</TreeItem>
				<TreeItem label="Folder 2">
					<TreeItem label="Subfolder 2">
						<TreeItem label="Another deep item" />
					</TreeItem>
				</TreeItem>
			</TreeItem>
		</TreeList>
	);
}
