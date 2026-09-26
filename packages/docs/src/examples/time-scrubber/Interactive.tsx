/**
 * Interactive time scrubber.
 */
import {TimeScrubber} from "@corensystem/coren-ui/time-scrubber";

export function Interactive() {
	return <TimeScrubber min={0} max={100} value={25} interactive />;
}
