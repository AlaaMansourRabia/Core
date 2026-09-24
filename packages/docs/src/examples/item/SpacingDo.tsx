/**
 * Use consistent item spacing.
 */
import {Item, ItemTitle} from "@corensystem/coren-ui/item";

export function SpacingDo() {
	return (
		<div className="wwc:space-y-1">
			<Item><ItemTitle>Item 1</ItemTitle></Item>
			<Item><ItemTitle>Item 2</ItemTitle></Item>
			<Item><ItemTitle>Item 3</ItemTitle></Item>
		</div>
	);
}
