/**
 * External links should open in a new tab with security attributes.
 */
import {Link} from "@corensystem/coren-ui/link";

export function External() {
	return (
		<Link href="https://example.com" target="_blank" rel="noopener noreferrer">
			Visit website
		</Link>
	);
}
