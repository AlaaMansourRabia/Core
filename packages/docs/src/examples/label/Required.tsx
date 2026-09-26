import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

/** Use the required prop to show an asterisk. Also mark the input required for accessibility. */
export function Required() {
	return (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:items-center wwc:gap-1.5">
			<Label htmlFor="label-required-name" required>
				Name
			</Label>
			<Input id="label-required-name" placeholder="Enter your name" required />
		</div>
	);
}
