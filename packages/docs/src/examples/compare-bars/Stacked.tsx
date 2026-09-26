/**
 * Stacked compare bars for breakdown.
 */
import {CompareBars, CompareBar, CompareBarSegment} from "@corensystem/coren-ui/compare-bars";

export function Stacked() {
	return (
		<CompareBars stacked>
			<CompareBar label="Q1">
				<CompareBarSegment value={40} color="blue" />
				<CompareBarSegment value={30} color="green" />
				<CompareBarSegment value={30} color="orange" />
			</CompareBar>
			<CompareBar label="Q2">
				<CompareBarSegment value={50} color="blue" />
				<CompareBarSegment value={25} color="green" />
				<CompareBarSegment value={25} color="orange" />
			</CompareBar>
		</CompareBars>
	);
}
