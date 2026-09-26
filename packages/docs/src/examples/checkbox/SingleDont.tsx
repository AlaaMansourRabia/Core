/**
 * Avoid using checkbox for mutually exclusive options (use RadioGroup).
 */
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {Label} from "@corensystem/coren-ui/label";

export function SingleDont() {
	return (
		<div className="wwc:space-y-2">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Checkbox id="checkbox-single-dont-1" defaultChecked />
				<Label htmlFor="checkbox-single-dont-1">Pay monthly</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Checkbox id="checkbox-single-dont-2" />
				<Label htmlFor="checkbox-single-dont-2">Pay annually</Label>
			</div>
		</div>
	);
}
