/**
 * Use semantic variants that match the status meaning.
 */
import {StatusDot} from "@corensystem/coren-ui/status-dot";

export function SemanticDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<StatusDot variant="error" label="Error" />
			<span className="wwc:text-sm">Connection failed</span>
		</div>
	);
}
