/**
 * Avoid routes that overflow minimap bounds.
 */
import {CaptureRouteMinimap, CaptureRouteMinimapPath} from "@corensystem/coren-ui/capture-route-minimap";

export function ScaleDont() {
	return (
		<CaptureRouteMinimap className="wwc:w-48 wwc:h-48 wwc:overflow-hidden">
			<CaptureRouteMinimapPath
				points={[
					[0, 0],
					[150, 75],
					[200, 100],
				]}
			/>
		</CaptureRouteMinimap>
	);
}
