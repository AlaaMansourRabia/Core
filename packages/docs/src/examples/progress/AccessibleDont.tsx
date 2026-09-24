/**
 * Avoid progress bars without accessible labels.
 */
import {Progress} from "@corensystem/coren-ui/progress";

export function AccessibleDont() {
	return <Progress value={75} className="wwc:w-[200px]" />;
}
