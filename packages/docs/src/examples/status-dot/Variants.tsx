/**
 * Status dot variants for different states.
 */
import {StatusDot} from "@corensystem/coren-ui/status-dot";

export function Variants() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<StatusDot variant="success" label="Online" />
			<StatusDot variant="warning" label="Away" />
			<StatusDot variant="error" label="Busy" />
			<StatusDot variant="info" label="Info" />
			<StatusDot variant="neutral" label="Neutral" />
			<StatusDot variant="offline" label="Offline" />
		</div>
	);
}
