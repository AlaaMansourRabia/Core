import {Badge} from "@corensystem/coren-ui/badge";
import {Check} from "lucide-react";

/** DO: Use a small icon that reinforces the badge meaning. Keep labels short. */
export function IconDo() {
	return (
		<Badge id="badge-icon-do" variant="success">
			<Check className="wwc:size-3" />
			Verified
		</Badge>
	);
}
