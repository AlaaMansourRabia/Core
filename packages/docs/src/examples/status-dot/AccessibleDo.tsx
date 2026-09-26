/**
 * Always provide an accessible label.
 */
import {StatusDot} from "@corensystem/coren-ui/status-dot";

export function AccessibleDo() {
	return <StatusDot variant="success" label="User is online" />;
}
