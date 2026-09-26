/**
 * Zoom tools with zoom in/out handlers.
 */
import {ZoomTools} from "@corensystem/coren-ui/zoom-tools";

export function WithPresets() {
	return (
		<ZoomTools
			zoomLevel={1}
			minZoom={0.5}
			maxZoom={2}
			onZoomIn={() => console.log("zoom in")}
			onZoomOut={() => console.log("zoom out")}
		/>
	);
}
