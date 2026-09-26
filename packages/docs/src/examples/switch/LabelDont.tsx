/**
 * Avoid switches without labels or context.
 */
import {Switch} from "@corensystem/coren-ui/switch";

export function LabelDont() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Switch />
			<Switch defaultChecked />
			<Switch />
		</div>
	);
}
