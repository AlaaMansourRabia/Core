/**
 * Disabled radio group.
 */
import {RadioGroup, RadioGroupItem} from "@corensystem/coren-ui/radio-group";
import {Label} from "@corensystem/coren-ui/label";

export function Disabled() {
	return (
		<RadioGroup defaultValue="opt-1" disabled>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<RadioGroupItem value="opt-1" id="radio-d-1" />
				<Label htmlFor="radio-d-1" className="wwc:text-muted-foreground">Selected (disabled)</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<RadioGroupItem value="opt-2" id="radio-d-2" />
				<Label htmlFor="radio-d-2" className="wwc:text-muted-foreground">Unselected (disabled)</Label>
			</div>
		</RadioGroup>
	);
}
