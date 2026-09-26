import {Button} from "@corensystem/coren-ui/button";
/**
 * Add tooltips to icon-only buttons for accessibility.
 */
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@corensystem/coren-ui/tooltip";
import {Trash2} from "lucide-react";

export function AccessibleDo() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" size="icon" aria-label="Delete item">
						<Trash2 className="wwc:h-4 wwc:w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Delete item</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
