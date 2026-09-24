/**
 * Use proper ARIA attributes for accessibility.
 */
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "@corensystem/coren-ui/collapsible";
import {Button} from "@corensystem/coren-ui/button";
import {ChevronsUpDown} from "lucide-react";

export function A11yDo() {
	return (
		<Collapsible className="wwc:w-80 wwc:space-y-2">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:px-4">
				<h4 className="wwc:text-sm wwc:font-semibold">Notifications</h4>
				<CollapsibleTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						aria-label="Toggle notifications list"
					>
						<ChevronsUpDown className="wwc:h-4 wwc:w-4" />
					</Button>
				</CollapsibleTrigger>
			</div>
			<CollapsibleContent className="wwc:space-y-2">
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-3 wwc:text-sm">
					New message from support
				</div>
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-3 wwc:text-sm">
					Your order has shipped
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
