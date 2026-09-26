/**
 * House shape with property label.
 */
import {HouseShape, HouseShapeLabel} from "@corensystem/coren-ui/house-shape";

export function WithLabel() {
	return (
		<HouseShape className="wwc:w-32 wwc:h-32">
			<HouseShapeLabel>Unit 4A</HouseShapeLabel>
		</HouseShape>
	);
}
