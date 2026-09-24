/**
 * Date range input with preset value.
 */
import {DateRangeInput} from "@corensystem/coren-ui/date-range-input";

export function WithValue() {
	return (
		<DateRangeInput
			defaultValue={{
				from: new Date(2024, 0, 1),
				to: new Date(2024, 0, 31),
			}}
		/>
	);
}
