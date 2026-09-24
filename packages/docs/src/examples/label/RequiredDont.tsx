import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

/** DON'T: Avoid typing asterisks manually. Use the required prop for consistent styling. */
export function RequiredDont() {
	return (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:items-center wwc:gap-1.5">
			<Label htmlFor="label-required-dont">
				Full name <span className="wwc:text-destructive">*</span>
			</Label>
			<Input id="label-required-dont" placeholder="John Doe" />
		</div>
	);
}
