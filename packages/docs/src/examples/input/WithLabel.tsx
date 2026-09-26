/**
 * Input with an accessible label binding.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function WithLabel() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-sm">
			<Label htmlFor="input-email">Email</Label>
			<Input id="input-email" type="email" placeholder="name@example.com" />
		</div>
	);
}
