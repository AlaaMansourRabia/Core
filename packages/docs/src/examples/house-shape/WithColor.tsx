/**
 * Colored house shapes for status.
 */
import {HouseShape} from "@corensystem/coren-ui/house-shape";

export function WithColor() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<HouseShape color="default" className="wwc:w-24 wwc:h-24" />
			<HouseShape color="success" className="wwc:w-24 wwc:h-24" />
			<HouseShape color="warning" className="wwc:w-24 wwc:h-24" />
		</div>
	);
}
