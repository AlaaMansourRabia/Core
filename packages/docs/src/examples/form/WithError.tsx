/**
 * Form with error states.
 */
import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function WithError() {
	return (
		<form className="wwc:w-full wwc:max-w-sm wwc:space-y-4">
			<div className="wwc:space-y-2">
				<Label htmlFor="form-error-email">Email</Label>
				<Input
					id="form-error-email"
					type="email"
					defaultValue="invalid-email"
					className="wwc:border-destructive"
				/>
				<p className="wwc:text-xs wwc:text-destructive">
					Please enter a valid email address.
				</p>
			</div>
			<div className="wwc:space-y-2">
				<Label htmlFor="form-error-password">Password</Label>
				<Input
					id="form-error-password"
					type="password"
					defaultValue="123"
					className="wwc:border-destructive"
				/>
				<p className="wwc:text-xs wwc:text-destructive">
					Password must be at least 8 characters.
				</p>
			</div>
			<Button type="submit" className="wwc:w-full">
				Sign In
			</Button>
		</form>
	);
}
