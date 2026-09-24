/**
 * Avoid no way to clear selection.
 */
import {DateRangeInput} from "@corensystem/coren-ui/date-range-input";

export function ClearDont() {
	return (
		<DateRangeInput
			clearable={false}
			defaultValue={{
				from: new Date(2024, 0, 1),
				to: new Date(2024, 0, 31),
			}}
		/>
	);
}
