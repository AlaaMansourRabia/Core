/**
 * Avoid mixing time formats in the same form.
 */
import {TimeInput} from "@corensystem/coren-ui/time-input";
import {Label} from "@corensystem/coren-ui/label";

export function FormatDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<div className="wwc:grid wwc:gap-1.5">
				<Label>Start Time (24h)</Label>
				<TimeInput format="24h" defaultValue="14:30" />
			</div>
			<div className="wwc:grid wwc:gap-1.5">
				<Label>End Time (12h)</Label>
				<TimeInput format="12h" defaultValue="03:30 PM" />
			</div>
		</div>
	);
}
