/**
 * Use consistent spacing around dividers.
 */
import {Divider} from "@corensystem/coren-ui/divider";

export function SpacingDo() {
	return (
		<div className="wwc:w-[200px]">
			<p className="wwc:text-sm">Section A</p>
			<Divider className="wwc:my-4" />
			<p className="wwc:text-sm">Section B</p>
		</div>
	);
}
