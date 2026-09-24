/**
 * Avoid generic link text like "click here".
 */
import {Link} from "@corensystem/coren-ui/link";

export function DescriptiveDont() {
	return (
		<p className="wwc:text-sm">
			For pricing, <Link href="#">click here</Link>.
		</p>
	);
}
