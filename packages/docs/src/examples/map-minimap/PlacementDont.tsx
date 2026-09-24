/**
 * Avoid obscuring main map content.
 */
import {MapMinimap, MapMinimapViewport} from "@corensystem/coren-ui/map-minimap";

export function PlacementDont() {
	return (
		<div className="wwc:relative wwc:w-64 wwc:h-48 wwc:bg-muted wwc:rounded wwc:flex wwc:items-center wwc:justify-center">
			<MapMinimap className="wwc:w-32 wwc:h-32">
				<MapMinimapViewport x={30} y={30} width={30} height={30} />
			</MapMinimap>
		</div>
	);
}
