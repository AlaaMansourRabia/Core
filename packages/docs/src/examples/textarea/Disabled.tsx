/**
 * Disabled textarea state.
 */
import {Textarea} from "@corensystem/coren-ui/textarea";

export function Disabled() {
	return <Textarea disabled placeholder="Cannot edit" value="Read only content" />;
}
