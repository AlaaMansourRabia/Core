/**
 * Use separators to group related content.
 */
import {Separator} from "@corensystem/coren-ui/separator";

export function GroupingDo() {
	return (
		<div className="wwc:w-[200px] wwc:space-y-2">
			<div className="wwc:text-sm">Account</div>
			<div className="wwc:text-sm">Settings</div>
			<Separator className="wwc:my-2" />
			<div className="wwc:text-sm wwc:text-destructive">Logout</div>
		</div>
	);
}
