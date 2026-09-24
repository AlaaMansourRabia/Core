/**
 * Avoid controls for large number ranges.
 */
import {NumberInput} from "@corensystem/coren-ui/number-input";

export function ControlsDont() {
	return <NumberInput value={50000} showControls className="wwc:w-[120px]" />;
}
