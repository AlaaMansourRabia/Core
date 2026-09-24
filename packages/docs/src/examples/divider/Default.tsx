/**
 * A horizontal divider separating content.
 */
import {Divider} from "@corensystem/coren-ui/divider";

export function Default() {
	return (
		<div className="wwc:w-[200px]">
			<p className="wwc:text-sm">Above</p>
			<Divider className="wwc:my-2" />
			<p className="wwc:text-sm">Below</p>
		</div>
	);
}
