import {Label} from "@corensystem/coren-ui/label";
/**
 * Avoid tiny textareas for long-form content.
 */
import {Textarea} from "@corensystem/coren-ui/textarea";

export function SizeDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-md">
			<Label htmlFor="textarea-size-dont">Write your essay</Label>
			<Textarea id="textarea-size-dont" placeholder="Enter essay..." className="wwc:min-h-[40px] wwc:h-[40px]" />
		</div>
	);
}
