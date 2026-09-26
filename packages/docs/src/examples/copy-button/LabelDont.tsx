/**
 * Avoid copying sensitive data without context.
 */
import {CopyButton} from "@corensystem/coren-ui/copy-button";

export function LabelDont() {
	return <CopyButton value="password123" />;
}
