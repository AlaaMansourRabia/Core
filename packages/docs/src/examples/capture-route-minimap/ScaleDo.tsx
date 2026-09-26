/**
 * Use consistent minimap scale.
 */
import {CaptureRouteMinimap, CaptureRouteMinimapPath} from "@corensystem/coren-ui/capture-route-minimap";

export function ScaleDo() {
	return (
		<CaptureRouteMinimap className="wwc:w-48 wwc:h-48" scale="fit">
			<CaptureRouteMinimapPath points={[[0, 0], [50, 25], [100, 50]]} />
		</CaptureRouteMinimap>
	);
}
