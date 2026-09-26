/**
 * Avoid unclear limits that frustrate users.
 */
import {Textarea} from "@corensystem/coren-ui/textarea";
import {Label} from "@corensystem/coren-ui/label";

export function LengthDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-md">
			<Label htmlFor="textarea-len-dont">Summary</Label>
			<Textarea id="textarea-len-dont" placeholder="Keep it short" />
		</div>
	);
}
