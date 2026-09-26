import {Label} from "@corensystem/coren-ui/label";
/**
 * Pre-select a sensible default option.
 */
import {RadioGroup, RadioGroupItem} from "@corensystem/coren-ui/radio-group";

export function DefaultDo() {
	return (
		<fieldset className="wwc:space-y-3">
			<legend className="wwc:text-sm wwc:font-medium">Notification frequency</legend>
			<RadioGroup defaultValue="daily">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="realtime" id="radio-def-rt" />
					<Label htmlFor="radio-def-rt">Real-time</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="daily" id="radio-def-daily" />
					<Label htmlFor="radio-def-daily">Daily digest</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="weekly" id="radio-def-weekly" />
					<Label htmlFor="radio-def-weekly">Weekly summary</Label>
				</div>
			</RadioGroup>
		</fieldset>
	);
}
