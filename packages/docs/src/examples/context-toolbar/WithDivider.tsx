/**
 * Context toolbar with action groups.
 */
import {ContextToolbar, ContextToolbarButton, ContextToolbarDivider} from "@corensystem/coren-ui/context-toolbar";
import {Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight} from "lucide-react";

export function WithDivider() {
	return (
		<ContextToolbar>
			<ContextToolbarButton>
				<Bold className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<Italic className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<Underline className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarDivider />
			<ContextToolbarButton>
				<AlignLeft className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<AlignCenter className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
			<ContextToolbarButton>
				<AlignRight className="wwc:h-4 wwc:w-4" />
			</ContextToolbarButton>
		</ContextToolbar>
	);
}
