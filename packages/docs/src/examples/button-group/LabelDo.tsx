/**
 * Use consistent labeling style across group.
 */
import {ButtonGroup, ButtonGroupItem} from "@corensystem/coren-ui/button-group";

export function LabelDo() {
	return (
		<ButtonGroup>
			<ButtonGroupItem>Copy</ButtonGroupItem>
			<ButtonGroupItem>Cut</ButtonGroupItem>
			<ButtonGroupItem>Paste</ButtonGroupItem>
		</ButtonGroup>
	);
}
