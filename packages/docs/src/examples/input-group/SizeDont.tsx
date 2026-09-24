/**
 * Avoid overly long addon text.
 */
import {Input} from "@corensystem/coren-ui/input";
import {InputGroup, InputGroupText} from "@corensystem/coren-ui/input-group";

export function SizeDont() {
	return (
		<InputGroup className="wwc:w-[350px]">
			<Input type="number" placeholder="0" className="wwc:rounded-r-none" />
			<InputGroupText>kilograms per square meter</InputGroupText>
		</InputGroup>
	);
}
