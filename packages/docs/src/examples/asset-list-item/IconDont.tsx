/**
 * Avoid generic icons for all file types.
 */
import {AssetListItem, AssetListItemIcon, AssetListItemName} from "@corensystem/coren-ui/asset-list-item";
import {File} from "lucide-react";

export function IconDont() {
	return (
		<AssetListItem>
			<AssetListItemIcon><File className="wwc:h-5 wwc:w-5" /></AssetListItemIcon>
			<AssetListItemName>data.csv</AssetListItemName>
		</AssetListItem>
	);
}
