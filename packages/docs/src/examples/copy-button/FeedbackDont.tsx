/**
 * Avoid very short reset durations that users might miss.
 */
import {CopyButton} from "@corensystem/coren-ui/copy-button";

export function FeedbackDont() {
	return <CopyButton value="https://example.com/share/abc" resetMs={200} />;
}
