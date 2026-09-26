/**
 * Default capture route minimap for navigation.
 */
import {CaptureRouteMinimap, CaptureRouteMinimapPath, CaptureRouteMinimapMarker} from "@corensystem/coren-ui/capture-route-minimap";

export function Default() {
	return (
		<CaptureRouteMinimap className="wwc:w-48 wwc:h-48">
			<CaptureRouteMinimapPath points={[[0, 0], [50, 30], [100, 50]]} />
			<CaptureRouteMinimapMarker position={[50, 30]} active />
		</CaptureRouteMinimap>
	);
}
