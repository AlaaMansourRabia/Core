/**
 * Add target and rel attributes for external links.
 */
import {Link} from "@corensystem/coren-ui/link";

export function ExternalDo() {
	return (
		<Link href="https://example.com" target="_blank" rel="noopener noreferrer">
			External site
		</Link>
	);
}
