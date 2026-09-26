/**
 * Asset list item with image thumbnail.
 */
import {
	AssetListItem,
	AssetListItemThumbnail,
	AssetListItemName,
	AssetListItemMeta,
} from "@corensystem/coren-ui/asset-list-item";

export function WithThumbnail() {
	return (
		<AssetListItem>
			<AssetListItemThumbnail src="/placeholder.jpg" alt="Preview" />
			<AssetListItemName>vacation-photo.jpg</AssetListItemName>
			<AssetListItemMeta>1.8 MB • 1920×1080</AssetListItemMeta>
		</AssetListItem>
	);
}
