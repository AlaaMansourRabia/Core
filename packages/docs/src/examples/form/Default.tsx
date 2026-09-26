/**
 * Basic form with validation.
 */
import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function Default() {
	return (
		<form className="wwc:w-full wwc:max-w-sm wwc:space-y-4">
			<div className="wwc:space-y-2">
				<Label htmlFor="form-default-email">Email</Label>
				<Input id="form-default-email" type="email" placeholder="Enter your email" />
			</div>
			<div className="wwc:space-y-2">
				<Label htmlFor="form-default-password">Password</Label>
				<Input id="form-default-password" type="password" placeholder="Enter your password" />
			</div>
			<Button type="submit" className="wwc:w-full">
				Sign In
			</Button>
		</form>
	);
}
