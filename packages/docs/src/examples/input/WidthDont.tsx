/**
 * Avoid full-width inputs for short values like ZIP codes.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function WidthDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
			<Label htmlFor="input-width-dont">ZIP Code</Label>
			<Input id="input-width-dont" placeholder="12345" />
		</div>
	);
}
