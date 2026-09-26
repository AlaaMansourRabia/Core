/**
 * Use helpful placeholder text as a hint.
 */
import {Textarea} from "@corensystem/coren-ui/textarea";
import {Label} from "@corensystem/coren-ui/label";

export function PlaceholderDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-md">
			<Label htmlFor="textarea-ph-do">Feedback</Label>
			<Textarea
				id="textarea-ph-do"
				placeholder="What did you like? What could be improved?"
			/>
		</div>
	);
}
