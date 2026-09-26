/**
 * Floating context toolbar near selection.
 */
import {ContextToolbar, ContextToolbarButton} from "@corensystem/coren-ui/context-toolbar";
import {Link, MessageSquare, Share} from "lucide-react";

export function Floating() {
	return (
		<div className="wwc:relative wwc:p-8">
			<ContextToolbar floating>
				<ContextToolbarButton>
					<Link className="wwc:h-4 wwc:w-4" />
				</ContextToolbarButton>
				<ContextToolbarButton>
					<MessageSquare className="wwc:h-4 wwc:w-4" />
				</ContextToolbarButton>
				<ContextToolbarButton>
					<Share className="wwc:h-4 wwc:w-4" />
				</ContextToolbarButton>
			</ContextToolbar>
		</div>
	);
}
