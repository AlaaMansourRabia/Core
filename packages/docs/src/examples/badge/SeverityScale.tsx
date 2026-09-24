import {Badge} from "@corensystem/coren-ui/badge";

/** A worked example: mapping a High / Medium / Low severity scale to soft variants so each level reads as its own colored indicator rather than a generic dark fill. */
export function SeverityScale() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge id="badge-severity-high" variant="dangerSoft">
				High
			</Badge>
			<Badge id="badge-severity-medium" variant="warningSoft">
				Medium
			</Badge>
			<Badge id="badge-severity-low" variant="infoSoft">
				Low
			</Badge>
		</div>
	);
}
