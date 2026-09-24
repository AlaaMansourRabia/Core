/**
 * Score gauge sizes.
 */
import {ScoreGauge} from "@corensystem/coren-ui/score-gauge";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<ScoreGauge value={60} size="sm" />
			<ScoreGauge value={60} size="md" />
			<ScoreGauge value={60} size="lg" />
		</div>
	);
}
