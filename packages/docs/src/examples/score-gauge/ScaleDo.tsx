/**
 * Use consistent scale.
 */
import {ScoreGauge} from "@corensystem/coren-ui/score-gauge";

export function ScaleDo() {
	return <ScoreGauge value={75} max={100} showValue />;
}
