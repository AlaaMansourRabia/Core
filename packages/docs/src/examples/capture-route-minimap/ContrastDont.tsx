/**
 * Avoid low contrast paths.
 */
import {CaptureRouteMinimap, CaptureRouteMinimapPath} from "@corensystem/coren-ui/capture-route-minimap";

export function ContrastDont() {
	return (
		<CaptureRouteMinimap className="wwc:w-48 wwc:h-48 wwc:bg-slate-200">
			<CaptureRouteMinimapPath
				points={[
					[0, 0],
					[50, 25],
					[100, 50],
				]}
				className="wwc:stroke-slate-300"
				strokeWidth={1}
			/>
		</CaptureRouteMinimap>
	);
}
