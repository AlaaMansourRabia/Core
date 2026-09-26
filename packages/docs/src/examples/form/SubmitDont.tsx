import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid allowing double submission or unclear state.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function SubmitDont() {
	return (
		<form className="wwc:w-full wwc:max-w-sm wwc:space-y-4">
			<div className="wwc:space-y-2">
				<Label htmlFor="form-submit-dont-email">Email</Label>
				<Input id="form-submit-dont-email" type="email" placeholder="you@example.com" />
			</div>
			{/* Button stays enabled during submission - allows double clicks */}
			<Button type="submit" className="wwc:w-full">
				Subscribe
			</Button>
			<p className="wwc:text-xs wwc:text-muted-foreground">No loading state - user may click multiple times</p>
		</form>
	);
}
