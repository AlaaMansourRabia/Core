/**
 * Selected asset list item state.
 */
import {
	AssetListItem,
	AssetListItemIcon,
	AssetListItemName,
	AssetListItemMeta,
} from "@corensystem/coren-ui/asset-list-item";
import {Image} from "lucide-react";

export function Selected() {
	return (
		<AssetListItem selected>
			<AssetListItemIcon>
				<Image className="wwc:h-5 wwc:w-5" />
			</AssetListItemIcon>
			<AssetListItemName>banner.png</AssetListItemName>
			<AssetListItemMeta>Selected</AssetListItemMeta>
		</AssetListItem>
	);
}
