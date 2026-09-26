/**
 * Set appropriate min/max for the context.
 */
import {NumberInput} from "@corensystem/coren-ui/number-input";

export function ConstraintsDo() {
	return (
		<div className="wwc:space-y-1">
			<label className="wwc:text-sm">Quantity (1-99)</label>
			<NumberInput value={1} min={1} max={99} className="wwc:w-[120px]" />
		</div>
	);
}
