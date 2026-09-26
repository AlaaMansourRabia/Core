/**
 * Time input with 12-hour format.
 */
import {TimeInput} from "@corensystem/coren-ui/time-input";

export function TwelveHour() {
	return <TimeInput format="12h" defaultValue="02:30 PM" />;
}
