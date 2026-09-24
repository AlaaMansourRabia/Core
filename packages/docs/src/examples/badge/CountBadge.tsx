import {Badge} from "@corensystem/coren-ui/badge";

/** Numeric badges for counts. Cap large values (e.g. 99+) to keep width stable. */
export function CountBadge() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
			<Badge id="badge-count-3" variant="secondary">
				3
			</Badge>
			<Badge id="badge-count-12" variant="secondary">
				12
			</Badge>
			<Badge id="badge-count-max" variant="destructive">
				99+
			</Badge>
		</div>
	);
}
