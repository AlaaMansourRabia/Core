/**
 * Use different shapes for color-blind accessibility.
 */
import {StatusDot} from "@corensystem/coren-ui/status-dot";

export function ShapeDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<StatusDot variant="success" shape="filled" label="Active" />
			<StatusDot variant="warning" shape="ring" label="Pending" />
			<StatusDot variant="offline" shape="minus" label="Inactive" />
		</div>
	);
}
