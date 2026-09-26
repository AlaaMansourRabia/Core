/**
 * Separator with centered text divider.
 */
import {Separator} from "@corensystem/coren-ui/separator";

export function WithText() {
	return (
		<div className="wwc:flex wwc:items-center wwc:w-[300px]">
			<Separator className="wwc:flex-1" />
			<span className="wwc:px-3 wwc:text-xs wwc:text-muted-foreground">OR</span>
			<Separator className="wwc:flex-1" />
		</div>
	);
}
