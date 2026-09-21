import {Button} from "@core/core-ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@core/core-ui/tooltip";

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
