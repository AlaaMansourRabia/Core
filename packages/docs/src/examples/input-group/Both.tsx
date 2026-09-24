/**
 * Input group with both prefix and suffix.
 */
import {Input} from "@corensystem/coren-ui/input";
import {InputGroup, InputGroupText} from "@corensystem/coren-ui/input-group";

export function Both() {
	return (
		<InputGroup className="wwc:w-[280px]">
			<InputGroupText>$</InputGroupText>
			<Input type="number" placeholder="0.00" className="wwc:rounded-none wwc:border-x-0" />
			<InputGroupText>per month</InputGroupText>
		</InputGroup>
	);
}
