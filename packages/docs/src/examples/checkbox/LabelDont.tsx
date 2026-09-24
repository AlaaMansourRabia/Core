/**
 * Avoid negative or confusing checkbox labels.
 */
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {Label} from "@corensystem/coren-ui/label";

export function LabelDont() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Checkbox id="checkbox-label-dont" />
			<Label htmlFor="checkbox-label-dont">Do not send me reports</Label>
		</div>
	);
}
