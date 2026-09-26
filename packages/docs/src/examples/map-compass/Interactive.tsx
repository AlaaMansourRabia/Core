/**
 * Interactive compass with reset action.
 */
import {MapCompass} from "@corensystem/coren-ui/map-compass";

export function Interactive() {
	return <MapCompass interactive rotation={30} className="wwc:w-12 wwc:h-12" />;
}
