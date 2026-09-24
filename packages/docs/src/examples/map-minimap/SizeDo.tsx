/**
 * Use appropriate minimap size.
 */
import {MapMinimap, MapMinimapViewport} from "@corensystem/coren-ui/map-minimap";

export function SizeDo() {
	return (
		<MapMinimap className="wwc:w-28 wwc:h-28">
			<MapMinimapViewport x={20} y={25} width={35} height={30} />
		</MapMinimap>
	);
}
