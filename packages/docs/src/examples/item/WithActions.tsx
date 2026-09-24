/**
 * Item with trailing actions.
 */
import {Item, ItemLabel, ItemActions} from "@corensystem/coren-ui/item";
import {Button} from "@corensystem/coren-ui/button";
import {MoreHorizontal} from "lucide-react";

export function WithActions() {
	return (
		<Item>
			<ItemLabel>Editable Item</ItemLabel>
			<ItemActions>
				<Button variant="ghost" size="icon"><MoreHorizontal className="wwc:h-4 wwc:w-4" /></Button>
			</ItemActions>
		</Item>
	);
}
