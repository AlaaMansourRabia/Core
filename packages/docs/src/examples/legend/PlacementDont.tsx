/**
 * Avoid legend far from chart.
 */
import {Legend, LegendItem} from "@corensystem/coren-ui/legend";

export function PlacementDont() {
	return (
		<div className="wwc:space-y-8">
			<Legend>
				<LegendItem color="blue" label="Sales" />
				<LegendItem color="green" label="Revenue" />
			</Legend>
			<div className="wwc:h-32 wwc:bg-muted wwc:rounded">[Chart far below]</div>
		</div>
	);
}
