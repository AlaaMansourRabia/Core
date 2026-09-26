/**
 * Show relevant metadata for asset type.
 */
import {
	AssetListItem,
	AssetListItemIcon,
	AssetListItemName,
	AssetListItemMeta,
} from "@corensystem/coren-ui/asset-list-item";
import {Video} from "lucide-react";

export function InfoDo() {
	return (
		<AssetListItem>
			<AssetListItemIcon>
				<Video className="wwc:h-5 wwc:w-5" />
			</AssetListItemIcon>
			<AssetListItemName>intro.mp4</AssetListItemName>
			<AssetListItemMeta>2:34 • 45 MB</AssetListItemMeta>
		</AssetListItem>
	);
}
