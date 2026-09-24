/**
 * Timestamp picker with initial value.
 */
import {TimestampPicker} from "@corensystem/coren-ui/timestamp-picker";

export function WithValue() {
	return <TimestampPicker value={new Date()} />;
}
