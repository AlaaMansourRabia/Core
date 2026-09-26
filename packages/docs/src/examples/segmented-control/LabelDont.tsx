/**
 * Avoid labels with very different lengths.
 */
import {SegmentedControl} from "@corensystem/coren-ui/segmented-control";

export function LabelDont() {
	return (
		<SegmentedControl
			value="d"
			options={[
				{value: "d", label: "D"},
				{value: "week", label: "This Week"},
				{value: "month", label: "Entire Month View"},
			]}
		/>
	);
}
