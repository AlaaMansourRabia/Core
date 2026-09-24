/**
 * Item with leading icon.
 */
import {Item, ItemIcon, ItemLabel} from "@corensystem/coren-ui/item";
import {FileText} from "lucide-react";

export function WithIcon() {
	return (
		<Item>
			<ItemIcon><FileText className="wwc:h-4 wwc:w-4" /></ItemIcon>
			<ItemLabel>Document</ItemLabel>
		</Item>
	);
}
