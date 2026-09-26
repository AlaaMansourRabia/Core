/**
 * Avoid no position feedback.
 */
import {TimeScrubber} from "@corensystem/coren-ui/time-scrubber";

export function FeedbackDont() {
	return <TimeScrubber value={45} />;
}
