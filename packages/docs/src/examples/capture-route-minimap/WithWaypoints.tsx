/**
 * Capture route minimap with numbered waypoints.
 */
import {CaptureRouteMinimap, CaptureRouteMinimapPath, CaptureRouteMinimapWaypoint} from "@corensystem/coren-ui/capture-route-minimap";

export function WithWaypoints() {
	return (
		<CaptureRouteMinimap className="wwc:w-48 wwc:h-48">
			<CaptureRouteMinimapPath points={[[0, 0], [50, 25], [100, 50]]} />
			<CaptureRouteMinimapWaypoint position={[0, 0]} label="1" />
			<CaptureRouteMinimapWaypoint position={[50, 25]} label="2" />
			<CaptureRouteMinimapWaypoint position={[100, 50]} label="3" />
		</CaptureRouteMinimap>
	);
}
