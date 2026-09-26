/**
 * Avoid separating every single item.
 */
import {Separator} from "@corensystem/coren-ui/separator";

export function GroupingDont() {
	return (
		<div className="wwc:w-[200px]">
			<div className="wwc:text-sm">Account</div>
			<Separator className="wwc:my-2" />
			<div className="wwc:text-sm">Settings</div>
			<Separator className="wwc:my-2" />
			<div className="wwc:text-sm">Logout</div>
		</div>
	);
}
