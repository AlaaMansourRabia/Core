/**
 * Show editable document title.
 */
import {CanvasHeader, CanvasHeaderTitle} from "@corensystem/coren-ui/canvas-header";

export function TitleDo() {
	return (
		<CanvasHeader>
			<CanvasHeaderTitle editable>My Design Project</CanvasHeaderTitle>
		</CanvasHeader>
	);
}
