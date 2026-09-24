/**
 * Use file type specific icons.
 */
import {AssetListItem, AssetListItemIcon, AssetListItemName} from "@corensystem/coren-ui/asset-list-item";
import {FileSpreadsheet} from "lucide-react";

export function IconDo() {
	return (
		<AssetListItem>
			<AssetListItemIcon><FileSpreadsheet className="wwc:h-5 wwc:w-5" /></AssetListItemIcon>
			<AssetListItemName>data.csv</AssetListItemName>
		</AssetListItem>
	);
}
