/**
 * Avoid inconsistent house sizes.
 */
import {HouseShape} from "@corensystem/coren-ui/house-shape";

export function ScaleDont() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<HouseShape className="wwc:w-12 wwc:h-12" />
			<HouseShape className="wwc:w-32 wwc:h-32" />
			<HouseShape className="wwc:w-20 wwc:h-20" />
		</div>
	);
}
