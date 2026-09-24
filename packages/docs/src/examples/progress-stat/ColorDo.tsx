/**
 * Use color to indicate status.
 */
import {ProgressStat, ProgressStatValue, ProgressStatLabel} from "@corensystem/coren-ui/progress-stat";

export function ColorDo() {
	return (
		<ProgressStat color="success">
			<ProgressStatValue>98%</ProgressStatValue>
			<ProgressStatLabel>Healthy</ProgressStatLabel>
		</ProgressStat>
	);
}
