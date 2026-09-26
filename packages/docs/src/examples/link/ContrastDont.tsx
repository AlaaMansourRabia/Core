/**
 * Avoid muted links for important actions.
 */
import {Link} from "@corensystem/coren-ui/link";

export function ContrastDont() {
	return (
		<Link href="#" variant="muted">
			Sign up for free
		</Link>
	);
}
