/**
 * Use dividers to separate logical groups.
 */
import {Divider} from "@corensystem/coren-ui/divider";

export function GroupingDo() {
	return (
		<div className="wwc:w-[150px] wwc:space-y-1">
			<div className="wwc:text-sm">Account</div>
			<div className="wwc:text-sm">Settings</div>
			<Divider className="wwc:my-2" />
			<div className="wwc:text-sm wwc:text-destructive">Logout</div>
		</div>
	);
}
