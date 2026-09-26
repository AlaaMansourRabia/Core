/**
 * Avoid showing file paths as titles.
 */
import {CanvasHeader, CanvasHeaderTitle} from "@corensystem/coren-ui/canvas-header";

export function TitleDont() {
	return (
		<CanvasHeader>
			<CanvasHeaderTitle>/Users/john/Documents/designs/project-v2-final.fig</CanvasHeaderTitle>
		</CanvasHeader>
	);
}
