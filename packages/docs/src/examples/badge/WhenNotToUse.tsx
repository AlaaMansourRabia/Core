import {Badge} from "@corensystem/coren-ui/badge";

/** Avoid using a Badge as a button or a removable filter pill. A Badge is static and not focusable/clickable. If the user can toggle or dismiss it, reach for Chip instead. */
export function WhenNotToUse() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:text-sm">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Badge id="badge-when-static" variant="secondary">
					Static label
				</Badge>
				<span className="wwc:text-muted-foreground">status / category / count</span>
			</div>
			<p id="badge-when-warning" className="wwc:text-destructive">
				Do not wire onClick/remove onto a Badge. Use Chip for interactive pills.
			</p>
		</div>
	);
}
