/**
 * Avoid ungrouped checkboxes without context.
 */
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {Label} from "@corensystem/coren-ui/label";

export function GroupDont() {
	return (
		<div className="wwc:space-y-3">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Checkbox id="checkbox-nogr-1" />
				<Label htmlFor="checkbox-nogr-1">Option A</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Checkbox id="checkbox-nogr-2" />
				<Label htmlFor="checkbox-nogr-2">Option B</Label>
			</div>
		</div>
	);
}
