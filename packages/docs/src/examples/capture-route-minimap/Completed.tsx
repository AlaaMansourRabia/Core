/**
 * Capture route minimap showing completed route.
 */
import {CaptureRouteMinimap, CaptureRouteMinimapPath, CaptureRouteMinimapStatus} from "@corensystem/coren-ui/capture-route-minimap";

export function Completed() {
	return (
		<CaptureRouteMinimap className="wwc:w-48 wwc:h-48">
			<CaptureRouteMinimapPath points={[[0, 0], [50, 25], [100, 50]]} completed />
			<CaptureRouteMinimapStatus>Complete</CaptureRouteMinimapStatus>
		</CaptureRouteMinimap>
	);
}
