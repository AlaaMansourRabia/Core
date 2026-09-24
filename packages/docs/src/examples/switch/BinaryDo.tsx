/**
 * Use switch for binary on/off states.
 */
import {Switch} from "@corensystem/coren-ui/switch";
import {Label} from "@corensystem/coren-ui/label";

export function BinaryDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Switch id="switch-binary-do" />
			<Label htmlFor="switch-binary-do">Show online status</Label>
		</div>
	);
}
