/**
 * Avoid sliders without value indication.
 */
import {Slider} from "@corensystem/coren-ui/slider";
import {Label} from "@corensystem/coren-ui/label";

export function FeedbackDont() {
	return (
		<div className="wwc:space-y-2 wwc:w-[200px]">
			<Label>Brightness</Label>
			<Slider defaultValue={[30]} max={100} />
		</div>
	);
}
