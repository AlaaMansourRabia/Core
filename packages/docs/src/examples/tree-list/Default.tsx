/**
 * Basic tree list with nested items.
 */
import {TreeList, TreeItem} from "@corensystem/coren-ui/tree-list";

export function Default() {
	return (
		<TreeList>
			<TreeItem label="Documents">
				<TreeItem label="Work">
					<TreeItem label="Report.pdf" />
					<TreeItem label="Presentation.pptx" />
				</TreeItem>
				<TreeItem label="Personal">
					<TreeItem label="Resume.docx" />
				</TreeItem>
			</TreeItem>
			<TreeItem label="Downloads">
				<TreeItem label="image.png" />
			</TreeItem>
		</TreeList>
	);
}
