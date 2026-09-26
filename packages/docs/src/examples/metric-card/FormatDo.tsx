/**
 * Format numbers appropriately for readability.
 */
import {MetricCard} from "@corensystem/coren-ui/metric-card";

export function FormatDo() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<MetricCard
				title="Revenue"
				value="$1.2M"
			/>
			<MetricCard
				title="Users"
				value="45.3K"
			/>
		</div>
	);
}
