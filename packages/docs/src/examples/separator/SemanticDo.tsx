/**
 * Use decorative=false when separator has semantic meaning.
 */
import {Separator} from "@corensystem/coren-ui/separator";

export function SemanticDo() {
	return (
		<nav className="wwc:w-[200px]">
			<a href="#" className="wwc:block wwc:py-2 wwc:text-sm">Dashboard</a>
			<Separator decorative={false} />
			<a href="#" className="wwc:block wwc:py-2 wwc:text-sm">Analytics</a>
		</nav>
	);
}
