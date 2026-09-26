/**
 * Avoid using color as the primary differentiator without semantic meaning.
 */
import {Badge} from "@corensystem/coren-ui/badge";

export function VariantDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:text-sm">Team A updates</span>
				<Badge variant="success">Team A</Badge>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:text-sm">Team B updates</span>
				<Badge variant="destructive">Team B</Badge>
			</div>
		</div>
	);
}
