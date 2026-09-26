/**
 * Avoid too many options in a segmented control.
 */
import {SegmentedControl} from "@corensystem/coren-ui/segmented-control";

export function CountDont() {
	return (
		<SegmentedControl
			value="a"
			options={[
				{value: "a", label: "A"},
				{value: "b", label: "B"},
				{value: "c", label: "C"},
				{value: "d", label: "D"},
				{value: "e", label: "E"},
				{value: "f", label: "F"},
			]}
		/>
	);
}
