import {Label} from "@corensystem/coren-ui/label";
/**
 * Time input with form label.
 */
import {TimeInput} from "@corensystem/coren-ui/time-input";

export function WithLabel() {
	return (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:gap-1.5">
			<Label htmlFor="time-meeting">Meeting Time</Label>
			<TimeInput id="time-meeting" defaultValue="14:00" />
		</div>
	);
}
