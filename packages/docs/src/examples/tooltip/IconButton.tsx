import {Button} from "@corensystem/coren-ui/button";
/**
 * Tooltip on icon-only buttons.
 */
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@corensystem/coren-ui/tooltip";
import {Settings, HelpCircle, Bell} from "lucide-react";

export function IconButton() {
	return (
		<TooltipProvider>
			<div className="wwc:flex wwc:gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon">
							<Settings className="wwc:h-4 wwc:w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Settings</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon">
							<HelpCircle className="wwc:h-4 wwc:w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Help</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon">
							<Bell className="wwc:h-4 wwc:w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Notifications</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}
