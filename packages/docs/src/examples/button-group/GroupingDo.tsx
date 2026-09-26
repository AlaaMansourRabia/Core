/**
 * Group related actions together.
 */
import {ButtonGroup, ButtonGroupItem} from "@corensystem/coren-ui/button-group";
import {AlignLeft, AlignCenter, AlignRight} from "lucide-react";

export function GroupingDo() {
	return (
		<ButtonGroup>
			<ButtonGroupItem><AlignLeft /></ButtonGroupItem>
			<ButtonGroupItem><AlignCenter /></ButtonGroupItem>
			<ButtonGroupItem><AlignRight /></ButtonGroupItem>
		</ButtonGroup>
	);
}
