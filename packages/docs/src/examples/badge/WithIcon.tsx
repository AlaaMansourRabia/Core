import {Badge} from "@corensystem/coren-ui/badge";
import {Check, CircleAlert, Clock} from "lucide-react";

/** Lead with a small icon to reinforce the status. Keep the label one or two words. */
export function WithIcon() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge id="badge-icon-verified" variant="default">
				<Check className="wwc:size-3" /> Verified
			</Badge>
			<Badge id="badge-icon-review" variant="secondary">
				<Clock className="wwc:size-3" /> In review
			</Badge>
			<Badge id="badge-icon-failed" variant="destructive">
				<CircleAlert className="wwc:size-3" /> Failed
			</Badge>
		</div>
	);
}
