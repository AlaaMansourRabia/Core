/**
 * Avoid generic or mismatched icons.
 */
import {Empty} from "@corensystem/coren-ui/empty";
import {HelpCircle} from "lucide-react";

export function IconDont() {
	return (
		<Empty
			// Generic question mark - doesn't communicate "empty cart"
			icon={<HelpCircle className="wwc:h-12 wwc:w-12" />}
			title="Your cart is empty"
			description="Browse our products and add items to your cart."
		/>
	);
}
