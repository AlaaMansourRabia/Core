/**
 * Score gauge with color thresholds.
 */
import {ScoreGauge} from "@corensystem/coren-ui/score-gauge";

export function WithThresholds() {
	return (
		<ScoreGauge
			value={45}
			max={100}
			thresholds={[
				{max: 30, color: "destructive"},
				{max: 70, color: "warning"},
				{max: 100, color: "success"},
			]}
		/>
	);
}
