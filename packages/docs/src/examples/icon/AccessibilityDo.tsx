/**
 * Include labels for icon-only buttons.
 */
import {Icon} from "@corensystem/coren-ui/icon";
import {Button} from "@corensystem/coren-ui/button";
import {Settings} from "lucide-react";

export function AccessibilityDo() {
	return (
		<Button variant="ghost" size="icon" aria-label="Open settings">
			<Icon icon={Settings} />
		</Button>
	);
}
