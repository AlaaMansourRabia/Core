/**
 * Allow clearing the selection.
 */
import {DateRangeInput} from "@corensystem/coren-ui/date-range-input";

export function ClearDo() {
	return (
		<DateRangeInput
			clearable
			defaultValue={{
				from: new Date(2024, 0, 1),
				to: new Date(2024, 0, 31),
			}}
		/>
	);
}
