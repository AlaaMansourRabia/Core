/**
 * Turn timer in warning state.
 */
import {TurnTimer} from "@corensystem/coren-ui/turn-timer";

export function Warning() {
	return <TurnTimer seconds={10} running warningThreshold={15} />;
}
