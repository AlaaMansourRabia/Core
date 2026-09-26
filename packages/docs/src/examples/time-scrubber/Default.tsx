/**
 * Default time scrubber for timeline navigation.
 */
import {TimeScrubber} from "@corensystem/coren-ui/time-scrubber";

export function Default() {
	return <TimeScrubber min={0} max={100} value={50} />;
}
