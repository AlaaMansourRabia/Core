/**
 * Input group with suffix text.
 */
import {Input} from "@corensystem/coren-ui/input";
import {InputGroup, InputGroupText} from "@corensystem/coren-ui/input-group";

export function Suffix() {
	return (
		<InputGroup className="wwc:w-[200px]">
			<Input type="number" placeholder="0" className="wwc:rounded-r-none" />
			<InputGroupText>USD</InputGroupText>
		</InputGroup>
	);
}
