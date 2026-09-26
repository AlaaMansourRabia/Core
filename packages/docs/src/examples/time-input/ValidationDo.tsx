/**
 * Validate time ranges appropriately.
 */
import {TimeInput} from "@corensystem/coren-ui/time-input";
import {Label} from "@corensystem/coren-ui/label";

export function ValidationDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<div className="wwc:grid wwc:gap-1.5">
				<Label>Business Hours Start</Label>
				<TimeInput min="08:00" max="18:00" defaultValue="09:00" />
			</div>
			<span className="wwc:text-sm wwc:text-muted-foreground">Restricted to business hours (8 AM - 6 PM)</span>
		</div>
	);
}
