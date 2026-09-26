/**
 * Use consistent date formatting.
 */
import {DateRangeInput} from "@corensystem/coren-ui/date-range-input";

export function FormatDo() {
	return (
		<DateRangeInput
			format="MMM d, yyyy"
			placeholder="Jan 1, 2024 - Jan 31, 2024"
		/>
	);
}
