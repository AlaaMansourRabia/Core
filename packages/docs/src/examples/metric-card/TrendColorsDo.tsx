/**
 * Use semantic colors for trends based on context.
 */
import {MetricCard} from "@corensystem/coren-ui/metric-card";

export function TrendColorsDo() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<MetricCard title="Revenue" value="$45K" trend="+12%" trendDirection="up" trendColor="success" />
			<MetricCard title="Churn Rate" value="2.3%" trend="-0.5%" trendDirection="down" trendColor="success" />
		</div>
	);
}
