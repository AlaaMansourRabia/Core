/**
 * Avoid showing irrelevant or too much metadata.
 */
import {
	AssetListItem,
	AssetListItemIcon,
	AssetListItemName,
	AssetListItemMeta,
} from "@corensystem/coren-ui/asset-list-item";
import {Video} from "lucide-react";

export function InfoDont() {
	return (
		<AssetListItem>
			<AssetListItemIcon>
				<Video className="wwc:h-5 wwc:w-5" />
			</AssetListItemIcon>
			<AssetListItemName>intro.mp4</AssetListItemName>
			<AssetListItemMeta>
				Created: 2024-01-15 14:32:01 UTC • Modified: 2024-01-16 09:15:22 UTC • Owner: admin
			</AssetListItemMeta>
		</AssetListItem>
	);
}
