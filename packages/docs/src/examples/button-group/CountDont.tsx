/**
 * Avoid too many buttons in a group.
 */
import {ButtonGroup, ButtonGroupItem} from "@corensystem/coren-ui/button-group";

export function CountDont() {
	return (
		<ButtonGroup>
			<ButtonGroupItem>1</ButtonGroupItem>
			<ButtonGroupItem>2</ButtonGroupItem>
			<ButtonGroupItem>3</ButtonGroupItem>
			<ButtonGroupItem>4</ButtonGroupItem>
			<ButtonGroupItem>5</ButtonGroupItem>
			<ButtonGroupItem>6</ButtonGroupItem>
			<ButtonGroupItem>7</ButtonGroupItem>
		</ButtonGroup>
	);
}
