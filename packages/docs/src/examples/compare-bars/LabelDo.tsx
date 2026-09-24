/**
 * Include clear labels and values.
 */
import {CompareBars, CompareBar} from "@corensystem/coren-ui/compare-bars";

export function LabelDo() {
	return (
		<CompareBars showValues>
			<CompareBar label="Sales" value={85} suffix="%" />
			<CompareBar label="Target" value={80} suffix="%" />
		</CompareBars>
	);
}
