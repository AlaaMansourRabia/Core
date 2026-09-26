/**
 * Use appropriate step intervals for the context.
 */
import {TimeInput} from "@corensystem/coren-ui/time-input";
import {Label} from "@corensystem/coren-ui/label";

export function StepDo() {
	return (
		<div className="wwc:grid wwc:gap-1.5">
			<Label>Appointment Time</Label>
			<TimeInput step={15} placeholder="Select time" />
			<span className="wwc:text-sm wwc:text-muted-foreground">15-minute intervals for appointments</span>
		</div>
	);
}
