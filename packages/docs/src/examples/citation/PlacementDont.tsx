/**
 * Avoid citations separated from quoted content.
 */
import {Citation} from "@corensystem/coren-ui/citation";

export function PlacementDont() {
	return (
		<div>
			<p className="wwc:italic">"Innovation distinguishes leaders."</p>
			<p className="wwc:text-sm wwc:my-4">This is some other text.</p>
			<Citation author="Steve Jobs" />
		</div>
	);
}
