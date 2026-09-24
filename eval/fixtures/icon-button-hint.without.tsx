import {Button} from "@corensystem/coren-ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@corensystem/coren-ui/tooltip";

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
