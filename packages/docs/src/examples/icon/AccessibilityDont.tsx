/**
 * Avoid icon-only buttons without labels.
 */
import {Icon} from "@corensystem/coren-ui/icon";
import {Button} from "@corensystem/coren-ui/button";
import {Settings} from "lucide-react";

export function AccessibilityDont() {
	return (
		<Button variant="ghost" size="icon">
			{/* No aria-label - unclear purpose */}
			<Icon icon={Settings} />
		</Button>
	);
}
