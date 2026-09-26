/**
 * Use consistent scale for comparison.
 */
import {CompareBars, CompareBar} from "@corensystem/coren-ui/compare-bars";

export function ScaleDo() {
	return (
		<CompareBars max={100}>
			<CompareBar label="Team A" value={75} />
			<CompareBar label="Team B" value={60} />
		</CompareBars>
	);
}
