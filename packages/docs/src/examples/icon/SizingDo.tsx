/**
 * Match icon size to context.
 */
import {Icon} from "@corensystem/coren-ui/icon";
import {Button} from "@corensystem/coren-ui/button";
import {Trash2} from "lucide-react";

export function SizingDo() {
	return (
		<Button size="sm" variant="destructive">
			<Icon icon={Trash2} size="sm" className="wwc:mr-1" />
			Delete
		</Button>
	);
}
