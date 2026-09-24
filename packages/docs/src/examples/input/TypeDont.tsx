/**
 * Avoid using text type for specialized data like phone or email.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function TypeDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-sm">
			<Label htmlFor="input-type-dont">Phone number</Label>
			<Input id="input-type-dont" type="text" placeholder="Enter phone" />
		</div>
	);
}
