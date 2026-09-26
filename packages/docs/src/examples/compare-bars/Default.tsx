/**
 * Default compare bars for data comparison.
 */
import {CompareBars, CompareBar} from "@corensystem/coren-ui/compare-bars";

export function Default() {
	return (
		<CompareBars>
			<CompareBar label="2024" value={85} />
			<CompareBar label="2023" value={72} />
		</CompareBars>
	);
}
