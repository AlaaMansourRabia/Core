/**
 * Tooltip with custom delay.
 */
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@corensystem/coren-ui/tooltip";
import {Button} from "@corensystem/coren-ui/button";

export function WithDelay() {
	return (
		<TooltipProvider delayDuration={700}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Hover (700ms delay)</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>This tooltip has a longer delay</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
