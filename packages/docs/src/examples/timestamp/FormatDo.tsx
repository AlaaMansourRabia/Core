/**
 * Use relative format for recent times.
 */
import {Timestamp} from "@corensystem/coren-ui/timestamp";

export function FormatDo() {
	const recentDate = new Date(Date.now() - 1800000);
	return <Timestamp date={recentDate} format="relative" />;
}
