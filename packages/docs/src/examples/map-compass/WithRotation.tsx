/**
 * Rotated compass showing map bearing.
 */
import {MapCompass} from "@corensystem/coren-ui/map-compass";

export function WithRotation() {
	return (
		<MapCompass rotation={45} className="wwc:w-12 wwc:h-12" />
	);
}
