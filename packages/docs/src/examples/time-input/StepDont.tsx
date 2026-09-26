/**
 * Avoid overly precise steps when not needed.
 */
import {TimeInput} from "@corensystem/coren-ui/time-input";
import {Label} from "@corensystem/coren-ui/label";

export function StepDont() {
	return (
		<div className="wwc:grid wwc:gap-1.5">
			<Label>Meeting Start</Label>
			<TimeInput step={1} placeholder="Select time" />
			<span className="wwc:text-sm wwc:text-muted-foreground">1-second precision unnecessary for meetings</span>
		</div>
	);
}
