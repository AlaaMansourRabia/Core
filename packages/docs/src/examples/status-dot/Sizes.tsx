/**
 * Status dot sizes from xs to lg.
 */
import {StatusDot} from "@corensystem/coren-ui/status-dot";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<StatusDot size="xs" variant="success" />
			<StatusDot size="sm" variant="success" />
			<StatusDot size="md" variant="success" />
			<StatusDot size="lg" variant="success" />
		</div>
	);
}
