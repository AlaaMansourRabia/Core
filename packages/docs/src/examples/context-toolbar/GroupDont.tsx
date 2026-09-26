/**
 * Avoid mixing unrelated actions.
 */
import {ContextToolbar, ContextToolbarButton} from "@corensystem/coren-ui/context-toolbar";
import {Bold, Trash2, Italic, Settings, Link, Download} from "lucide-react";

export function GroupDont() {
	return (
		<ContextToolbar>
			<ContextToolbarButton>
				<Bold className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<Trash2 className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<Italic className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<Settings className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<Link className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
		</ContextToolbar>
	);
}
