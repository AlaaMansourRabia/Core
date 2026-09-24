/**
 * Avoid inconsistent spacing around dividers.
 */
import {Divider} from "@corensystem/coren-ui/divider";

export function SpacingDont() {
	return (
		<div className="wwc:w-[200px]">
			<p className="wwc:text-sm">Section A</p>
			<Divider className="wwc:mt-1 wwc:mb-6" />
			<p className="wwc:text-sm">Section B</p>
		</div>
	);
}
