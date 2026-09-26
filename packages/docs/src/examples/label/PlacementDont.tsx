/**
 * Avoid inconsistent label placements that disrupt form scanning.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function PlacementDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:max-w-sm">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Label htmlFor="placement-dont-first">First</Label>
				<Input id="placement-dont-first" placeholder="Jane" />
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
				<Label htmlFor="placement-dont-last">Last name</Label>
				<Input id="placement-dont-last" placeholder="Doe" />
			</div>
		</div>
	);
}
