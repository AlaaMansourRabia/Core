/**
 * Avoid inconsistent item spacing.
 */
import {Item, ItemLabel} from "@corensystem/coren-ui/item";

export function SpacingDont() {
	return (
		<div>
			<Item className="wwc:mb-4"><ItemLabel>Item 1</ItemLabel></Item>
			<Item className="wwc:mb-1"><ItemLabel>Item 2</ItemLabel></Item>
			<Item className="wwc:mb-8"><ItemLabel>Item 3</ItemLabel></Item>
		</div>
	);
}
