/**
 * Use consistent time format based on locale.
 */
import {TimeInput} from "@corensystem/coren-ui/time-input";

export function FormatDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2">
			<TimeInput format="24h" defaultValue="14:30" />
			<span className="wwc:text-sm wwc:text-muted-foreground">24-hour format for international use</span>
		</div>
	);
}
