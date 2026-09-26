/**
 * Use clear, actionable labels that describe the option.
 */
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {Label} from "@corensystem/coren-ui/label";

export function LabelDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Checkbox id="checkbox-label-do" />
			<Label htmlFor="checkbox-label-do">Send me weekly progress reports</Label>
		</div>
	);
}
