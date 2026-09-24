/**
 * Place in corner of map view.
 */
import {MapMinimap, MapMinimapViewport} from "@corensystem/coren-ui/map-minimap";

export function PlacementDo() {
	return (
		<div className="wwc:relative wwc:w-64 wwc:h-48 wwc:bg-muted wwc:rounded">
			<MapMinimap className="wwc:absolute wwc:bottom-2 wwc:right-2 wwc:w-20 wwc:h-20">
				<MapMinimapViewport x={30} y={30} width={30} height={30} />
			</MapMinimap>
		</div>
	);
}
