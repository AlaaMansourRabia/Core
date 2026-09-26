/**
 * Avoid unlabeled sliders that lack context.
 */
import {Slider} from "@corensystem/coren-ui/slider";

export function LabelDont() {
	return <Slider defaultValue={[1]} min={0.5} max={2} step={0.25} className="wwc:w-[200px]" />;
}
