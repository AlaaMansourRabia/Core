/**
 * Separators between list items.
 */
import {Separator} from "@corensystem/coren-ui/separator";

export function InList() {
	return (
		<div className="wwc:w-[200px] wwc:rounded-md wwc:border wwc:p-4">
			<div className="wwc:py-2 wwc:text-sm">Profile</div>
			<Separator />
			<div className="wwc:py-2 wwc:text-sm">Settings</div>
			<Separator />
			<div className="wwc:py-2 wwc:text-sm">Logout</div>
		</div>
	);
}
