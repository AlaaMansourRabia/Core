/**
 * Always use labels for form fields.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function LabelsDo() {
	return (
		<div className="wwc:w-full wwc:max-w-sm wwc:space-y-4">
			<div className="wwc:space-y-2">
				<Label htmlFor="form-labels-do-name">Name</Label>
				<Input id="form-labels-do-name" placeholder="John Doe" />
			</div>
			<div className="wwc:space-y-2">
				<Label htmlFor="form-labels-do-email">Email</Label>
				<Input id="form-labels-do-email" type="email" placeholder="john@example.com" />
			</div>
		</div>
	);
}
