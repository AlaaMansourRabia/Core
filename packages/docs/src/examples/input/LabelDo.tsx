/**
 * Always pair inputs with visible labels for accessibility.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function LabelDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-sm">
			<Label htmlFor="input-do-name">Full name</Label>
			<Input id="input-do-name" placeholder="Jane Doe" />
		</div>
	);
}
