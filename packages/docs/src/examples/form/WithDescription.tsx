/**
 * Form fields with helper descriptions.
 */
import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function WithDescription() {
	return (
		<form className="wwc:w-full wwc:max-w-sm wwc:space-y-6">
			<div className="wwc:space-y-2">
				<Label htmlFor="form-desc-username">Username</Label>
				<Input id="form-desc-username" placeholder="Enter username" />
				<p className="wwc:text-xs wwc:text-muted-foreground">This will be your public display name.</p>
			</div>
			<div className="wwc:space-y-2">
				<Label htmlFor="form-desc-bio">Bio</Label>
				<Input id="form-desc-bio" placeholder="Tell us about yourself" />
				<p className="wwc:text-xs wwc:text-muted-foreground">Maximum 160 characters.</p>
			</div>
			<Button type="submit">Save Changes</Button>
		</form>
	);
}
