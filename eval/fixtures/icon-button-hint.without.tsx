import {Button} from "@corensystem/core-ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@corensystem/core-ui/tooltip";

export function RefreshButton() {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Refresh" />
			</TooltipTrigger>
			<TooltipContent>Refresh</TooltipContent>
		</Tooltip>
	);
}
