/**
 * Avoid absolute format for very recent times.
 */
import {Timestamp} from "@corensystem/coren-ui/timestamp";

export function FormatDont() {
	const recentDate = new Date(Date.now() - 1800000);
	return <Timestamp date={recentDate} format="datetime" />;
}
