/**
 * Keep labels above their inputs for consistent scanning.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function PlacementDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:max-w-sm">
			<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
				<Label htmlFor="placement-do-first">First name</Label>
				<Input id="placement-do-first" placeholder="Jane" />
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
				<Label htmlFor="placement-do-last">Last name</Label>
				<Input id="placement-do-last" placeholder="Doe" />
			</div>
		</div>
	);
}
