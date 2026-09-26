/**
 * Avoid low contrast compass.
 */
import {MapCompass} from "@corensystem/coren-ui/map-compass";

export function ContrastDont() {
	return (
		<div className="wwc:relative wwc:w-32 wwc:h-32 wwc:bg-slate-200 wwc:rounded">
			<MapCompass className="wwc:absolute wwc:top-2 wwc:right-2 wwc:w-8 wwc:h-8 wwc:opacity-30" />
		</div>
	);
}
