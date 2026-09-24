import {Badge} from "@corensystem/coren-ui/badge";

/** Filled semantic colors for definite states: success (green), warning (amber), info (blue), plus destructive (red). Use a solid fill when the badge is the primary signal in its row. */
export function SemanticColors() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge id="badge-semantic-success" variant="success">
				Success
			</Badge>
			<Badge id="badge-semantic-warning" variant="warning">
				Warning
			</Badge>
			<Badge id="badge-semantic-info" variant="info">
				Info
			</Badge>
			<Badge id="badge-semantic-danger" variant="destructive">
				Danger
			</Badge>
		</div>
	);
}
