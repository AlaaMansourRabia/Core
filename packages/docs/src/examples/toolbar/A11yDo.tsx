/**
 * Use aria-labels for icon-only buttons.
 */
import {Toolbar, ToolbarButton, ToolbarSeparator} from "@corensystem/coren-ui/toolbar";
import {Bold, Italic, Link} from "lucide-react";

export function A11yDo() {
	return (
		<Toolbar aria-label="Text formatting" className="wwc:border wwc:rounded-md wwc:p-1">
			<ToolbarButton aria-label="Bold">
				<Bold className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Italic">
				<Italic className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarSeparator />
			<ToolbarButton aria-label="Insert link">
				<Link className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
		</Toolbar>
	);
}
