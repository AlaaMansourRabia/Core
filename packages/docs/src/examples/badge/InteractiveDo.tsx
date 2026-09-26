import {Badge} from "@corensystem/coren-ui/badge";

/** DO: Use Badge for static display labels that describe status or category. */
export function InteractiveDo() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<Badge id="badge-interactive-do-1" variant="success">
				Active
			</Badge>
			<Badge id="badge-interactive-do-2" variant="secondary">
				12 items
			</Badge>
		</div>
	);
}
