/**
 * Avoid using switch for multi-state options (use Select or RadioGroup).
 */
import {Switch} from "@corensystem/coren-ui/switch";
import {Label} from "@corensystem/coren-ui/label";

export function BinaryDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Switch id="switch-binary-dont-1" defaultChecked />
				<Label htmlFor="switch-binary-dont-1">Low priority</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Switch id="switch-binary-dont-2" />
				<Label htmlFor="switch-binary-dont-2">High priority</Label>
			</div>
		</div>
	);
}
