/**
 * Use for mutually exclusive view options.
 */
import {SegmentedControl} from "@corensystem/coren-ui/segmented-control";

export function UseCaseDo() {
	return (
		<SegmentedControl
			value="chart"
			options={[
				{value: "table", label: "Table"},
				{value: "chart", label: "Chart"},
			]}
		/>
	);
}
