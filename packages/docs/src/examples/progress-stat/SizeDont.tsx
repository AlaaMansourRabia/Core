/**
 * Avoid inconsistent stat sizes.
 */
import {ProgressStat, ProgressStatValue} from "@corensystem/coren-ui/progress-stat";

export function SizeDont() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<ProgressStat size="sm"><ProgressStatValue>50%</ProgressStatValue></ProgressStat>
			<ProgressStat size="lg"><ProgressStatValue>75%</ProgressStatValue></ProgressStat>
			<ProgressStat size="md"><ProgressStatValue>90%</ProgressStatValue></ProgressStat>
		</div>
	);
}
