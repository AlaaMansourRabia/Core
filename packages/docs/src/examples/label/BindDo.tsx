import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

/** DO: Bind the label to its control using htmlFor and id. This ensures clicking the label focuses the input. */
export function BindDo() {
	return (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:items-center wwc:gap-1.5">
			<Label htmlFor="label-bind-do-email">Email address</Label>
			<Input id="label-bind-do-email" type="email" placeholder="you@example.com" />
		</div>
	);
}
