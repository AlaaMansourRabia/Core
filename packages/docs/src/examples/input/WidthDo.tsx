/**
 * Size inputs to match expected content length.
 */
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";

export function WidthDo() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:w-20">
				<Label htmlFor="input-width-zip">ZIP</Label>
				<Input id="input-width-zip" placeholder="12345" maxLength={5} />
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:flex-1">
				<Label htmlFor="input-width-city">City</Label>
				<Input id="input-width-city" placeholder="San Francisco" />
			</div>
		</div>
	);
}
