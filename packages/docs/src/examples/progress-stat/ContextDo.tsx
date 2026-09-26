/**
 * Include context labels.
 */
import {ProgressStat, ProgressStatValue, ProgressStatLabel} from "@corensystem/coren-ui/progress-stat";

export function ContextDo() {
	return (
		<ProgressStat>
			<ProgressStatValue>85%</ProgressStatValue>
			<ProgressStatLabel>Task Completion</ProgressStatLabel>
		</ProgressStat>
	);
}
