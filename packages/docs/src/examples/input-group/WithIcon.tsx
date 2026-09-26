/**
 * Input group with icon addon.
 */
import {Input} from "@corensystem/coren-ui/input";
import {InputGroup, InputGroupText} from "@corensystem/coren-ui/input-group";
import {Mail} from "lucide-react";

export function WithIcon() {
	return (
		<InputGroup className="wwc:w-[250px]">
			<InputGroupText>
				<Mail className="wwc:h-4 wwc:w-4" />
			</InputGroupText>
			<Input type="email" placeholder="email@example.com" className="wwc:rounded-l-none" />
		</InputGroup>
	);
}
