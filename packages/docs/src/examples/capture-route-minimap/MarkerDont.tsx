/**
 * Avoid unclear or missing position markers.
 */
import {CaptureRouteMinimap, CaptureRouteMinimapPath} from "@corensystem/coren-ui/capture-route-minimap";

export function MarkerDont() {
	return (
		<CaptureRouteMinimap className="wwc:w-48 wwc:h-48">
			<CaptureRouteMinimapPath points={[[0, 0], [50, 25], [100, 50]]} />
		</CaptureRouteMinimap>
	);
}
