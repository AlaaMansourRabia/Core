/**
 * Size textarea to match expected content length.
 */
import {Textarea} from "@corensystem/coren-ui/textarea";
import {Label} from "@corensystem/coren-ui/label";

export function SizeDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-md">
			<Label htmlFor="textarea-size-do">Detailed description</Label>
			<Textarea
				id="textarea-size-do"
				placeholder="Provide a detailed description of the issue..."
				className="wwc:min-h-[120px]"
			/>
		</div>
	);
}
