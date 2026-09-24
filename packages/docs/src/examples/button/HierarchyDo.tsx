/**
 * Use one primary action per view to guide users clearly.
 */
import {Button} from "@corensystem/coren-ui/button";

export function HierarchyDo() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Button>Submit</Button>
			<Button variant="outline">Cancel</Button>
		</div>
	);
}
