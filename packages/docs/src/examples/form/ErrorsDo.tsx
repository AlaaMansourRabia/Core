import {Button} from "@corensystem/coren-ui/button";
/**
 * Show errors inline near the problematic field.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function ErrorsDo() {
	return (
		<form className="wwc:w-full wwc:max-w-sm wwc:space-y-4">
			<div className="wwc:space-y-2">
				<Label htmlFor="form-errors-do-email">Email</Label>
				<Input
					id="form-errors-do-email"
					type="email"
					defaultValue="notanemail"
					className="wwc:border-destructive"
					aria-invalid="true"
					aria-describedby="email-error"
				/>
				<p id="email-error" className="wwc:text-xs wwc:text-destructive">
					Please enter a valid email address.
				</p>
			</div>
			<Button type="submit">Submit</Button>
		</form>
	);
}
