/**
 * Item with description text.
 */
import {Item, ItemTitle, ItemDescription} from "@corensystem/coren-ui/item";

export function WithDescription() {
	return (
		<Item>
			<ItemTitle>Settings</ItemTitle>
			<ItemDescription>Configure application preferences</ItemDescription>
		</Item>
	);
}
