/**
 * Score gauge with label.
 */
import {ScoreGauge, ScoreGaugeLabel} from "@corensystem/coren-ui/score-gauge";

export function WithLabel() {
	return (
		<ScoreGauge value={85} max={100}>
			<ScoreGaugeLabel>Health Score</ScoreGaugeLabel>
		</ScoreGauge>
	);
}
