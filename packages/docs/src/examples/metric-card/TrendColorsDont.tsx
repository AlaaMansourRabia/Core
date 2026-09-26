/**
 * Avoid using green for all upward trends.
 */
import {MetricCard} from "@corensystem/coren-ui/metric-card";

export function TrendColorsDont() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<MetricCard
				title="Revenue"
				value="$45K"
				trend="+12%"
				trendDirection="up"
				trendColor="success"
			/>
			<MetricCard
				title="Churn Rate"
				value="4.5%"
				trend="+1.2%"
				trendDirection="up"
				trendColor="success"
			/>
		</div>
	);
}
