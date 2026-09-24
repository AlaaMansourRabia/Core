/**
 * Minimap with location markers.
 */
import {MapMinimap, MapMinimapViewport, MapMinimapMarker} from "@corensystem/coren-ui/map-minimap";

export function WithMarkers() {
	return (
		<MapMinimap className="wwc:w-32 wwc:h-32">
			<MapMinimapMarker x={25} y={40} />
			<MapMinimapMarker x={60} y={20} />
			<MapMinimapMarker x={80} y={70} />
			<MapMinimapViewport x={20} y={30} width={40} height={30} />
		</MapMinimap>
	);
}
