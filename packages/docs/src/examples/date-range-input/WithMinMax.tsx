/**
 * Date range input with min/max constraints.
 */
import {DateRangeInput} from "@corensystem/coren-ui/date-range-input";

export function WithMinMax() {
	return (
		<DateRangeInput
			minDate={new Date(2024, 0, 1)}
			maxDate={new Date(2024, 11, 31)}
			placeholder="Select dates in 2024"
		/>
	);
}
