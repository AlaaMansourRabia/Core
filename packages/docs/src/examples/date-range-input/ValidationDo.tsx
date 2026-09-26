/**
 * Validate that end date is after start date.
 */
import {DateRangeInput} from "@corensystem/coren-ui/date-range-input";

export function ValidationDo() {
	return (
		<DateRangeInput
			validateRange
			onInvalidRange={() => console.log("End date must be after start date")}
		/>
	);
}
