/**
 * Item with description text.
 */
import {Item, ItemLabel, ItemDescription} from "@corensystem/coren-ui/item";

export function WithDescription() {
	return (
		<Item>
			<ItemLabel>Settings</ItemLabel>
			<ItemDescription>Configure application preferences</ItemDescription>
		</Item>
	);
}
