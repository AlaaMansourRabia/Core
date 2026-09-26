/**
 * Show compass when map is rotated.
 */
import {MapCompass} from "@corensystem/coren-ui/map-compass";

export function VisibilityDo() {
	return <MapCompass rotation={45} showWhenRotated className="wwc:w-10 wwc:h-10" />;
}
