/**
 * Use the time element with proper dateTime attribute.
 */
import {Timestamp} from "@corensystem/coren-ui/timestamp";

export function SemanticDo() {
	return <Timestamp date={new Date()} />;
}
