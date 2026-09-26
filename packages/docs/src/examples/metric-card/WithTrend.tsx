/**
 * Metric card with trend indicator.
 */
import {MetricCard} from "@corensystem/coren-ui/metric-card";

export function WithTrend() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<MetricCard
				title="Users"
				value="2,350"
				trend="+12.5%"
				trendDirection="up"
			/>
			<MetricCard
				title="Bounce Rate"
				value="42.3%"
				trend="-5.2%"
				trendDirection="down"
			/>
		</div>
	);
}
