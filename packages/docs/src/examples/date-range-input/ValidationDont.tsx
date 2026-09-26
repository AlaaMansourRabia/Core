/**
 * Avoid allowing invalid ranges.
 */
import {DateRangeInput} from "@corensystem/coren-ui/date-range-input";

export function ValidationDont() {
	return (
		<DateRangeInput
			defaultValue={{
				from: new Date(2024, 0, 31),
				to: new Date(2024, 0, 1),
			}}
		/>
	);
}
