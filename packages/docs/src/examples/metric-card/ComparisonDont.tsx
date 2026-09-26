/**
 * Avoid trends without context.
 */
import {MetricCard} from "@corensystem/coren-ui/metric-card";

export function ComparisonDont() {
	return (
		<MetricCard
			title="Revenue"
			value="$45,231"
			trend="+12.7%"
			trendDirection="up"
		/>
	);
}
