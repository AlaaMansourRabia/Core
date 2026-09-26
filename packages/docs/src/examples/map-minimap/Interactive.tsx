/**
 * Interactive minimap for navigation.
 */
import {MapMinimap, MapMinimapViewport} from "@corensystem/coren-ui/map-minimap";

export function Interactive() {
	return (
		<MapMinimap interactive className="wwc:w-32 wwc:h-32">
			<MapMinimapViewport x={10} y={10} width={30} height={25} draggable />
		</MapMinimap>
	);
}
