/**
 * Grid of progress stats.
 */
import {ProgressStat, ProgressStatValue, ProgressStatLabel} from "@corensystem/coren-ui/progress-stat";

export function Grid() {
	return (
		<div className="wwc:grid wwc:grid-cols-3 wwc:gap-4">
			<ProgressStat><ProgressStatValue>92%</ProgressStatValue><ProgressStatLabel>Uptime</ProgressStatLabel></ProgressStat>
			<ProgressStat><ProgressStatValue>45%</ProgressStatValue><ProgressStatLabel>CPU</ProgressStatLabel></ProgressStat>
			<ProgressStat><ProgressStatValue>68%</ProgressStatValue><ProgressStatLabel>Memory</ProgressStatLabel></ProgressStat>
		</div>
	);
}
