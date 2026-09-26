/**
 * Avoid relying on color alone to convey status.
 */
import {StatusDot} from "@corensystem/coren-ui/status-dot";

export function ShapeDont() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<StatusDot variant="success" label="Active" />
			<StatusDot variant="warning" label="Pending" />
			<StatusDot variant="error" label="Failed" />
		</div>
	);
}
