/**
 * Avoid ambiguous formats.
 */
import {TimestampPicker} from "@corensystem/coren-ui/timestamp-picker";

export function FormatDont() {
	return <TimestampPicker format="MM/DD/YY" />;
}
