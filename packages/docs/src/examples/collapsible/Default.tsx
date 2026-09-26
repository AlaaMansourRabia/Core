import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic collapsible section.
 */
import {Collapsible, CollapsibleTrigger, CollapsibleContent} from "@corensystem/coren-ui/collapsible";
import {ChevronsUpDown} from "lucide-react";

export function Default() {
	return (
		<Collapsible className="wwc:w-80 wwc:space-y-2">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:space-x-4 wwc:px-4">
				<h4 className="wwc:text-sm wwc:font-semibold">@corensystem starred 3 repositories</h4>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm" className="wwc:w-9 wwc:p-0">
						<ChevronsUpDown className="wwc:h-4 wwc:w-4" />
						<span className="wwc:sr-only">Toggle</span>
					</Button>
				</CollapsibleTrigger>
			</div>
			<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-3 wwc:font-mono wwc:text-sm">@corensystem/coren-ui</div>
			<CollapsibleContent className="wwc:space-y-2">
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-3 wwc:font-mono wwc:text-sm">
					@corensystem/coren-docs
				</div>
				<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-3 wwc:font-mono wwc:text-sm">
					@corensystem/coren-icons
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
