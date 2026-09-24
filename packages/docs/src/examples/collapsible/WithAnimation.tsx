/**
 * Collapsible with smooth animation.
 */
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "@corensystem/coren-ui/collapsible";
import {Button} from "@corensystem/coren-ui/button";
import {Plus, Minus} from "lucide-react";

export function WithAnimation() {
	return (
		<Collapsible className="wwc:w-80 wwc:rounded-lg wwc:border wwc:p-4">
			<div className="wwc:flex wwc:items-center wwc:justify-between">
				<h4 className="wwc:font-semibold">FAQ: How does billing work?</h4>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="icon" className="wwc:h-8 wwc:w-8">
						<Plus className="wwc:h-4 wwc:w-4 [[data-state=open]_&]:wwc:hidden" />
						<Minus className="wwc:h-4 wwc:w-4 [[data-state=closed]_&]:wwc:hidden" />
					</Button>
				</CollapsibleTrigger>
			</div>
			<CollapsibleContent className="wwc:data-[state=open]:wwc:animate-in wwc:data-[state=closed]:wwc:animate-out wwc:data-[state=closed]:wwc:fade-out-0 wwc:data-[state=open]:wwc:fade-in-0">
				<p className="wwc:pt-4 wwc:text-sm wwc:text-muted-foreground">
					We bill monthly based on your usage. You can upgrade, downgrade, or
					cancel at any time. Unused credits roll over to the next month.
				</p>
			</CollapsibleContent>
		</Collapsible>
	);
}
