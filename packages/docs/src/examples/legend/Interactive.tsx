/**
 * Interactive legend with toggle.
 */
import {Legend, LegendItem} from "@corensystem/coren-ui/legend";

export function Interactive() {
	return (
		<Legend interactive>
			<LegendItem color="blue" label="Active Users" active />
			<LegendItem color="green" label="New Users" active />
			<LegendItem color="gray" label="Inactive" active={false} />
		</Legend>
	);
}
