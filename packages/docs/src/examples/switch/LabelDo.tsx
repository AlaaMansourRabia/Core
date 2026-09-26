import {Label} from "@corensystem/coren-ui/label";
/**
 * Position label to clearly indicate what the switch controls.
 */
import {Switch} from "@corensystem/coren-ui/switch";

export function LabelDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:justify-between wwc:max-w-xs">
			<Label htmlFor="switch-label-do">Auto-save drafts</Label>
			<Switch id="switch-label-do" defaultChecked />
		</div>
	);
}
