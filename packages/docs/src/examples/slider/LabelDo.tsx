import {Label} from "@corensystem/coren-ui/label";
/**
 * Always label sliders to indicate what they control.
 */
import {Slider} from "@corensystem/coren-ui/slider";

export function LabelDo() {
	return (
		<div className="wwc:space-y-2 wwc:w-[200px]">
			<Label>Playback speed</Label>
			<Slider defaultValue={[1]} min={0.5} max={2} step={0.25} />
		</div>
	);
}
