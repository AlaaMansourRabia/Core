/**
 * Avoid flat toolbars without logical grouping.
 */
import {Toolbar, ToolbarButton} from "@corensystem/coren-ui/toolbar";
import {Bold, Italic, List, ListOrdered, Image, Link} from "lucide-react";

export function GroupingDont() {
	return (
		<Toolbar className="wwc:border wwc:rounded-md wwc:p-1">
			{/* All tools in one flat row - harder to scan */}
			<ToolbarButton aria-label="Bold">
				<Bold className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Italic">
				<Italic className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Bullet list">
				<List className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Numbered list">
				<ListOrdered className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Insert image">
				<Image className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton aria-label="Insert link">
				<Link className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
		</Toolbar>
	);
}
