import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid long paragraphs in tooltips.
 */
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@corensystem/coren-ui/tooltip";

export function ContentDont() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Help</Button>
				</TooltipTrigger>
				<TooltipContent className="wwc:max-w-xs">
					<p>
						This is a very long tooltip that contains way too much information. Users shouldn't have to hover to read
						paragraphs of text. Consider using a popover or help page instead.
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
