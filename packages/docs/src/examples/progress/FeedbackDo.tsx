/**
 * Show progress percentage for user feedback.
 */
import {Progress} from "@corensystem/coren-ui/progress";

export function FeedbackDo() {
	return (
		<div className="wwc:space-y-2 wwc:w-[200px]">
			<div className="wwc:flex wwc:justify-between wwc:text-sm">
				<span>Downloading</span>
				<span>67%</span>
			</div>
			<Progress value={67} />
		</div>
	);
}
