/**
 * Default legend for chart data.
 */
import {Legend, LegendItem} from "@corensystem/coren-ui/legend";

export function Default() {
	return (
		<Legend>
			<LegendItem color="blue" label="Sales" />
			<LegendItem color="green" label="Revenue" />
			<LegendItem color="orange" label="Expenses" />
		</Legend>
	);
}
