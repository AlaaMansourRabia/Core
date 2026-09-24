/**
 * Use semantic tones to indicate progress state.
 */
import {Progress} from "@corensystem/coren-ui/progress";

export function ToneDo() {
	return (
		<div className="wwc:space-y-2 wwc:w-[200px]">
			<span className="wwc:text-sm wwc:text-green-600">Complete!</span>
			<Progress value={100} tone="success" />
		</div>
	);
}
