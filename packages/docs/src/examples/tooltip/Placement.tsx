/**
 * Tooltip placement positions.
 */
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@corensystem/coren-ui/tooltip";
import {Button} from "@corensystem/coren-ui/button";

export function Placement() {
	return (
		<TooltipProvider>
			<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline">Top</Button>
					</TooltipTrigger>
					<TooltipContent side="top">
						<p>Top tooltip</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline">Bottom</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<p>Bottom tooltip</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline">Left</Button>
					</TooltipTrigger>
					<TooltipContent side="left">
						<p>Left tooltip</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline">Right</Button>
					</TooltipTrigger>
					<TooltipContent side="right">
						<p>Right tooltip</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}
