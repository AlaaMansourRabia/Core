/**
 * Avoid icon buttons without accessible labels.
 */
import {Bold, Italic, Link} from "lucide-react";

export function A11yDont() {
	return (
		<div className="wwc:flex wwc:gap-1 wwc:border wwc:rounded-md wwc:p-1">
			{/* No aria-labels - screen readers can't understand */}
			<button className="wwc:p-2 wwc:rounded wwc:hover:bg-accent">
				<Bold className="wwc:h-4 wwc:w-4" />
			</button>
			<button className="wwc:p-2 wwc:rounded wwc:hover:bg-accent">
				<Italic className="wwc:h-4 wwc:w-4" />
			</button>
			<div className="wwc:w-px wwc:bg-border wwc:mx-1" />
			<button className="wwc:p-2 wwc:rounded wwc:hover:bg-accent">
				<Link className="wwc:h-4 wwc:w-4" />
			</button>
		</div>
	);
}
