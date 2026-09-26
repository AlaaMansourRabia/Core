/**
 * Show clear viewport indicator.
 */
import {MapMinimap, MapMinimapViewport} from "@corensystem/coren-ui/map-minimap";

export function ViewportDo() {
	return (
		<MapMinimap className="wwc:w-32 wwc:h-32">
			<MapMinimapViewport x={25} y={30} width={30} height={25} highlighted />
		</MapMinimap>
	);
}
