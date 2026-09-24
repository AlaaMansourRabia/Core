/**
 * Use consistent house sizes in layouts.
 */
import {HouseShape} from "@corensystem/coren-ui/house-shape";

export function ScaleDo() {
	return (
		<div className="wwc:grid wwc:grid-cols-3 wwc:gap-2">
			<HouseShape className="wwc:w-20 wwc:h-20" />
			<HouseShape className="wwc:w-20 wwc:h-20" />
			<HouseShape className="wwc:w-20 wwc:h-20" />
		</div>
	);
}
