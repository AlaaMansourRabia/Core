/**
 * Toolbar with grouped actions.
 */
import {Toolbar, ToolbarButton, ToolbarSeparator} from "@corensystem/coren-ui/toolbar";
import {Undo, Redo, Copy, Scissors, Clipboard, ZoomIn, ZoomOut} from "lucide-react";

export function WithGroups() {
	return (
		<Toolbar className="wwc:border wwc:rounded-md wwc:p-1">
			<ToolbarButton aria-label="Undo">
				<Undo className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Redo">
				<Redo className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarSeparator />
			<ToolbarButton aria-label="Cut">
				<Scissors className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Copy">
				<Copy className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Paste">
				<Clipboard className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarSeparator />
			<ToolbarButton aria-label="Zoom in">
				<ZoomIn className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Zoom out">
				<ZoomOut className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
		</Toolbar>
	);
}
