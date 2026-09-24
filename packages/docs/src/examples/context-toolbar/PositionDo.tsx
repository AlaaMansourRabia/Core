/**
 * Position toolbar near the selection.
 */
import {ContextToolbar, ContextToolbarButton} from "@corensystem/coren-ui/context-toolbar";
import {Edit} from "lucide-react";

export function PositionDo() {
	return (
		<div className="wwc:relative wwc:inline-block">
			<span className="wwc:bg-blue-100 wwc:px-1">Selected text</span>
			<ContextToolbar floating className="wwc:absolute wwc:-top-8 wwc:left-0">
				<ContextToolbarButton><Edit className="wwc:h-4 wwc:w-4" /></ContextToolbarButton>
			</ContextToolbar>
		</div>
	);
}
