/**
 * Keep options to 2-4 for usability.
 */
import {SegmentedControl} from "@corensystem/coren-ui/segmented-control";

export function CountDo() {
	return (
		<SegmentedControl
			value="grid"
			options={[
				{value: "list", label: "List"},
				{value: "grid", label: "Grid"},
			]}
		/>
	);
}
