/**
 * Avoid auto-scaling that distorts comparison.
 */
import {CompareBars, CompareBar} from "@corensystem/coren-ui/compare-bars";

export function ScaleDont() {
	return (
		<CompareBars>
			<CompareBar label="Team A" value={75} max={75} />
			<CompareBar label="Team B" value={60} max={60} />
		</CompareBars>
	);
}
