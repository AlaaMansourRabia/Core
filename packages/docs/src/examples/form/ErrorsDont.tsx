import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid vague or distant error messages.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";
import {AlertCircle} from "lucide-react";

export function ErrorsDont() {
	return (
		<form className="wwc:w-full wwc:max-w-sm wwc:space-y-4">
			{/* Error at top - not near the field */}
			<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-md wwc:bg-destructive/10 wwc:p-3 wwc:text-sm wwc:text-destructive">
				<AlertCircle className="wwc:h-4 wwc:w-4" />
				There were errors in the form. Please fix them.
			</div>
			<div className="wwc:space-y-2">
				<Label htmlFor="form-errors-dont-email">Email</Label>
				<Input
					id="form-errors-dont-email"
					type="email"
					defaultValue="notanemail"
					// No visual indication this field has the error
				/>
			</div>
			<div className="wwc:space-y-2">
				<Label htmlFor="form-errors-dont-name">Name</Label>
				<Input id="form-errors-dont-name" defaultValue="John" />
			</div>
			<Button type="submit">Submit</Button>
		</form>
	);
}
