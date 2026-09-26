/**
 * Use distinguishable colors.
 */
import {Legend, LegendItem} from "@corensystem/coren-ui/legend";

export function ColorDo() {
	return (
		<Legend>
			<LegendItem color="blue" label="Primary" />
			<LegendItem color="orange" label="Secondary" />
			<LegendItem color="green" label="Tertiary" />
		</Legend>
	);
}
