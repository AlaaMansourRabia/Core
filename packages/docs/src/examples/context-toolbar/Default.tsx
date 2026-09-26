/**
 * Default context toolbar for selection actions.
 */
import {ContextToolbar, ContextToolbarButton} from "@corensystem/coren-ui/context-toolbar";
import {Copy, Trash2, Edit} from "lucide-react";

export function Default() {
	return (
		<ContextToolbar>
			<ContextToolbarButton>
				<Edit className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<Copy className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<Trash2 className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
		</ContextToolbar>
	);
}
