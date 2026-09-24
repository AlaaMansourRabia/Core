/**
 * Date range input with preset options.
 */
import {DateRangeInput} from "@corensystem/coren-ui/date-range-input";

export function WithPresets() {
	return (
		<DateRangeInput
			presets={[
				{label: "Today", value: "today"},
				{label: "Last 7 days", value: "last7days"},
				{label: "Last 30 days", value: "last30days"},
				{label: "This month", value: "thisMonth"},
				{label: "Last month", value: "lastMonth"},
			]}
		/>
	);
}
