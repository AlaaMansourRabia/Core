/**
 * Progress stat with trend indicator.
 */
import {ProgressStat, ProgressStatValue, ProgressStatTrend} from "@corensystem/coren-ui/progress-stat";

export function WithTrend() {
	return (
		<ProgressStat>
			<ProgressStatValue>82%</ProgressStatValue>
			<ProgressStatTrend direction="up" value="+5%">vs last week</ProgressStatTrend>
		</ProgressStat>
	);
}
