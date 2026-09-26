/**
 * Zoom tools with editable percentage.
 */
import {ZoomTools} from "@corensystem/coren-ui/zoom-tools";

export function WithSlider() {
	return <ZoomTools zoomLevel={1.5} showPercentage onZoomChange={(level) => console.log("zoom:", level)} />;
}
