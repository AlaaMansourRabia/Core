/**
 * Avoid unlabeled number inputs.
 */
import {NumberInput} from "@corensystem/coren-ui/number-input";

export function LabelDont() {
	return <NumberInput value={99} className="wwc:w-[150px]" />;
}
