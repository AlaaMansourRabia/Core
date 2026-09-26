/**
 * Use short, equal-length labels.
 */
import {SegmentedControl} from "@corensystem/coren-ui/segmented-control";

export function LabelDo() {
	return (
		<SegmentedControl
			value="day"
			options={[
				{value: "day", label: "Day"},
				{value: "week", label: "Week"},
				{value: "month", label: "Month"},
			]}
		/>
	);
}
