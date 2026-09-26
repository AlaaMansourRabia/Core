/**
 * Form with required field indicators.
 */
import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function WithRequired() {
	return (
		<form className="wwc:w-full wwc:max-w-sm wwc:space-y-4">
			<div className="wwc:space-y-2">
				<Label htmlFor="form-req-name" required>
					Full Name
				</Label>
				<Input id="form-req-name" placeholder="Enter your full name" required />
			</div>
			<div className="wwc:space-y-2">
				<Label htmlFor="form-req-email" required>
					Email
				</Label>
				<Input id="form-req-email" type="email" placeholder="Enter your email" required />
			</div>
			<div className="wwc:space-y-2">
				<Label htmlFor="form-req-company">Company</Label>
				<Input id="form-req-company" placeholder="Optional" />
			</div>
			<Button type="submit" className="wwc:w-full">
				Submit
			</Button>
		</form>
	);
}
