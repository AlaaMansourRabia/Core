/**
 * Avoid manual margin spacing between elements.
 */
import {Button} from "@corensystem/coren-ui/button";

export function DirectionDont() {
	return (
		<div className="wwc:flex">
			<Button variant="outline" className="wwc:mr-2">
				Cancel
			</Button>
			<Button>Save</Button>
		</div>
	);
}
