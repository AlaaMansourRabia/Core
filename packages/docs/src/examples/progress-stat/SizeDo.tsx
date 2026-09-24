/**
 * Use appropriate stat sizes.
 */
import {ProgressStat, ProgressStatValue, ProgressStatLabel} from "@corensystem/coren-ui/progress-stat";

export function SizeDo() {
	return (
		<ProgressStat size="lg">
			<ProgressStatValue>95%</ProgressStatValue>
			<ProgressStatLabel>Health Score</ProgressStatLabel>
		</ProgressStat>
	);
}
