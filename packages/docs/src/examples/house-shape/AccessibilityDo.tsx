/**
 * Include accessible labels.
 */
import {HouseShape} from "@corensystem/coren-ui/house-shape";

export function AccessibilityDo() {
	return (
		<HouseShape
			className="wwc:w-24 wwc:h-24"
			aria-label="Property Unit 12, 3 bedrooms, Available"
		/>
	);
}
