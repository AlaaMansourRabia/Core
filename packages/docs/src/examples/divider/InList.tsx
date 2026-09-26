/**
 * Dividers between menu items.
 */
import {Divider} from "@corensystem/coren-ui/divider";

export function InList() {
	return (
		<div className="wwc:w-[180px] wwc:rounded-md wwc:border wwc:p-2">
			<div className="wwc:px-2 wwc:py-1.5 wwc:text-sm">Edit</div>
			<div className="wwc:px-2 wwc:py-1.5 wwc:text-sm">Duplicate</div>
			<Divider className="wwc:my-1" />
			<div className="wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:text-destructive">Delete</div>
		</div>
	);
}
