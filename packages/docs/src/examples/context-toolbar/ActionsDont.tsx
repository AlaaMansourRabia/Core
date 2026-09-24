/**
 * Avoid overcrowded toolbars.
 */
import {ContextToolbar, ContextToolbarButton} from "@corensystem/coren-ui/context-toolbar";
import {Copy, Scissors, Clipboard, Trash2, Edit, Share, Download, Printer, Settings, MoreHorizontal} from "lucide-react";

export function ActionsDont() {
	return (
		<ContextToolbar>
			<ContextToolbarButton><Scissors className="wwc:h-4 wwc:w-4" /></ContextToolbarButton>
			<ContextToolbarButton><Copy className="wwc:h-4 wwc:w-4" /></ContextToolbarButton>
			<ContextToolbarButton><Clipboard className="wwc:h-4 wwc:w-4" /></ContextToolbarButton>
			<ContextToolbarButton><Trash2 className="wwc:h-4 wwc:w-4" /></ContextToolbarButton>
			<ContextToolbarButton><Edit className="wwc:h-4 wwc:w-4" /></ContextToolbarButton>
			<ContextToolbarButton><Share className="wwc:h-4 wwc:w-4" /></ContextToolbarButton>
			<ContextToolbarButton><Download className="wwc:h-4 wwc:w-4" /></ContextToolbarButton>
			<ContextToolbarButton><Printer className="wwc:h-4 wwc:w-4" /></ContextToolbarButton>
		</ContextToolbar>
	);
}
