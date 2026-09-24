/**
 * Avoid random colors.
 */
import {ProgressStat, ProgressStatValue} from "@corensystem/coren-ui/progress-stat";

export function ColorDont() {
	return (
		<ProgressStat className="wwc:text-pink-500">
			<ProgressStatValue>98%</ProgressStatValue>
		</ProgressStat>
	);
}
