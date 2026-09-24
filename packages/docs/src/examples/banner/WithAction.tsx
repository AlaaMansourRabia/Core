/**
 * Banner with action button.
 */
import {Banner} from "@corensystem/coren-ui/banner";
import {Button} from "@corensystem/coren-ui/button";
import {Gift} from "lucide-react";

export function WithAction() {
	return (
		<Banner>
			<Gift className="wwc:h-4 wwc:w-4" />
			<span className="wwc:flex-1">Limited time offer: 50% off annual plans!</span>
			<Button size="sm" variant="secondary">
				Claim Offer
			</Button>
		</Banner>
	);
}
