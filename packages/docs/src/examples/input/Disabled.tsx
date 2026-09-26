/**
 * Disabled input state.
 */
import {Input} from "@corensystem/coren-ui/input";

export function Disabled() {
	return <Input disabled placeholder="Cannot edit" value="Read only value" />;
}
