/**
 * Expired turn timer.
 */
import {TurnTimer} from "@corensystem/coren-ui/turn-timer";

export function Expired() {
	return <TurnTimer seconds={0} expired />;
}
