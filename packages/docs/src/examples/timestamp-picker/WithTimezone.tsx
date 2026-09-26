/**
 * Timestamp picker with timezone.
 */
import {TimestampPicker} from "@corensystem/coren-ui/timestamp-picker";

export function WithTimezone() {
	return <TimestampPicker showTimezone timezone="UTC" />;
}
