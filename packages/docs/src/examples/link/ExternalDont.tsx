/**
 * Avoid external links without security attributes.
 */
import {Link} from "@corensystem/coren-ui/link";

export function ExternalDont() {
	return <Link href="https://example.com" target="_blank">External site</Link>;
}
