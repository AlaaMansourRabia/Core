/**
 * A vertical separator between inline elements.
 */
import {Separator} from "@corensystem/coren-ui/separator";

export function Vertical() {
	return (
		<div className="wwc:flex wwc:h-5 wwc:items-center wwc:space-x-4 wwc:text-sm">
			<span>Home</span>
			<Separator orientation="vertical" />
			<span>About</span>
			<Separator orientation="vertical" />
			<span>Contact</span>
		</div>
	);
}
