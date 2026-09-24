/**
 * Avoid using tooltips for critical information.
 */
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@corensystem/coren-ui/tooltip";
import {Button} from "@corensystem/coren-ui/button";

export function UsageDont() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="destructive">Delete</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Warning: This will permanently delete all your data!</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
