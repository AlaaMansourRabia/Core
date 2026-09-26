import {Label} from "@corensystem/coren-ui/label";
/**
 * Avoid accepting invalid times without feedback.
 */
import {TimeInput} from "@corensystem/coren-ui/time-input";

export function ValidationDont() {
	return (
		<div className="wwc:grid wwc:gap-1.5">
			<Label>Delivery Time</Label>
			<TimeInput defaultValue="03:00" />
			<span className="wwc:text-sm wwc:text-muted-foreground">No indication that 3 AM is outside delivery hours</span>
		</div>
	);
}
