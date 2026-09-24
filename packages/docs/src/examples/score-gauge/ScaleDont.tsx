/**
 * Avoid unclear scales.
 */
import {ScoreGauge} from "@corensystem/coren-ui/score-gauge";

export function ScaleDont() {
	return <ScoreGauge value={3.7} max={5} />;
}
