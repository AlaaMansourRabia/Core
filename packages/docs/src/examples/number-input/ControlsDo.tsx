/**
 * Show controls for frequently adjusted values.
 */
import {NumberInput} from "@corensystem/coren-ui/number-input";

export function ControlsDo() {
	return <NumberInput value={1} showControls min={1} max={10} className="wwc:w-[120px]" />;
}
