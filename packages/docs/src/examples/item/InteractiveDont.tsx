/**
 * Avoid unclear interactive states.
 */
import {Item, ItemTitle} from "@corensystem/coren-ui/item";

export function InteractiveDont() {
	return (
		<Item>
			<ItemTitle>Is this clickable?</ItemTitle>
		</Item>
	);
}
