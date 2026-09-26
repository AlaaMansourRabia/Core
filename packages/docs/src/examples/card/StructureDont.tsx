import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid inconsistent card layouts without structure.
 */
import {Card} from "@corensystem/coren-ui/card";

export function StructureDont() {
	return (
		<Card className="wwc:w-[350px] wwc:p-4">
			<p className="wwc:font-bold">Subscription</p>
			<p>Pro Plan</p>
			<p className="wwc:text-sm">5,000 / 10,000 API calls</p>
			<Button className="wwc:mt-2">Upgrade</Button>
			<p className="wwc:text-xs wwc:mt-2">Your current usage</p>
			{/* Unstructured content mixed together */}
		</Card>
	);
}
