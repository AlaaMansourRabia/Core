/**
 * Collapsible starting in open state.
 */
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "@corensystem/coren-ui/collapsible";
import {Button} from "@corensystem/coren-ui/button";
import {ChevronsUpDown} from "lucide-react";

export function DefaultOpen() {
	return (
		<Collapsible defaultOpen className="wwc:w-80 wwc:space-y-2">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:space-x-4 wwc:px-4">
				<h4 className="wwc:text-sm wwc:font-semibold">Recent activity</h4>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm" className="wwc:w-9 wwc:p-0">
						<ChevronsUpDown className="wwc:h-4 wwc:w-4" />
						<span className="wwc:sr-only">Toggle</span>
					</Button>
				</CollapsibleTrigger>
			</div>
			<CollapsibleContent className="wwc:space-y-2">
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-3 wwc:text-sm">
					<span className="wwc:font-medium">Push event</span> - 2 minutes ago
				</div>
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-3 wwc:text-sm">
					<span className="wwc:font-medium">Pull request</span> - 5 minutes ago
				</div>
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-3 wwc:text-sm">
					<span className="wwc:font-medium">Comment</span> - 10 minutes ago
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
