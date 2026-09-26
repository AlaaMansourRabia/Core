/**
 * Basic toolbar with action buttons.
 */
import {Toolbar, ToolbarButton, ToolbarSeparator} from "@corensystem/coren-ui/toolbar";
import {Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight} from "lucide-react";

export function Default() {
	return (
		<Toolbar className="wwc:border wwc:rounded-md wwc:p-1">
			<ToolbarButton aria-label="Bold">
				<Bold className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Italic">
				<Italic className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Underline">
				<Underline className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarSeparator />
			<ToolbarButton aria-label="Align left">
				<AlignLeft className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Align center">
				<AlignCenter className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Align right">
				<AlignRight className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
		</Toolbar>
	);
}
