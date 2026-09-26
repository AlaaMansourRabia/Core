/**
 * Legend with data values.
 */
import {Legend, LegendItem} from "@corensystem/coren-ui/legend";

export function WithValues() {
	return (
		<Legend>
			<LegendItem color="blue" label="Desktop" value="12,450" />
			<LegendItem color="green" label="Mobile" value="8,320" />
			<LegendItem color="purple" label="Tablet" value="2,100" />
		</Legend>
	);
}
