/**
 * Avoid using danger tone for normal progress.
 */
import {Progress} from "@corensystem/coren-ui/progress";

export function ToneDont() {
	return (
		<div className="wwc:space-y-2 wwc:w-[200px]">
			<span className="wwc:text-sm">Uploading file...</span>
			<Progress value={40} tone="danger" />
		</div>
	);
}
