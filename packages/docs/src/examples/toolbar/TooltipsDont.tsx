/**
 * Avoid icon-only toolbars without tooltips.
 */
import {Toolbar, ToolbarButton, ToolbarSeparator} from "@corensystem/coren-ui/toolbar";
import {Bold, Italic, Save} from "lucide-react";

export function TooltipsDont() {
	return (
		<Toolbar className="wwc:border wwc:rounded-md wwc:p-1">
			{/* No tooltips - users must guess what icons mean */}
			<ToolbarButton aria-label="Bold">
				<Bold className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Italic">
				<Italic className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarSeparator />
			<ToolbarButton aria-label="Save">
				<Save className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
		</Toolbar>
	);
}
