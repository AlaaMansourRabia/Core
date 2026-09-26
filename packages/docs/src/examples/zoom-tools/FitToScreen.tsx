/**
 * Zoom tools with fit button.
 */
import {ZoomTools} from "@corensystem/coren-ui/zoom-tools";

export function FitToScreen() {
	return <ZoomTools zoomLevel={1} fitLabel="Fit to view" onFit={() => console.log("fit")} />;
}
