/**
 * Use checkbox for opt-in/opt-out choices.
 */
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {Label} from "@corensystem/coren-ui/label";

export function SingleDo() {
	return (
		<div className="wwc:flex wwc:items-start wwc:gap-2">
			<Checkbox id="checkbox-single-do" className="wwc:mt-0.5" />
			<Label htmlFor="checkbox-single-do">I agree to the Terms of Service and Privacy Policy</Label>
		</div>
	);
}
