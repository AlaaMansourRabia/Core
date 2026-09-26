/**
 * Use clear expand/collapse icons that indicate state.
 */
import {Collapsible, CollapsibleTrigger, CollapsibleContent} from "@corensystem/coren-ui/collapsible";
import {ChevronDown} from "lucide-react";

export function IconDo() {
	return (
		<Collapsible className="wwc:w-72 wwc:rounded-lg wwc:border">
			<CollapsibleTrigger className="wwc:flex wwc:w-full wwc:items-center wwc:justify-between wwc:p-4 wwc:font-medium">
				More options
				<ChevronDown className="wwc:h-4 wwc:w-4 wwc:transition-transform [[data-state=open]>&]:wwc:rotate-180" />
			</CollapsibleTrigger>
			<CollapsibleContent className="wwc:border-t wwc:p-4 wwc:text-sm">
				Additional settings and preferences
			</CollapsibleContent>
		</Collapsible>
	);
}
