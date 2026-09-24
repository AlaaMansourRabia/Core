/**
 * Default checkbox with label.
 */
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {Label} from "@corensystem/coren-ui/label";

export function Default() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Checkbox id="checkbox-default" />
			<Label htmlFor="checkbox-default">Accept terms and conditions</Label>
		</div>
	);
}
