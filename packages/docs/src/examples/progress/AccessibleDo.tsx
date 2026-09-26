/**
 * Include aria-label for screen readers.
 */
import {Progress} from "@corensystem/coren-ui/progress";

export function AccessibleDo() {
	return <Progress value={75} aria-label="Upload progress: 75%" className="wwc:w-[200px]" />;
}
