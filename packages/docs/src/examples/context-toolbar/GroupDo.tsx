/**
 * Group related actions together.
 */
import {ContextToolbar, ContextToolbarButton, ContextToolbarDivider} from "@corensystem/coren-ui/context-toolbar";
import {Bold, Italic, Link, Trash2} from "lucide-react";

export function GroupDo() {
	return (
		<ContextToolbar>
			<ContextToolbarButton>
				<Bold className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<Italic className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarDivider />
			<ContextToolbarButton>
				<Link className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarDivider />
			<ContextToolbarButton variant="destructive">
				<Trash2 className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
		</ContextToolbar>
	);
}
