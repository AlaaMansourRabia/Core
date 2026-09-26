/**
 * A group of related buttons.
 */
import {ButtonGroup, ButtonGroupItem} from "@corensystem/coren-ui/button-group";

export function Default() {
	return (
		<ButtonGroup>
			<ButtonGroupItem>Left</ButtonGroupItem>
			<ButtonGroupItem>Center</ButtonGroupItem>
			<ButtonGroupItem>Right</ButtonGroupItem>
		</ButtonGroup>
	);
}
