/**
 * Divider with centered text.
 */
import {Divider} from "@corensystem/coren-ui/divider";

export function WithText() {
	return (
		<div className="wwc:flex wwc:items-center wwc:w-[300px]">
			<Divider className="wwc:flex-1" />
			<span className="wwc:px-3 wwc:text-xs wwc:text-muted-foreground">OR</span>
			<Divider className="wwc:flex-1" />
		</div>
	);
}
