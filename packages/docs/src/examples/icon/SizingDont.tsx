/**
 * Avoid mismatched icon sizes.
 */
import {Icon} from "@corensystem/coren-ui/icon";
import {Button} from "@corensystem/coren-ui/button";
import {Trash2} from "lucide-react";

export function SizingDont() {
	return (
		<Button size="sm" variant="destructive">
			<Icon icon={Trash2} size="xl" className="wwc:mr-1" />
			Delete
		</Button>
	);
}
