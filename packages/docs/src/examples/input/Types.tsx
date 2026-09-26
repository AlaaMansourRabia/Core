/**
 * Different input types for various data formats.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function Types() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:max-w-sm">
			<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
				<Label htmlFor="input-text">Text</Label>
				<Input id="input-text" type="text" placeholder="Plain text" />
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
				<Label htmlFor="input-password">Password</Label>
				<Input id="input-password" type="password" placeholder="••••••••" />
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
				<Label htmlFor="input-number">Number</Label>
				<Input id="input-number" type="number" placeholder="0" />
			</div>
		</div>
	);
}
