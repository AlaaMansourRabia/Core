/**
 * Avoid verbose or unclear labels.
 */
import {Legend, LegendItem} from "@corensystem/coren-ui/legend";

export function LabelDont() {
	return (
		<Legend>
			<LegendItem color="blue" label="First Quarter of Fiscal Year 2024 (Jan-Mar)" />
			<LegendItem color="green" label="Second Quarter of Fiscal Year 2024 (Apr-Jun)" />
		</Legend>
	);
}
