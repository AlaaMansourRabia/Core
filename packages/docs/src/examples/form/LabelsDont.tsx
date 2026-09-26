/**
 * Avoid inputs without labels.
 */
import {Input} from "@corensystem/coren-ui/input";

export function LabelsDont() {
	return (
		<div className="wwc:w-full wwc:max-w-sm wwc:space-y-4">
			{/* No labels - accessibility issue and confusing */}
			<Input placeholder="Name" />
			<Input type="email" placeholder="Email" />
		</div>
	);
}
