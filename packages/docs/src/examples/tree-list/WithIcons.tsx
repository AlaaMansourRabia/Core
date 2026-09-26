/**
 * Tree list with custom icons.
 */
import {TreeList, TreeItem} from "@corensystem/coren-ui/tree-list";
import {Folder, File, FileText, Image} from "lucide-react";

export function WithIcons() {
	return (
		<TreeList>
			<TreeItem label="Documents" icon={<Folder className="wwc:h-4 wwc:w-4" />}>
				<TreeItem label="Report.pdf" icon={<FileText className="wwc:h-4 wwc:w-4" />} />
				<TreeItem label="Notes.txt" icon={<File className="wwc:h-4 wwc:w-4" />} />
			</TreeItem>
			<TreeItem label="Images" icon={<Folder className="wwc:h-4 wwc:w-4" />}>
				<TreeItem label="photo.png" icon={<Image className="wwc:h-4 wwc:w-4" />} />
			</TreeItem>
		</TreeList>
	);
}
