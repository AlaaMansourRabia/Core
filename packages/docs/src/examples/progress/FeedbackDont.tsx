/**
 * Avoid progress bars without context or percentage.
 */
import {Progress} from "@corensystem/coren-ui/progress";

export function FeedbackDont() {
	return <Progress value={67} className="wwc:w-[200px]" />;
}
