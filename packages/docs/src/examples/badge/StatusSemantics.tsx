import {Badge} from "@corensystem/coren-ui/badge";

/** Map the variant to a meaning consistently: default = active/positive, secondary = neutral/info, destructive = error/blocked, outline = draft/low-emphasis. Pick by meaning, not by color. */
export function StatusSemantics() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge id="badge-status-active" variant="default">
				Active
			</Badge>
			<Badge id="badge-status-pending" variant="secondary">
				Pending
			</Badge>
			<Badge id="badge-status-blocked" variant="destructive">
				Blocked
			</Badge>
			<Badge id="badge-status-draft" variant="outline">
				Draft
			</Badge>
		</div>
	);
}
