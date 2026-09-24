/**
 * Include labels and units for clarity.
 */
import {NumberInput} from "@corensystem/coren-ui/number-input";

export function LabelDo() {
	return (
		<div className="wwc:space-y-1">
			<label className="wwc:text-sm wwc:font-medium">Price (USD)</label>
			<NumberInput value={99} min={0} precision={2} className="wwc:w-[150px]" />
		</div>
	);
}
