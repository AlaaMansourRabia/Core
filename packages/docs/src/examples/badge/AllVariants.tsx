import {Badge} from "@corensystem/coren-ui/badge";

/** Shows all 12 badge variants including solid fills and soft tinted styles. */
export function AllVariants() {
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Badge id="badge-all-default" variant="default">
				Default
			</Badge>
			<Badge id="badge-all-secondary" variant="secondary">
				Secondary
			</Badge>
			<Badge id="badge-all-destructive" variant="destructive">
				Destructive
			</Badge>
			<Badge id="badge-all-outline" variant="outline">
				Outline
			</Badge>
			<Badge id="badge-all-success" variant="success">
				Success
			</Badge>
			<Badge id="badge-all-warning" variant="warning">
				Warning
			</Badge>
			<Badge id="badge-all-info" variant="info">
				Info
			</Badge>
			<Badge id="badge-all-success-soft" variant="successSoft">
				Success soft
			</Badge>
			<Badge id="badge-all-warning-soft" variant="warningSoft">
				Warning soft
			</Badge>
			<Badge id="badge-all-danger-soft" variant="dangerSoft">
				Danger soft
			</Badge>
			<Badge id="badge-all-info-soft" variant="infoSoft">
				Info soft
			</Badge>
			<Badge id="badge-all-neutral-soft" variant="neutralSoft">
				Neutral soft
			</Badge>
		</div>
	);
}
