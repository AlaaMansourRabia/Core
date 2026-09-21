import {Button} from "@core/core-ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@core/core-ui/tooltip";

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
