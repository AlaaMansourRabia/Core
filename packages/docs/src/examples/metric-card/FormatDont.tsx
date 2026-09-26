/**
 * Avoid showing raw unformatted numbers.
 */
import {MetricCard} from "@corensystem/coren-ui/metric-card";

export function FormatDont() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<MetricCard title="Revenue" value="$1234567.89" />
			<MetricCard title="Users" value="45321" />
		</div>
	);
}
