import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid placing actions inline with form fields.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function ActionsDont() {
	return (
		<div className="wwc:space-y-4">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Label htmlFor="form-actions-dont-email">Email</Label>
				<Input id="form-actions-dont-email" type="email" />
				<Button>Subscribe</Button>
			</div>
		</div>
	);
}
