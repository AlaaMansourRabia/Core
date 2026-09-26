/**
 * Show tooltips with keyboard shortcuts.
 */
import {Toolbar, ToolbarButton, ToolbarSeparator} from "@corensystem/coren-ui/toolbar";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@corensystem/coren-ui/tooltip";
import {Bold, Italic, Save} from "lucide-react";

export function TooltipsDo() {
	return (
		<TooltipProvider>
			<Toolbar className="wwc:border wwc:rounded-md wwc:p-1">
				<Tooltip>
					<TooltipTrigger asChild>
						<ToolbarButton aria-label="Bold">
							<Bold className="wwc:h-4 wwc:w-4" />
						</ToolbarButton>
					</TooltipTrigger>
					<TooltipContent>
						<p>Bold (⌘B)</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<ToolbarButton aria-label="Italic">
							<Italic className="wwc:h-4 wwc:w-4" />
						</ToolbarButton>
					</TooltipTrigger>
					<TooltipContent>
						<p>Italic (⌘I)</p>
					</TooltipContent>
				</Tooltip>
				<ToolbarSeparator />
				<Tooltip>
					<TooltipTrigger asChild>
						<ToolbarButton aria-label="Save">
							<Save className="wwc:h-4 wwc:w-4" />
						</ToolbarButton>
					</TooltipTrigger>
					<TooltipContent>
						<p>Save (⌘S)</p>
					</TooltipContent>
				</Tooltip>
			</Toolbar>
		</TooltipProvider>
	);
}
