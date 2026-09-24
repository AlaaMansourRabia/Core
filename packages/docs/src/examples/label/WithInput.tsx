import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

/** Label bound to an input using htmlFor/id. This is the standard accessible pattern. */
export function WithInput() {
	return (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:items-center wwc:gap-1.5">
			<Label htmlFor="label-with-input-email">Email</Label>
			<Input type="email" id="label-with-input-email" placeholder="Email" />
		</div>
	);
}
