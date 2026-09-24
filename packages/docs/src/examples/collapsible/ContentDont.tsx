/**
 * Avoid hiding all context in collapsed state.
 */
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "@corensystem/coren-ui/collapsible";
import {ChevronDown} from "lucide-react";

export function ContentDont() {
	return (
		<Collapsible className="wwc:w-80 wwc:rounded-lg wwc:border wwc:p-4">
			<CollapsibleTrigger className="wwc:flex wwc:items-center wwc:text-sm wwc:font-medium">
				Order Summary
				<ChevronDown className="wwc:ml-2 wwc:h-4 wwc:w-4 [[data-state=open]>&]:wwc:rotate-180" />
			</CollapsibleTrigger>
			{/* No preview info - user must expand to see anything */}
			<CollapsibleContent className="wwc:mt-3 wwc:space-y-2 wwc:border-t wwc:pt-3">
				<div className="wwc:flex wwc:justify-between wwc:text-sm">
					<span>Widget Pro</span>
					<span>$79.99</span>
				</div>
				<div className="wwc:flex wwc:justify-between wwc:text-sm">
					<span>Gadget Plus</span>
					<span>$49.99</span>
				</div>
				<div className="wwc:flex wwc:justify-between wwc:text-sm">
					<span>Accessory Kit</span>
					<span>$20.01</span>
				</div>
				<div className="wwc:flex wwc:justify-between wwc:font-medium wwc:pt-2 wwc:border-t">
					<span>Total</span>
					<span>$149.99</span>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
