/**
 * Avoid obscuring map content.
 */
import {MapCompass} from "@corensystem/coren-ui/map-compass";

export function PlacementDont() {
	return (
		<div className="wwc:relative wwc:w-48 wwc:h-32 wwc:bg-muted wwc:rounded">
			<MapCompass className="wwc:absolute wwc:top-1/2 wwc:left-1/2 wwc:-translate-x-1/2 wwc:-translate-y-1/2 wwc:w-16 wwc:h-16" />
		</div>
	);
}
