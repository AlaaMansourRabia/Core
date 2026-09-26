/**
 * Checkbox in checked state.
 */
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {Label} from "@corensystem/coren-ui/label";

export function Checked() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Checkbox id="checkbox-checked" defaultChecked />
			<Label htmlFor="checkbox-checked">Email notifications</Label>
		</div>
	);
}
