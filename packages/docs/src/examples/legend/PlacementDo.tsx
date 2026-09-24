/**
 * Place legend near the chart.
 */
import {Legend, LegendItem} from "@corensystem/coren-ui/legend";

export function PlacementDo() {
	return (
		<div className="wwc:space-y-2">
			<div className="wwc:h-32 wwc:bg-muted wwc:rounded">[Chart]</div>
			<Legend>
				<LegendItem color="blue" label="Sales" />
				<LegendItem color="green" label="Revenue" />
			</Legend>
		</div>
	);
}
