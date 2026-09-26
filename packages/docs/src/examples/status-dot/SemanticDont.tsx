/**
 * Avoid misleading variant colors.
 */
import {StatusDot} from "@corensystem/coren-ui/status-dot";

export function SemanticDont() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<StatusDot variant="success" label="Error" />
			<span className="wwc:text-sm">Connection failed</span>
		</div>
	);
}
