import {Button} from "@corensystem/coren-ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@corensystem/coren-ui/tooltip";

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
