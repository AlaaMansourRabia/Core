/**
 * Copy button with custom reset duration.
 */
import {CopyButton} from "@corensystem/coren-ui/copy-button";

export function CustomReset() {
	return <CopyButton value="secret-key" resetMs={3000} />;
}
