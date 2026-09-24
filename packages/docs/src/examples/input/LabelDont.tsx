/**
 * Avoid placeholder-only inputs without visible labels.
 */
import {Input} from "@corensystem/coren-ui/input";

export function LabelDont() {
	return (
		<div className="wwc:max-w-sm">
			<Input placeholder="Enter your full name here" />
		</div>
	);
}
