/**
 * Segmented control sizes: sm, md, lg.
 */
import {SegmentedControl} from "@corensystem/coren-ui/segmented-control";

export function Sizes() {
	const options = [
		{value: "a", label: "A"},
		{value: "b", label: "B"},
		{value: "c", label: "C"},
	];
	return (
		<div className="wwc:space-y-4">
			<SegmentedControl size="sm" value="a" options={options} />
			<SegmentedControl size="md" value="a" options={options} />
			<SegmentedControl size="lg" value="a" options={options} />
		</div>
	);
}
