/**
 * Links come in three variants: default, subtle, and muted.
 */
import {Link} from "@corensystem/coren-ui/link";

export function Variants() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2">
			<Link href="#" variant="default">Default link</Link>
			<Link href="#" variant="subtle">Subtle link</Link>
			<Link href="#" variant="muted">Muted link</Link>
		</div>
	);
}
