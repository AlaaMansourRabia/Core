import {Badge} from "@corensystem/coren-ui/badge";

/** Soft variants have a light tinted background with colored stroke and text. Lower-emphasis indicator tags that sit calmly inside dense lists. They are theme-aware (readable in light and dark). */
export function Soft() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge id="badge-soft-verified" variant="successSoft">
				Verified
			</Badge>
			<Badge id="badge-soft-medium" variant="warningSoft">
				Medium
			</Badge>
			<Badge id="badge-soft-high" variant="dangerSoft">
				High
			</Badge>
			<Badge id="badge-soft-low" variant="infoSoft">
				Low
			</Badge>
			<Badge id="badge-soft-draft" variant="neutralSoft">
				Draft
			</Badge>
		</div>
	);
}
