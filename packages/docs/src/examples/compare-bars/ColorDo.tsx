/**
 * Use color to highlight differences.
 */
import {CompareBars, CompareBar} from "@corensystem/coren-ui/compare-bars";

export function ColorDo() {
	return (
		<CompareBars showValues>
			<CompareBar label="Actual" value={92} color="success" />
			<CompareBar label="Target" value={85} color="muted" />
		</CompareBars>
	);
}
