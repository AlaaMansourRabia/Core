/**
 * Show full filename with extension.
 */
import {AssetListItem, AssetListItemIcon, AssetListItemName} from "@corensystem/coren-ui/asset-list-item";
import {FileText} from "lucide-react";

export function NameDo() {
	return (
		<AssetListItem>
			<AssetListItemIcon><FileText className="wwc:h-5 wwc:w-5" /></AssetListItemIcon>
			<AssetListItemName>quarterly-report-2024.pdf</AssetListItemName>
		</AssetListItem>
	);
}
