/**
 * Canvas header with save status.
 */
import {CanvasHeader, CanvasHeaderTitle, CanvasHeaderStatus} from "@corensystem/coren-ui/canvas-header";

export function WithStatus() {
	return (
		<CanvasHeader>
			<CanvasHeaderTitle>My Project</CanvasHeaderTitle>
			<CanvasHeaderStatus status="saved">All changes saved</CanvasHeaderStatus>
		</CanvasHeader>
	);
}
