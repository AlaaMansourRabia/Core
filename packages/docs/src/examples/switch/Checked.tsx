/**
 * Switch in checked (on) state.
 */
import {Switch} from "@corensystem/coren-ui/switch";
import {Label} from "@corensystem/coren-ui/label";

export function Checked() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Switch id="switch-checked" defaultChecked />
			<Label htmlFor="switch-checked">Dark mode</Label>
		</div>
	);
}
