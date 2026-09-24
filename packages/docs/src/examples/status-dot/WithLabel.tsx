/**
 * Status dot with visible label text.
 */
import {StatusDot} from "@corensystem/coren-ui/status-dot";

export function WithLabel() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<StatusDot variant="success" label="Online" />
			<span className="wwc:text-sm">Online</span>
		</div>
	);
}
