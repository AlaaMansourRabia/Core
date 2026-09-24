/**
 * Avoid isolated timestamps without context.
 */
import {Timestamp} from "@corensystem/coren-ui/timestamp";

export function ContextDont() {
	return <Timestamp date={new Date(Date.now() - 86400000)} />;
}
