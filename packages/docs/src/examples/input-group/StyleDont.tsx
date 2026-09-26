/**
 * Avoid gaps between addon and input.
 */
import {Input} from "@corensystem/coren-ui/input";
import {InputGroup, InputGroupText} from "@corensystem/coren-ui/input-group";

export function StyleDont() {
	return (
		<InputGroup className="wwc:w-[200px] wwc:gap-2">
			<InputGroupText>$</InputGroupText>
			<Input type="number" placeholder="0" />
		</InputGroup>
	);
}
