/**
 * Use relevant icons that match the context.
 */
import {Empty} from "@corensystem/coren-ui/empty";
import {ShoppingCart} from "lucide-react";

export function IconDo() {
	return (
		<Empty
			icon={<ShoppingCart className="wwc:h-12 wwc:w-12" />}
			title="Your cart is empty"
			description="Browse our products and add items to your cart."
		/>
	);
}
