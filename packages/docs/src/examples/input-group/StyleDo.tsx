/**
 * Ensure input and addon borders connect properly.
 */
import {Input} from "@corensystem/coren-ui/input";
import {InputGroup, InputGroupText} from "@corensystem/coren-ui/input-group";

export function StyleDo() {
	return (
		<InputGroup className="wwc:w-[200px]">
			<InputGroupText>$</InputGroupText>
			<Input type="number" placeholder="0" className="wwc:rounded-l-none" />
		</InputGroup>
	);
}
