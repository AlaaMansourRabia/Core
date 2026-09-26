/**
 * Show preview content when collapsed.
 */
import {Collapsible, CollapsibleTrigger, CollapsibleContent} from "@corensystem/coren-ui/collapsible";
import {ChevronDown} from "lucide-react";

export function ContentDo() {
	return (
		<Collapsible className="wwc:w-80 wwc:rounded-lg wwc:border wwc:p-4">
			<div className="wwc:text-sm wwc:font-medium">Order Summary</div>
			<div className="wwc:mt-2 wwc:text-sm wwc:text-muted-foreground">3 items · $149.99</div>
			<CollapsibleTrigger className="wwc:mt-3 wwc:flex wwc:items-center wwc:text-sm wwc:text-primary">
				View details
				<ChevronDown className="wwc:ml-1 wwc:h-4 wwc:w-4 [[data-state=open]>&]:wwc:rotate-180" />
			</CollapsibleTrigger>
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
			</CollapsibleContent>
		</Collapsible>
	);
}
