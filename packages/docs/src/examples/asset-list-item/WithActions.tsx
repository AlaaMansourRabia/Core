/**
 * Asset list item with action buttons.
 */
import {AssetListItem, AssetListItemIcon, AssetListItemName, AssetListItemActions} from "@corensystem/coren-ui/asset-list-item";
import {Button} from "@corensystem/coren-ui/button";
import {FileText, Download, Trash2} from "lucide-react";

export function WithActions() {
	return (
		<AssetListItem>
			<AssetListItemIcon>
				<FileText className="wwc:h-5 wwc:w-5" />
			</AssetListItemIcon>
			<AssetListItemName>report.xlsx</AssetListItemName>
			<AssetListItemActions>
				<Button variant="ghost" size="icon"><Download className="wwc:h-4 wwc:w-4" /></Button>
				<Button variant="ghost" size="icon"><Trash2 className="wwc:h-4 wwc:w-4" /></Button>
			</AssetListItemActions>
		</AssetListItem>
	);
}
