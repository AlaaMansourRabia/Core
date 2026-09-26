/**
 * Show only relevant actions for context.
 */
import {ContextToolbar, ContextToolbarButton} from "@corensystem/coren-ui/context-toolbar";
import {Copy, Scissors, Clipboard} from "lucide-react";

export function ActionsDo() {
	return (
		<ContextToolbar>
			<ContextToolbarButton>
				<Scissors className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<Copy className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<Clipboard className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
		</ContextToolbar>
	);
}
