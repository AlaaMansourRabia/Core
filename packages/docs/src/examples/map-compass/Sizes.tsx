/**
 * Compass in different sizes.
 */
import {MapCompass} from "@corensystem/coren-ui/map-compass";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<MapCompass size="sm" />
			<MapCompass size="md" />
			<MapCompass size="lg" />
		</div>
	);
}
