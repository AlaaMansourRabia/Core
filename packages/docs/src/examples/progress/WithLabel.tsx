/**
 * Progress bar with label and percentage.
 */
import {Progress} from "@corensystem/coren-ui/progress";

export function WithLabel() {
	const value = 45;

	return (
		<div className="wwc:space-y-2 wwc:w-[200px]">
			<div className="wwc:flex wwc:justify-between wwc:text-sm">
				<span>Upload progress</span>
				<span>{value}%</span>
			</div>
			<Progress value={value} />
		</div>
	);
}
