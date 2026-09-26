/**
 * Avoid mixing label styles within a group.
 */
import {ButtonGroup, ButtonGroupItem} from "@corensystem/coren-ui/button-group";
import {Copy} from "lucide-react";

export function LabelDont() {
	return (
		<ButtonGroup>
			<ButtonGroupItem>
				<Copy />
			</ButtonGroupItem>
			<ButtonGroupItem>Cut text</ButtonGroupItem>
			<ButtonGroupItem>P</ButtonGroupItem>
		</ButtonGroup>
	);
}
