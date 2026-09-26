/**
 * Avoid always showing compass on north-up maps.
 */
import {MapCompass} from "@corensystem/coren-ui/map-compass";

export function VisibilityDont() {
	return (
		<MapCompass rotation={0} className="wwc:w-10 wwc:h-10" />
	);
}
