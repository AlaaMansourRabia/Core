/**
 * Place compass in consistent corner.
 */
import {MapCompass} from "@corensystem/coren-ui/map-compass";

export function PlacementDo() {
	return (
		<div className="wwc:relative wwc:w-48 wwc:h-32 wwc:bg-muted wwc:rounded">
			<MapCompass className="wwc:absolute wwc:top-2 wwc:right-2 wwc:w-8 wwc:h-8" />
		</div>
	);
}
