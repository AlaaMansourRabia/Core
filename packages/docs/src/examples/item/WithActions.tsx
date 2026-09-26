import {Button} from "@corensystem/coren-ui/button";
/**
 * Item with trailing actions.
 */
import {Item, ItemTitle} from "@corensystem/coren-ui/item";
import {MoreHorizontal} from "lucide-react";

export function WithActions() {
	return (
		<Item>
			<ItemTitle>Editable Item</ItemTitle>
			<ItemActions>
				<Button variant="ghost" size="icon">
					<MoreHorizontal className="wwc:h-4 wwc:w-4" />
				</Button>
			</ItemActions>
		</Item>
	);
}
