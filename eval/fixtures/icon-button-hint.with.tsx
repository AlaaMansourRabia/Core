import {Button} from "@wakecap/core-ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@wakecap/core-ui/tooltip";

export function RefreshButton() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" size="icon" aria-label="Refresh" />
				</TooltipTrigger>
				<TooltipContent>Refresh</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
