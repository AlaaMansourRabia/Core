/**
 * Nested collapsible sections for hierarchical content.
 */
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "@corensystem/coren-ui/collapsible";
import {ChevronRight} from "lucide-react";

export function Nested() {
	return (
		<Collapsible className="wwc:w-80">
			<CollapsibleTrigger className="wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:font-medium wwc:hover:bg-muted">
				<ChevronRight className="wwc:h-4 wwc:w-4 wwc:transition-transform [[data-state=open]>&]:wwc:rotate-90" />
				Documentation
			</CollapsibleTrigger>
			<CollapsibleContent className="wwc:pl-4">
				<Collapsible className="wwc:mt-1">
					<CollapsibleTrigger className="wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:hover:bg-muted">
						<ChevronRight className="wwc:h-4 wwc:w-4 wwc:transition-transform [[data-state=open]>&]:wwc:rotate-90" />
						Getting Started
					</CollapsibleTrigger>
					<CollapsibleContent className="wwc:pl-4 wwc:space-y-1">
						<div className="wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:hover:bg-muted wwc:cursor-pointer">
							Installation
						</div>
						<div className="wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:hover:bg-muted wwc:cursor-pointer">
							Quick Start
						</div>
					</CollapsibleContent>
				</Collapsible>
				<Collapsible className="wwc:mt-1">
					<CollapsibleTrigger className="wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:hover:bg-muted">
						<ChevronRight className="wwc:h-4 wwc:w-4 wwc:transition-transform [[data-state=open]>&]:wwc:rotate-90" />
						Components
					</CollapsibleTrigger>
					<CollapsibleContent className="wwc:pl-4 wwc:space-y-1">
						<div className="wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:hover:bg-muted wwc:cursor-pointer">
							Button
						</div>
						<div className="wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-sm wwc:hover:bg-muted wwc:cursor-pointer">
							Input
						</div>
					</CollapsibleContent>
				</Collapsible>
			</CollapsibleContent>
		</Collapsible>
	);
}
