/**
 * Metric card with descriptive subtitle.
 */
import {MetricCard} from "@corensystem/coren-ui/metric-card";

export function WithDescription() {
	return (
		<MetricCard
			title="Active Subscriptions"
			value="573"
			description="+201 since last month"
			trend="+20.1%"
			trendDirection="up"
		/>
	);
}
