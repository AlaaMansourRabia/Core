/**
 * Avoid values without context.
 */
import {ProgressStat, ProgressStatValue} from "@corensystem/coren-ui/progress-stat";

export function ContextDont() {
	return (
		<ProgressStat>
			<ProgressStatValue>85%</ProgressStatValue>
		</ProgressStat>
	);
}
