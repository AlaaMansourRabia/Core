/**
 * Disabled checkbox states.
 */
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {Label} from "@corensystem/coren-ui/label";

export function Disabled() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-3">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Checkbox id="checkbox-disabled-unchecked" disabled />
				<Label htmlFor="checkbox-disabled-unchecked" className="wwc:text-muted-foreground">Disabled unchecked</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Checkbox id="checkbox-disabled-checked" disabled defaultChecked />
				<Label htmlFor="checkbox-disabled-checked" className="wwc:text-muted-foreground">Disabled checked</Label>
			</div>
		</div>
	);
}
