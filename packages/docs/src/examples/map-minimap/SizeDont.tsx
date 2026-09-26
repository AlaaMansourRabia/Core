/**
 * Avoid too small minimaps.
 */
import {MapMinimap, MapMinimapViewport} from "@corensystem/coren-ui/map-minimap";

export function SizeDont() {
	return (
		<MapMinimap className="wwc:w-12 wwc:h-12">
			<MapMinimapViewport x={20} y={25} width={35} height={30} />
		</MapMinimap>
	);
}
