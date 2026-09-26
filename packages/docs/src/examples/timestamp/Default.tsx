/**
 * A relative timestamp showing time elapsed.
 */
import {Timestamp} from "@corensystem/coren-ui/timestamp";

export function Default() {
	const oneHourAgo = new Date(Date.now() - 3600000);
	return <Timestamp date={oneHourAgo} />;
}
