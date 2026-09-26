/**
 * Input group with text addon.
 */
import {Input} from "@corensystem/coren-ui/input";
import {InputGroup, InputGroupText} from "@corensystem/coren-ui/input-group";

export function Default() {
	return (
		<InputGroup className="wwc:w-[250px]">
			<InputGroupText>https://</InputGroupText>
			<Input placeholder="example.com" className="wwc:rounded-l-none" />
		</InputGroup>
	);
}
