/**
 * Indeterminate progress for unknown duration.
 */
import {Progress} from "@corensystem/coren-ui/progress";

export function Indeterminate() {
	return (
		<div className="wwc:space-y-2 wwc:w-[200px]">
			<span className="wwc:text-sm">Loading...</span>
			<Progress className="wwc:animate-pulse" />
		</div>
	);
}
