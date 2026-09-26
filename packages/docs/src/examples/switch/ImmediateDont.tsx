import {Button} from "@corensystem/coren-ui/button";
import {Label} from "@corensystem/coren-ui/label";
/**
 * Avoid using switch for options that require form submission.
 */
import {Switch} from "@corensystem/coren-ui/switch";

export function ImmediateDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:max-w-sm wwc:p-3 wwc:rounded-lg wwc:border">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Switch id="switch-imm-dont" />
				<Label htmlFor="switch-imm-dont">Enable feature</Label>
			</div>
			<Button size="sm">Save changes</Button>
		</div>
	);
}
