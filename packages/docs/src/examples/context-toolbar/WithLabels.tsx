/**
 * Context toolbar with labeled buttons.
 */
import {ContextToolbar, ContextToolbarButton} from "@corensystem/coren-ui/context-toolbar";
import {Copy, Trash2} from "lucide-react";

export function WithLabels() {
	return (
		<ContextToolbar>
			<ContextToolbarButton>
				<Copy className="wwc:h-4 wwc:w-4" /> Copy
			</ContextToolbarButton>
			<ContextToolbarButton variant="destructive">
				<Trash2 className="wwc:h-4 wwc:w-4" /> Delete
			</ContextToolbarButton>
		</ContextToolbar>
	);
}
