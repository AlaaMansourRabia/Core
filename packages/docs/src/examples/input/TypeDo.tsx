/**
 * Use appropriate input types for better mobile keyboards and validation.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function TypeDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-sm">
			<Label htmlFor="input-type-do">Phone number</Label>
			<Input id="input-type-do" type="tel" placeholder="+1 (555) 000-0000" />
		</div>
	);
}
