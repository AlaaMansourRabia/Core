/**
 * Avoid toolbar far from selection.
 */
import {ContextToolbar, ContextToolbarButton} from "@corensystem/coren-ui/context-toolbar";
import {Edit} from "lucide-react";

export function PositionDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-16">
			<ContextToolbar>
				<ContextToolbarButton>
					<Edit className="wwc:h-4 wwc:w-4" />
				</ContextToolbarButton>
			</ContextToolbar>
			<span className="wwc:bg-blue-100 wwc:px-1">Selected text way down here</span>
		</div>
	);
}
