/**
 * A horizontal separator dividing content sections.
 */
import {Separator} from "@corensystem/coren-ui/separator";

export function Default() {
	return (
		<div className="wwc:w-[200px]">
			<div className="wwc:text-sm wwc:font-medium">Section One</div>
			<Separator className="wwc:my-2" />
			<div className="wwc:text-sm wwc:text-muted-foreground">Section Two</div>
		</div>
	);
}
