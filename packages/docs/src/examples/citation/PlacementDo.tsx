/**
 * Place citations directly after quoted content.
 */
import {Citation} from "@corensystem/coren-ui/citation";

export function PlacementDo() {
	return (
		<div className="wwc:space-y-2">
			<p className="wwc:italic">"Innovation distinguishes leaders."</p>
			<Citation author="Steve Jobs" />
		</div>
	);
}
