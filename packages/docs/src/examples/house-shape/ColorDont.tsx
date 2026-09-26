/**
 * Avoid decorative colors without meaning.
 */
import {HouseShape} from "@corensystem/coren-ui/house-shape";

export function ColorDont() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<HouseShape className="wwc:w-16 wwc:h-16 wwc:fill-pink-300" />
			<HouseShape className="wwc:w-16 wwc:h-16 wwc:fill-cyan-300" />
			<HouseShape className="wwc:w-16 wwc:h-16 wwc:fill-purple-300" />
		</div>
	);
}
