/**
 * Tree row with icon.
 */
import {TreeRow, TreeRowIcon, TreeRowLabel} from "@corensystem/coren-ui/tree-row";
import {Folder} from "lucide-react";

export function WithIcon() {
	return (
		<TreeRow>
			<TreeRowIcon><Folder className="wwc:h-4 wwc:w-4" /></TreeRowIcon>
			<TreeRowLabel>Documents</TreeRowLabel>
		</TreeRow>
	);
}
