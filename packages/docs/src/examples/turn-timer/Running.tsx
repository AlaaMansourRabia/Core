/**
 * Running turn timer.
 */
import {TurnTimer} from "@corensystem/coren-ui/turn-timer";

export function Running() {
	return <TurnTimer seconds={30} running />;
}
