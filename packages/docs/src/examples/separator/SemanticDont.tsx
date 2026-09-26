/**
 * Avoid using decorative separators for semantic grouping.
 */
import {Separator} from "@corensystem/coren-ui/separator";

export function SemanticDont() {
	return (
		<nav className="wwc:w-[200px]">
			<a href="#" className="wwc:block wwc:py-2 wwc:text-sm">Dashboard</a>
			<Separator />
			<a href="#" className="wwc:block wwc:py-2 wwc:text-sm">Analytics</a>
		</nav>
	);
}
