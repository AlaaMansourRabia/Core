import {Badge} from "@corensystem/coren-ui/badge";
import {AlertTriangle, CheckCircle, Info} from "lucide-react";

/** DON'T: Avoid multiple icons or long text that makes the badge hard to scan. */
export function IconDont() {
	return (
		<Badge id="badge-icon-dont" variant="secondary">
			<CheckCircle className="wwc:size-3" />
			<AlertTriangle className="wwc:size-3" />
			<Info className="wwc:size-3" />
			Too many icons and very long text
		</Badge>
	);
}
