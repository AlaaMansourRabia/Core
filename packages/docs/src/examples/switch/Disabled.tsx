import {Label} from "@corensystem/coren-ui/label";
/**
 * Disabled switch states.
 */
import {Switch} from "@corensystem/coren-ui/switch";

export function Disabled() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Switch id="switch-disabled-off" disabled />
				<Label htmlFor="switch-disabled-off" className="wwc:text-muted-foreground">
					Disabled off
				</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Switch id="switch-disabled-on" disabled defaultChecked />
				<Label htmlFor="switch-disabled-on" className="wwc:text-muted-foreground">
					Disabled on
				</Label>
			</div>
		</div>
	);
}
