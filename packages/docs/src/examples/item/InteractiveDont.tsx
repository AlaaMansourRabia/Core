/**
 * Avoid unclear interactive states.
 */
import {Item, ItemLabel} from "@corensystem/coren-ui/item";

export function InteractiveDont() {
	return (
		<Item>
			<ItemLabel>Is this clickable?</ItemLabel>
		</Item>
	);
}
