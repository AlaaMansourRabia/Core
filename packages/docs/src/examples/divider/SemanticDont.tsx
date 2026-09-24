/**
 * Avoid using decorative dividers for semantic grouping.
 */
import {Divider} from "@corensystem/coren-ui/divider";

export function SemanticDont() {
	return (
		<nav className="wwc:w-[150px]">
			<a href="#" className="wwc:block wwc:py-1 wwc:text-sm">Home</a>
			<Divider className="wwc:my-1" />
			<a href="#" className="wwc:block wwc:py-1 wwc:text-sm">About</a>
		</nav>
	);
}
