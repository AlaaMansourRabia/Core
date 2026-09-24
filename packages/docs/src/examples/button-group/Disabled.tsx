/**
 * Button group with disabled item.
 */
import {ButtonGroup, ButtonGroupItem} from "@corensystem/coren-ui/button-group";

export function Disabled() {
	return (
		<ButtonGroup>
			<ButtonGroupItem>Active</ButtonGroupItem>
			<ButtonGroupItem disabled>Disabled</ButtonGroupItem>
			<ButtonGroupItem>Active</ButtonGroupItem>
		</ButtonGroup>
	);
}
