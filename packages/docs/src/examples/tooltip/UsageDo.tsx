/**
 * Use tooltips for supplementary information.
 */
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@corensystem/coren-ui/tooltip";
import {Button} from "@corensystem/coren-ui/button";
import {Copy} from "lucide-react";

export function UsageDo() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" size="icon">
						<Copy className="wwc:h-4 wwc:w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Copy to clipboard</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
