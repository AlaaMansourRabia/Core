/**
 * Indeterminate state for partial selection.
 */
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {Label} from "@corensystem/coren-ui/label";

export function Indeterminate() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-3">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Checkbox id="checkbox-parent" checked="indeterminate" />
				<Label htmlFor="checkbox-parent" className="wwc:font-medium">
					Select all
				</Label>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:ps-6">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<Checkbox id="checkbox-child-1" defaultChecked />
					<Label htmlFor="checkbox-child-1">Option 1</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<Checkbox id="checkbox-child-2" />
					<Label htmlFor="checkbox-child-2">Option 2</Label>
				</div>
			</div>
		</div>
	);
}
