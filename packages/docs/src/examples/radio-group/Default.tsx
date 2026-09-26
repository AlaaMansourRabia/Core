import {Label} from "@corensystem/coren-ui/label";
/**
 * Default radio group with options.
 */
import {RadioGroup, RadioGroupItem} from "@corensystem/coren-ui/radio-group";

export function Default() {
	return (
		<RadioGroup defaultValue="option-1">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<RadioGroupItem value="option-1" id="radio-1" />
				<Label htmlFor="radio-1">Option 1</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<RadioGroupItem value="option-2" id="radio-2" />
				<Label htmlFor="radio-2">Option 2</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<RadioGroupItem value="option-3" id="radio-3" />
				<Label htmlFor="radio-3">Option 3</Label>
			</div>
		</RadioGroup>
	);
}
