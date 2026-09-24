/**
 * Time scrubber with time labels.
 */
import {TimeScrubber} from "@corensystem/coren-ui/time-scrubber";

export function WithLabels() {
	return <TimeScrubber min={0} max={3600} value={1800} showLabels formatLabel={(v) => `${Math.floor(v/60)}min`} />;
}
