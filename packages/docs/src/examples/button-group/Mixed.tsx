/**
 * Button group with icons and text.
 */
import {ButtonGroup, ButtonGroupItem} from "@corensystem/coren-ui/button-group";
import {Bold, Italic, Underline} from "lucide-react";

export function Mixed() {
	return (
		<ButtonGroup>
			<ButtonGroupItem><Bold /> Bold</ButtonGroupItem>
			<ButtonGroupItem><Italic /> Italic</ButtonGroupItem>
			<ButtonGroupItem><Underline /> Underline</ButtonGroupItem>
		</ButtonGroup>
	);
}
