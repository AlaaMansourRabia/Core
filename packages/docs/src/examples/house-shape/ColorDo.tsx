/**
 * Use color to indicate property status.
 */
import {HouseShape} from "@corensystem/coren-ui/house-shape";

export function ColorDo() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<HouseShape color="success" className="wwc:w-16 wwc:h-16" title="Available" />
			<HouseShape color="warning" className="wwc:w-16 wwc:h-16" title="Pending" />
			<HouseShape color="destructive" className="wwc:w-16 wwc:h-16" title="Sold" />
		</div>
	);
}
