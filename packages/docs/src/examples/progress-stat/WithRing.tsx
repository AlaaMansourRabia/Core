/**
 * Progress stat with circular ring.
 */
import {ProgressStat, ProgressStatRing, ProgressStatValue} from "@corensystem/coren-ui/progress-stat";

export function WithRing() {
	return (
		<ProgressStat>
			<ProgressStatRing value={65} />
			<ProgressStatValue>65%</ProgressStatValue>
		</ProgressStat>
	);
}
