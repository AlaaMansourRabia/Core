/**
 * Use addons to provide context about input format.
 */
import {Input} from "@corensystem/coren-ui/input";
import {InputGroup, InputGroupText} from "@corensystem/coren-ui/input-group";

export function AddonDo() {
	return (
		<InputGroup className="wwc:w-[200px]">
			<InputGroupText>@</InputGroupText>
			<Input placeholder="username" className="wwc:rounded-l-none" />
		</InputGroup>
	);
}
