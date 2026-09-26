/**
 * Avoid inconsistent item spacing.
 */
import {Item, ItemTitle} from "@corensystem/coren-ui/item";

export function SpacingDont() {
	return (
		<div>
			<Item className="wwc:mb-4">
				<ItemTitle>Item 1</ItemTitle>
			</Item>
			<Item className="wwc:mb-1">
				<ItemTitle>Item 2</ItemTitle>
			</Item>
			<Item className="wwc:mb-8">
				<ItemTitle>Item 3</ItemTitle>
			</Item>
		</div>
	);
}
