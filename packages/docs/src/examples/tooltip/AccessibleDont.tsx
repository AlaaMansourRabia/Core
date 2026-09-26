/**
 * Avoid icon buttons without labels or tooltips.
 */
import {Button} from "@corensystem/coren-ui/button";
import {Trash2} from "lucide-react";

export function AccessibleDont() {
	return (
		<Button variant="ghost" size="icon">
			<Trash2 className="wwc:h-4 wwc:w-4" />
			{/* No tooltip or aria-label - inaccessible */}
		</Button>
	);
}
