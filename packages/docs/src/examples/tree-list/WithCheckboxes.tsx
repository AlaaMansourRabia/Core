/**
 * Tree list with checkbox selection.
 */
import {TreeList, TreeItem} from "@corensystem/coren-ui/tree-list";

export function WithCheckboxes() {
	return (
		<TreeList selectionMode="checkbox">
			<TreeItem label="All Files">
				<TreeItem label="Documents">
					<TreeItem label="Report.pdf" />
					<TreeItem label="Summary.docx" />
				</TreeItem>
				<TreeItem label="Images">
					<TreeItem label="photo1.png" />
					<TreeItem label="photo2.jpg" />
				</TreeItem>
			</TreeItem>
		</TreeList>
	);
}
