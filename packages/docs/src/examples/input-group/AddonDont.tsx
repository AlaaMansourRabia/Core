/**
 * Avoid redundant addons that don't add value.
 */
import {Input} from "@corensystem/coren-ui/input";
import {InputGroup, InputGroupText} from "@corensystem/coren-ui/input-group";

export function AddonDont() {
	return (
		<InputGroup className="wwc:w-[200px]">
			<InputGroupText>Name:</InputGroupText>
			<Input placeholder="Enter name" className="wwc:rounded-l-none" />
		</InputGroup>
	);
}
