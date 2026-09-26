import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

/** The label dims when its peer input is disabled. The input must be a preceding sibling with the peer class; flex-col-reverse keeps the label visually on top. */
export function PeerDisabled() {
	return (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:gap-1.5">
			<div className="wwc:flex wwc:flex-col-reverse wwc:gap-1.5">
				<Input id="label-peer-disabled" className="wwc:peer" placeholder="Cannot edit" disabled />
				<Label htmlFor="label-peer-disabled">Disabled field</Label>
			</div>
		</div>
	);
}
