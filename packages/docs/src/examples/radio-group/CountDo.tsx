import {Label} from "@corensystem/coren-ui/label";
/**
 * Use radio buttons for 2-5 visible options.
 */
import {RadioGroup, RadioGroupItem} from "@corensystem/coren-ui/radio-group";

export function CountDo() {
	return (
		<fieldset className="wwc:space-y-3">
			<legend className="wwc:text-sm wwc:font-medium">Priority</legend>
			<RadioGroup defaultValue="medium">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="low" id="radio-cnt-low" />
					<Label htmlFor="radio-cnt-low">Low</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="medium" id="radio-cnt-medium" />
					<Label htmlFor="radio-cnt-medium">Medium</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="high" id="radio-cnt-high" />
					<Label htmlFor="radio-cnt-high">High</Label>
				</div>
			</RadioGroup>
		</fieldset>
	);
}
