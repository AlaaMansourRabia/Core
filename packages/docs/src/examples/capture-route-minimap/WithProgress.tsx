/**
 * Capture route minimap with progress indicator.
 */
import {
	CaptureRouteMinimap,
	CaptureRouteMinimapPath,
	CaptureRouteMinimapProgress,
} from "@corensystem/coren-ui/capture-route-minimap";

export function WithProgress() {
	return (
		<CaptureRouteMinimap className="wwc:w-48 wwc:h-48">
			<CaptureRouteMinimapPath
				points={[
					[0, 0],
					[25, 20],
					[50, 40],
					[75, 30],
					[100, 50],
				]}
			/>
			<CaptureRouteMinimapProgress value={60} />
		</CaptureRouteMinimap>
	);
}
