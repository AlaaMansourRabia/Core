import {Label} from "@corensystem/coren-ui/label";
/**
 * Textarea with accessible label.
 */
import {Textarea} from "@corensystem/coren-ui/textarea";

export function WithLabel() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-md">
			<Label htmlFor="textarea-bio">Bio</Label>
			<Textarea id="textarea-bio" placeholder="Tell us about yourself..." />
		</div>
	);
}
