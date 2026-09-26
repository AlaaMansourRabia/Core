/**
 * Default map minimap for navigation overview.
 */
import {MapMinimap, MapMinimapViewport} from "@corensystem/coren-ui/map-minimap";

export function Default() {
	return (
		<MapMinimap className="wwc:w-32 wwc:h-32">
			<MapMinimapViewport x={20} y={30} width={40} height={30} />
		</MapMinimap>
	);
}
