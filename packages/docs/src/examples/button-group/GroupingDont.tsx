/**
 * Avoid grouping unrelated actions.
 */
import {ButtonGroup, ButtonGroupItem} from "@corensystem/coren-ui/button-group";
import {AlignLeft, Trash2, Save} from "lucide-react";

export function GroupingDont() {
	return (
		<ButtonGroup>
			<ButtonGroupItem><AlignLeft /></ButtonGroupItem>
			<ButtonGroupItem><Trash2 /></ButtonGroupItem>
			<ButtonGroupItem><Save /></ButtonGroupItem>
		</ButtonGroup>
	);
}
