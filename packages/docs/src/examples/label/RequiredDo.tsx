import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

/** DO: Use the required prop on Label and required attribute on Input for accessible required fields. */
export function RequiredDo() {
	return (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:items-center wwc:gap-1.5">
			<Label htmlFor="label-required-do" required>
				Full name
			</Label>
			<Input id="label-required-do" placeholder="John Doe" required />
		</div>
	);
}
