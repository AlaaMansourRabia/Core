import {Label} from "@corensystem/coren-ui/label";
/**
 * Set clear length constraints when needed.
 */
import {Textarea} from "@corensystem/coren-ui/textarea";

export function LengthDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-md">
			<div className="wwc:flex wwc:justify-between">
				<Label htmlFor="textarea-len-do">Summary</Label>
				<span className="wwc:text-xs wwc:text-muted-foreground">Max 500 characters</span>
			</div>
			<Textarea id="textarea-len-do" placeholder="Brief summary..." maxLength={500} />
		</div>
	);
}
