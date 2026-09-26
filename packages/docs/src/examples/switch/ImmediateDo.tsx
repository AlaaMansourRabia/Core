import {Label} from "@corensystem/coren-ui/label";
/**
 * Use switch for settings that take effect immediately.
 */
import {Switch} from "@corensystem/coren-ui/switch";

export function ImmediateDo() {
	return (
		<div className="wwc:flex wwc:items-center wwc:justify-between wwc:max-w-sm wwc:p-3 wwc:rounded-lg wwc:border">
			<div>
				<Label htmlFor="switch-imm-do" className="wwc:font-medium">
					Notifications
				</Label>
				<p className="wwc:text-sm wwc:text-muted-foreground">Get notified of new messages</p>
			</div>
			<Switch id="switch-imm-do" defaultChecked />
		</div>
	);
}
