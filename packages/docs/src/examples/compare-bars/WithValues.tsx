/**
 * Compare bars with value labels.
 */
import {CompareBars, CompareBar} from "@corensystem/coren-ui/compare-bars";

export function WithValues() {
	return (
		<CompareBars showValues>
			<CompareBar label="Revenue" value={120000} format="currency" />
			<CompareBar label="Costs" value={85000} format="currency" />
		</CompareBars>
	);
}
