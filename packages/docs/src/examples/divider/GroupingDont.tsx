/**
 * Avoid excessive dividers between every item.
 */
import {Divider} from "@corensystem/coren-ui/divider";

export function GroupingDont() {
	return (
		<div className="wwc:w-[150px]">
			<div className="wwc:text-sm">Account</div>
			<Divider className="wwc:my-1" />
			<div className="wwc:text-sm">Settings</div>
			<Divider className="wwc:my-1" />
			<div className="wwc:text-sm">Logout</div>
		</div>
	);
}
