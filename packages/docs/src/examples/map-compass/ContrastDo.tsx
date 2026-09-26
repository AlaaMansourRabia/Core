/**
 * Ensure compass visibility on map.
 */
import {MapCompass} from "@corensystem/coren-ui/map-compass";

export function ContrastDo() {
	return (
		<div className="wwc:relative wwc:w-32 wwc:h-32 wwc:bg-slate-700 wwc:rounded">
			<MapCompass variant="light" className="wwc:absolute wwc:top-2 wwc:right-2 wwc:w-8 wwc:h-8" />
		</div>
	);
}
