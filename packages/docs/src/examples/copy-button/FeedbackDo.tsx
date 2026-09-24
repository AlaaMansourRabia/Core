/**
 * Use appropriate reset duration for the context.
 */
import {CopyButton} from "@corensystem/coren-ui/copy-button";

export function FeedbackDo() {
	return <CopyButton value="https://example.com/share/abc" resetMs={2000} />;
}
