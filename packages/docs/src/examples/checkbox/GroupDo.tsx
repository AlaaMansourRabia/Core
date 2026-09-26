/**
 * Group related checkboxes with a clear heading.
 */
import {Checkbox} from "@corensystem/coren-ui/checkbox";
import {Label} from "@corensystem/coren-ui/label";

export function GroupDo() {
	return (
		<fieldset className="wwc:space-y-3">
			<legend className="wwc:text-sm wwc:font-medium">Notification preferences</legend>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Checkbox id="checkbox-group-email" defaultChecked />
				<Label htmlFor="checkbox-group-email">Email</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Checkbox id="checkbox-group-sms" />
				<Label htmlFor="checkbox-group-sms">SMS</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Checkbox id="checkbox-group-push" defaultChecked />
				<Label htmlFor="checkbox-group-push">Push notifications</Label>
			</div>
		</fieldset>
	);
}
