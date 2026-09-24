/**
 * Choose variants by semantic meaning, not by color preference.
 */
import {Badge} from "@corensystem/coren-ui/badge";

export function VariantDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:text-sm">Payment received</span>
				<Badge variant="success">Paid</Badge>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:text-sm">Payment failed</span>
				<Badge variant="destructive">Failed</Badge>
			</div>
		</div>
	);
}
