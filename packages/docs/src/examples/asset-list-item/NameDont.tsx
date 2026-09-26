/**
 * Avoid truncating important filename parts.
 */
import {AssetListItem, AssetListItemIcon, AssetListItemName} from "@corensystem/coren-ui/asset-list-item";
import {FileText} from "lucide-react";

export function NameDont() {
	return (
		<AssetListItem>
			<AssetListItemIcon>
				<FileText className="wwc:h-5 wwc:w-5" />
			</AssetListItemIcon>
			<AssetListItemName>quarterly...</AssetListItemName>
		</AssetListItem>
	);
}
