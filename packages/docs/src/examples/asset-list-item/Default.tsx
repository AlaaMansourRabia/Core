/**
 * Default asset list item showing a file entry.
 */
import {
	AssetListItem,
	AssetListItemIcon,
	AssetListItemName,
	AssetListItemMeta,
} from "@corensystem/coren-ui/asset-list-item";
import {FileText} from "lucide-react";

export function Default() {
	return (
		<AssetListItem>
			<AssetListItemIcon>
				<FileText className="wwc:h-5 wwc:w-5" />
			</AssetListItemIcon>
			<AssetListItemName>document.pdf</AssetListItemName>
			<AssetListItemMeta>2.4 MB</AssetListItemMeta>
		</AssetListItem>
	);
}
