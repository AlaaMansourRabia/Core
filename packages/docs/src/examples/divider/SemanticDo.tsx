/**
 * Use decorative=false for semantic separation.
 */
import {Divider} from "@corensystem/coren-ui/divider";

export function SemanticDo() {
	return (
		<nav className="wwc:w-[150px]">
			<a href="#" className="wwc:block wwc:py-1 wwc:text-sm">Home</a>
			<Divider decorative={false} className="wwc:my-1" />
			<a href="#" className="wwc:block wwc:py-1 wwc:text-sm">About</a>
		</nav>
	);
}
