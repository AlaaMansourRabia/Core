/**
 * Links work naturally within paragraph text.
 */
import {Link} from "@corensystem/coren-ui/link";

export function InParagraph() {
	return (
		<p className="wwc:text-sm">
			Read our <Link href="#">documentation</Link> to learn more about the API.
		</p>
	);
}
