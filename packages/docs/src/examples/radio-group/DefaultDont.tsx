import {Label} from "@corensystem/coren-ui/label";
/**
 * Avoid required selection without a default when one makes sense.
 */
import {RadioGroup, RadioGroupItem} from "@corensystem/coren-ui/radio-group";

export function DefaultDont() {
	return (
		<fieldset className="wwc:space-y-3">
			<legend className="wwc:text-sm wwc:font-medium">
				Notification frequency <span className="wwc:text-destructive">*</span>
			</legend>
			<RadioGroup>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="realtime" id="radio-nodef-rt" />
					<Label htmlFor="radio-nodef-rt">Real-time</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="daily" id="radio-nodef-daily" />
					<Label htmlFor="radio-nodef-daily">Daily digest</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="weekly" id="radio-nodef-weekly" />
					<Label htmlFor="radio-nodef-weekly">Weekly summary</Label>
				</div>
			</RadioGroup>
		</fieldset>
	);
}
