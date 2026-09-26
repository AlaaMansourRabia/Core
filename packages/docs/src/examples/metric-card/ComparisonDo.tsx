/**
 * Provide clear comparison periods.
 */
import {MetricCard} from "@corensystem/coren-ui/metric-card";

export function ComparisonDo() {
	return (
		<MetricCard
			title="Monthly Revenue"
			value="$45,231"
			description="Compared to $40,123 last month"
			trend="+12.7%"
			trendDirection="up"
		/>
	);
}
