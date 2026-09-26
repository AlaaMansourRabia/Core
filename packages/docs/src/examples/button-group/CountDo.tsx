/**
 * Keep button groups to 2-5 items.
 */
import {ButtonGroup, ButtonGroupItem} from "@corensystem/coren-ui/button-group";

export function CountDo() {
	return (
		<ButtonGroup>
			<ButtonGroupItem>Day</ButtonGroupItem>
			<ButtonGroupItem>Week</ButtonGroupItem>
			<ButtonGroupItem>Month</ButtonGroupItem>
		</ButtonGroup>
	);
}
