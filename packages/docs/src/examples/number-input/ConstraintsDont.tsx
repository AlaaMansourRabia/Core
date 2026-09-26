/**
 * Avoid missing constraints that allow invalid values.
 */
import {NumberInput} from "@corensystem/coren-ui/number-input";

export function ConstraintsDont() {
	return (
		<div className="wwc:space-y-1">
			<label className="wwc:text-sm">Quantity</label>
			<NumberInput value={-5} className="wwc:w-[120px]" />
		</div>
	);
}
