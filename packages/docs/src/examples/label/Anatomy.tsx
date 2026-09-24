import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

/** Anatomy example showing the label text, required mark, and associated control. */
export function Anatomy() {
	return (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:items-center wwc:gap-1.5">
			<Label htmlFor="label-anatomy-field" required>
				Field name
			</Label>
			<Input id="label-anatomy-field" placeholder="Value" />
		</div>
	);
}
