/**
 * Ensure path visibility against background.
 */
import {CaptureRouteMinimap, CaptureRouteMinimapPath} from "@corensystem/coren-ui/capture-route-minimap";

export function ContrastDo() {
	return (
		<CaptureRouteMinimap className="wwc:w-48 wwc:h-48 wwc:bg-slate-100">
			<CaptureRouteMinimapPath points={[[0, 0], [50, 25], [100, 50]]} strokeWidth={3} />
		</CaptureRouteMinimap>
	);
}
