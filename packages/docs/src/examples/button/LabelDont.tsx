/**
 * Avoid vague labels that do not communicate the action.
 */
import {Button} from "@corensystem/coren-ui/button";

export function LabelDont() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Button variant="destructive">Yes</Button>
			<Button variant="outline">No</Button>
		</div>
	);
}
