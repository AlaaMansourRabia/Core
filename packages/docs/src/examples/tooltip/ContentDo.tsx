/**
 * Keep tooltip content brief and scannable.
 */
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@corensystem/coren-ui/tooltip";
import {Button} from "@corensystem/coren-ui/button";

export function ContentDo() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Save</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Save changes (Ctrl+S)</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
