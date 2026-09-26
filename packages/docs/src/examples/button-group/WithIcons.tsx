/**
 * Button group with icons.
 */
import {ButtonGroup, ButtonGroupItem} from "@corensystem/coren-ui/button-group";
import {AlignLeft, AlignCenter, AlignRight} from "lucide-react";

export function WithIcons() {
	return (
		<ButtonGroup>
			<ButtonGroupItem>
				<AlignLeft />
			</ButtonGroupItem>
			<ButtonGroupItem>
				<AlignCenter />
			</ButtonGroupItem>
			<ButtonGroupItem>
				<AlignRight />
			</ButtonGroupItem>
		</ButtonGroup>
	);
}
