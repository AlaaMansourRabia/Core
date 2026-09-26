/**
 * Highlight current position clearly.
 */
import {
	CaptureRouteMinimap,
	CaptureRouteMinimapPath,
	CaptureRouteMinimapMarker,
} from "@corensystem/coren-ui/capture-route-minimap";

export function MarkerDo() {
	return (
		<CaptureRouteMinimap className="wwc:w-48 wwc:h-48">
			<CaptureRouteMinimapPath
				points={[
					[0, 0],
					[50, 25],
					[100, 50],
				]}
			/>
			<CaptureRouteMinimapMarker position={[50, 25]} active pulse />
		</CaptureRouteMinimap>
	);
}
