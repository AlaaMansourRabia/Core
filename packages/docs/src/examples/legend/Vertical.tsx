/**
 * Vertical legend layout.
 */
import {Legend, LegendItem} from "@corensystem/coren-ui/legend";

export function Vertical() {
	return (
		<Legend direction="vertical">
			<LegendItem color="blue" label="Category A" value="45%" />
			<LegendItem color="green" label="Category B" value="30%" />
			<LegendItem color="orange" label="Category C" value="25%" />
		</Legend>
	);
}
