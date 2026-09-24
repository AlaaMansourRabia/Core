/**
 * Toolbar with disabled buttons.
 */
import {Toolbar, ToolbarButton, ToolbarSeparator} from "@corensystem/coren-ui/toolbar";
import {Undo, Redo, Save, Trash} from "lucide-react";

export function Disabled() {
	return (
		<Toolbar className="wwc:border wwc:rounded-md wwc:p-1">
			<ToolbarButton aria-label="Undo" disabled>
				<Undo className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Redo" disabled>
				<Redo className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarSeparator />
			<ToolbarButton aria-label="Save">
				<Save className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Delete" disabled>
				<Trash className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
		</Toolbar>
	);
}
