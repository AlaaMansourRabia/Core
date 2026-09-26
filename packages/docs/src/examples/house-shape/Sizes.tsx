/**
 * House shapes in different sizes.
 */
import {HouseShape} from "@corensystem/coren-ui/house-shape";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-end wwc:gap-4">
			<HouseShape size="sm" />
			<HouseShape size="md" />
			<HouseShape size="lg" />
		</div>
	);
}
