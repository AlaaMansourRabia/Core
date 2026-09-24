/**
 * Default progress stat display.
 */
import {ProgressStat, ProgressStatValue, ProgressStatLabel} from "@corensystem/coren-ui/progress-stat";

export function Default() {
	return (
		<ProgressStat>
			<ProgressStatValue>75%</ProgressStatValue>
			<ProgressStatLabel>Complete</ProgressStatLabel>
		</ProgressStat>
	);
}
