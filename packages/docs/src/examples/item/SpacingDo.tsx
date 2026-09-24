/**
 * Use consistent item spacing.
 */
import {Item, ItemLabel} from "@corensystem/coren-ui/item";

export function SpacingDo() {
	return (
		<div className="wwc:space-y-1">
			<Item><ItemLabel>Item 1</ItemLabel></Item>
			<Item><ItemLabel>Item 2</ItemLabel></Item>
			<Item><ItemLabel>Item 3</ItemLabel></Item>
		</div>
	);
}
