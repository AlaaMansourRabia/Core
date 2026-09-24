/**
 * Canvas header with zoom controls.
 */
import {CanvasHeader, CanvasHeaderTitle, CanvasHeaderZoom} from "@corensystem/coren-ui/canvas-header";

export function WithZoom() {
	return (
		<CanvasHeader>
			<CanvasHeaderTitle>Floor Plan</CanvasHeaderTitle>
			<CanvasHeaderZoom value={100} min={25} max={400} />
		</CanvasHeader>
	);
}
